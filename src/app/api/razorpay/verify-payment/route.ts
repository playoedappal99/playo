import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { sanitizeInput } from "@/lib/security";
import { sendEmail, generateOrderEmailHtml } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "UXwSzkOr7l4EeIfUrXYH3Rgk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      phone,
      email,
      deliveryAddress,
      shippingOption,
      deliveryInstructions,
      items,
    } = body;

    // 1. Strict Cryptographic Signature Verification (Anti-Fraud)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Incomplete payment verification payload from payment gateway.",
        },
        { status: 400 }
      );
    }

    const payloadToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(payloadToSign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch!", {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Payment authentication failed: Invalid cryptographic signature. Order was not placed.",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // 2. Prevent Double Spending / Replay Attacks
    const existingOrder = await db.collection("orders").findOne({
      $or: [
        { razorpayPaymentId: razorpay_payment_id },
        { razorpayOrderId: razorpay_order_id },
      ],
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        order: {
          ...existingOrder,
          _id: existingOrder._id.toString(),
          id: existingOrder.id || existingOrder._id.toString(),
        },
        message: "Order already verified and placed.",
      });
    }

    // 3. Strict Sanitization & Backend Validation
    const cleanName = sanitizeInput(customerName, 100);
    const cleanPhone = sanitizeInput(phone, 20).replace(/\D/g, "");
    const cleanEmail = sanitizeInput(email, 120);
    const cleanAddress = sanitizeInput(deliveryAddress, 500);
    const cleanInstructions = sanitizeInput(deliveryInstructions, 500);

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Valid customer name required" },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit mobile number required" },
        { status: 400 }
      );
    }

    if (!cleanAddress || cleanAddress.length < 10) {
      return NextResponse.json(
        { success: false, error: "Complete delivery address required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required in the order" },
        { status: 400 }
      );
    }

    // 4. Validate Products & Calculate Totals from MongoDB
    const validatedItems: any[] = [];
    let subtotal = 0;
    let totalDeliveryFee = 0;

    for (const item of items) {
      const qty = Math.floor(Number(item.quantity || item.qty || 1));
      if (isNaN(qty) || qty < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for item ${item.name || item.id}` },
          { status: 400 }
        );
      }

      const prod = await db.collection("products").findOne({
        $or: [{ id: item.id }, { name: item.name }],
      });

      if (!prod) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${item.name || item.id}" not found in showroom inventory.`,
          },
          { status: 400 }
        );
      }

      const verifiedPrice = Number(prod.price) || 0;
      const verifiedDeliveryFee =
        typeof prod.deliveryFee === "number" ? Math.max(0, prod.deliveryFee) : 0;

      validatedItems.push({
        id: prod.id,
        name: prod.name,
        category: prod.category || prod.categorySlug,
        imageUrl: prod.imageUrl || prod.images?.[0] || "/images/catalog/porsche-drift-rc.jpg",
        price: verifiedPrice,
        deliveryFee: verifiedDeliveryFee,
        quantity: qty,
        specs: item.specs || (prod.scale ? `Scale: ${prod.scale}` : "Standard"),
      });

      subtotal += verifiedPrice * qty;
      totalDeliveryFee += verifiedDeliveryFee * qty;
    }

    // Active discount from MongoDB rules
    let discount = 0;
    try {
      const activeOffers = await db
        .collection("offers")
        .find({ status: "Active", minAmount: { $lte: subtotal } })
        .sort({ discountPercentage: -1 })
        .toArray();

      if (activeOffers.length > 0) {
        const bestOffer = activeOffers[0];
        const pct = Math.min(100, Math.max(0, Number(bestOffer.discountPercentage) || 0));
        discount = Math.round((subtotal * pct) / 100);
      }
    } catch (e) {
      console.warn("Could not calculate active offer discount:", e);
    }

    const total = Math.max(0, subtotal - discount + totalDeliveryFee);
    const orderId = `PLY-${Date.now().toString().slice(-6)}`;

    // 5. Concurrency-Safe Atomic Stock Reservation
    const decrementedProducts: { id: string; quantity: number }[] = [];
    for (const it of validatedItems) {
      const reserveResult = await db.collection("products").updateOne(
        { id: it.id, stockCount: { $gte: it.quantity } },
        {
          $inc: { stockCount: -it.quantity, soldCount: it.quantity },
          $set: { updatedAt: new Date() },
        }
      );

      if (reserveResult.modifiedCount === 0) {
        // Rollback any earlier products decremented in this batch
        for (const rolled of decrementedProducts) {
          await db.collection("products").updateOne(
            { id: rolled.id },
            { $inc: { stockCount: rolled.quantity, soldCount: -rolled.quantity } }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: `Could not reserve stock for "${it.name}". Limited showroom units available.`,
          },
          { status: 409 }
        );
      }

      decrementedProducts.push({ id: it.id, quantity: it.quantity });
    }

    // 6. Update inStock flag & Trigger Showroom Stock Notifications
    for (const it of validatedItems) {
      const updatedProd = await db.collection("products").findOne({ id: it.id });
      if (updatedProd) {
        const newStock = typeof updatedProd.stockCount === "number" ? updatedProd.stockCount : 0;
        await db.collection("products").updateOne(
          { id: it.id },
          { $set: { inStock: newStock > 0 } }
        );

        if (newStock <= 0) {
          await db.collection("notifications").insertOne({
            id: `notif-oos-${it.id}-${Date.now()}`,
            type: "stock",
            title: "Out of Stock Alert",
            desc: `"${updatedProd.name}" is now OUT OF STOCK (0 units remaining).`,
            time: "Just now",
            read: false,
            createdAt: new Date(),
          });
        } else if (newStock < 3) {
          await db.collection("notifications").insertOne({
            id: `notif-low-${it.id}-${Date.now()}`,
            type: "stock",
            title: "Low Stock Alert",
            desc: `"${updatedProd.name}" has only ${newStock} unit(s) remaining in showroom inventory.`,
            time: "Just now",
            read: false,
            createdAt: new Date(),
          });
        }
      }
    }

    // 7. Insert Official Order in MongoDB
    const newOrder = {
      id: orderId,
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
      shippingOption:
        shippingOption === "speed_and_safe"
          ? "Speed & Safe Courier Service"
          : "Indian Post (Door-to-Door Delivery)",
      deliveryInstructions: cleanInstructions,
      status: "Pending",
      estimatedDelivery: "2-3 Business Days",
      courier:
        shippingOption === "speed_and_safe"
          ? "Speed & Safe Courier Service"
          : "India Post Doorstep Express",
      trackingNumber: `IP${Date.now().toString().slice(-8)}IN`,
      carrierLocation: "Order verified via Razorpay - awaiting showroom dispatch",
      paymentMethod: "Razorpay (UPI / Cards / NetBanking)",
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      items: validatedItems,
      subtotal,
      discount,
      deliveryFee: totalDeliveryFee,
      total,
    };

    const orderResult = await db.collection("orders").insertOne(newOrder);

    // 8. Add Live Notification for Admin Dashboard
    await db.collection("notifications").insertOne({
      id: `notif-order-${orderId}`,
      type: "order",
      title: "New Paid Order via Razorpay",
      desc: `Order #${orderId} received from ${cleanName} for ₹${total.toLocaleString("en-IN")} via Razorpay (${razorpay_payment_id}).`,
      time: "Just now",
      read: false,
      createdAt: new Date(),
    });

    // 9. Instant Dispatch Email to Showroom Admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "playoedappal99@gmail.com";
      const emailHtml = generateOrderEmailHtml(newOrder);
      sendEmail({
        to: adminEmail,
        subject: `🛒 New Order #${orderId} Received - ₹${total.toLocaleString("en-IN")} from ${cleanName}`,
        html: emailHtml,
        text: `Playo Edappal: New Order #${orderId} received from ${cleanName} (+91 ${cleanPhone}). Total: ₹${total}. Delivery to: ${cleanAddress}`,
      }).catch((err) => {
        console.warn("Background order email alert failed to send:", err);
      });
    } catch (emailErr) {
      console.warn("Failed to generate order email:", emailErr);
    }

    const response = NextResponse.json(
      {
        success: true,
        order: { ...newOrder, _id: orderResult.insertedId.toString() },
      },
      { status: 201 }
    );

    // Set device cookie for order tracking
    const existingCookie = req.cookies.get("playo_placed_order_ids")?.value;
    const newCookieVal = existingCookie ? `${existingCookie},${orderId}` : orderId;
    response.cookies.set("playo_placed_order_ids", newCookieVal, {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
