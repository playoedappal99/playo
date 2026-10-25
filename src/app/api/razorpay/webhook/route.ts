import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { sendEmail, generateOrderEmailHtml } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "playoedappal_live_webhook_secret_2026";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.warn("Razorpay Webhook: Missing x-razorpay-signature header");
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // 1. Cryptographically Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Razorpay Webhook: Signature mismatch!", {
        received: signature,
        expected: expectedSignature,
      });
      return NextResponse.json(
        { success: false, error: "Invalid cryptographic webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`Razorpay Webhook received event: "${event}"`);

    const db = await getDatabase();

    // 2. Handle Payment Success / Order Paid
    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const razorpayPaymentId = paymentEntity?.id || "";
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || "";
      const amountInPaise = Number(paymentEntity?.amount || orderEntity?.amount_paid || 0);
      const totalRupees = Math.round(amountInPaise / 100);

      const notes = {
        ...(orderEntity?.notes || {}),
        ...(paymentEntity?.notes || {}),
      };

      // Check if order was already recorded by client-side verification
      const existingOrder = await db.collection("orders").findOne({
        $or: [
          { razorpayPaymentId: razorpayPaymentId },
          { razorpayOrderId: razorpayOrderId },
        ],
      });

      if (existingOrder) {
        // Ensure status is marked Paid
        if (existingOrder.paymentStatus !== "Paid") {
          await db.collection("orders").updateOne(
            { _id: existingOrder._id },
            { $set: { paymentStatus: "Paid", status: "Pending", updatedAt: new Date() } }
          );
        }
        return NextResponse.json({
          status: "ok",
          message: "Order was already recorded and confirmed.",
          orderId: existingOrder.id,
        });
      }

      // Customer closed browser/app before client redirect completed!
      // AUTO-RECOVER ORDER FROM RAZORPAY WEBHOOK DATA:
      const cleanName = notes.customerName || paymentEntity?.email || "Customer";
      const cleanPhone = notes.phone || paymentEntity?.contact || "9999999999";
      const cleanEmail = notes.email || paymentEntity?.email || "customer@playoedappal.in";
      const cleanAddress = notes.deliveryAddress || "Showroom Pickup / Standard Delivery";
      const shippingOption = notes.shippingOption || "Indian Post (Door-to-Door Delivery)";
      const itemsSummary = notes.itemsSummary || "Toy Order via Razorpay";
      const deliveryFee = Number(notes.deliveryFee || 0);
      const discount = Number(notes.discount || 0);

      const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;

      const recoveredOrder = {
        id: newOrderId,
        orderDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        createdAt: new Date(),
        customerName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        deliveryAddress: cleanAddress,
        shippingOption,
        deliveryInstructions: "Order automatically captured & confirmed via Live Razorpay Webhook",
        status: "Pending",
        estimatedDelivery: "2-3 Business Days",
        courier: shippingOption.includes("Speed") ? "Speed & Safe Courier Service" : "India Post Doorstep Express",
        trackingNumber: `IP${Date.now().toString().slice(-8)}IN`,
        carrierLocation: "Payment captured via Razorpay Live - awaiting showroom dispatch",
        paymentMethod: "Razorpay (Live Standard Checkout)",
        paymentStatus: "Paid",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
        autoRecoveredViaWebhook: true,
        items: [
          {
            id: `item-${Date.now()}`,
            name: itemsSummary,
            price: totalRupees,
            quantity: 1,
            specs: "Live Verified Order",
          },
        ],
        subtotal: totalRupees,
        discount,
        deliveryFee,
        total: totalRupees,
      };

      await db.collection("orders").insertOne(recoveredOrder);

      // Create Admin Dashboard notification
      await db.collection("notifications").insertOne({
        id: `notif-webhook-${newOrderId}`,
        type: "order",
        title: "Live Razorpay Order Confirmed (Webhook)",
        desc: `Order #${newOrderId} for ₹${totalRupees.toLocaleString("en-IN")} received from ${cleanName} (Payment ID: ${razorpayPaymentId}).`,
        time: "Just now",
        read: false,
        createdAt: new Date(),
      });

      // Dispatch Email Notification to Store Admin
      try {
        const adminEmail = process.env.ADMIN_EMAIL || "playoedappal99@gmail.com";
        const emailHtml = generateOrderEmailHtml(recoveredOrder);
        sendEmail({
          to: adminEmail,
          subject: `🛒 New Order #${newOrderId} Received via Webhook - ₹${totalRupees.toLocaleString("en-IN")} from ${cleanName}`,
          html: emailHtml,
          text: `Playo Edappal: New Order #${newOrderId} auto-recovered via Webhook for ₹${totalRupees} from ${cleanName}.`,
        }).catch((err) => {
          console.warn("Webhook order email send failed:", err);
        });
      } catch (emailErr) {
        console.warn("Could not send webhook order email:", emailErr);
      }

      console.log(`Successfully auto-recovered and created order #${newOrderId} via Webhook.`);
      return NextResponse.json({
        status: "ok",
        message: "Order created and confirmed via webhook",
        orderId: newOrderId,
      });
    }

    if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      console.warn("Razorpay payment failed:", {
        id: payment?.id,
        orderId: payment?.order_id,
        reason: payment?.error_description,
      });
      return NextResponse.json({ status: "ok", message: "Failure logged" });
    }

    // Acknowledge other events
    return NextResponse.json({ status: "ok", received: true });
  } catch (err: any) {
    console.error("Razorpay webhook handler error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
