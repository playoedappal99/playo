import { NextRequest, NextResponse } from "next/server";
import { createOrGetOrder } from "@/lib/order-service";
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

    // Only process payment captured or order paid events
    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const razorpayPaymentId = paymentEntity?.id;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

      if (!razorpayPaymentId) {
        return NextResponse.json({ status: "ok", message: "Ignored event without payment ID" });
      }

      const amountInPaise = Number(paymentEntity?.amount || orderEntity?.amount_paid || 0);
      const totalRupees = Math.round(amountInPaise / 100);

      const notes = {
        ...(orderEntity?.notes || {}),
        ...(paymentEntity?.notes || {}),
      };

      const cleanName = notes.customerName || paymentEntity?.email || "Valued Customer";
      const cleanPhone = notes.phone || paymentEntity?.contact || "9999999999";
      const cleanEmail = notes.email || paymentEntity?.email || "customer@playoedappal.in";
      const cleanAddress = notes.deliveryAddress || "Showroom Pickup / Standard Delivery";
      const shippingOption = notes.shippingOption || "Indian Post (Door-to-Door Delivery)";
      const itemsSummary = notes.itemsSummary || "Toy Order via Razorpay";
      const deliveryFee = Number(notes.deliveryFee || 0);
      const discount = Number(notes.discount || 0);

      // Concurrency-safe atomic order creation or retrieval
      const { order, isNew } = await createOrGetOrder({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
        customerName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        deliveryAddress: cleanAddress,
        shippingOption,
        deliveryInstructions: "Auto-confirmed via Razorpay Webhook",
        total: totalRupees,
        deliveryFee,
        discount,
        source: "webhook",
        items: [
          {
            id: `item-${razorpayPaymentId}`,
            name: itemsSummary,
            category: "General",
            imageUrl: "/images/catalog/porsche-drift-rc.jpg",
            price: totalRupees,
            quantity: 1,
            specs: "Live Verified Order",
          },
        ],
      });

      console.log(`Webhook handled order #${order.id} (isNew: ${isNew})`);
      return NextResponse.json({
        status: "ok",
        orderId: order.id,
        isNew,
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
