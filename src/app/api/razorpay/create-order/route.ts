import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID || "rzp_test_TrhFXfztkQI4Di";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "GngcuoTv0ntWWvn1BDL3wOA1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      deliveryAddress,
      items,
    } = body;

    // Strict Sanitization
    const cleanName = sanitizeInput(customerName, 100);
    const cleanPhone = sanitizeInput(phone, 20).replace(/\D/g, "");
    const cleanEmail = sanitizeInput(email, 120);
    const cleanAddress = sanitizeInput(deliveryAddress, 500);

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Valid customer full name is required" },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    if (!cleanAddress || cleanAddress.length < 10) {
      return NextResponse.json(
        { success: false, error: "Complete delivery address with PIN code is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Calculate Authoritative Price & Delivery Fee directly from MongoDB (Anti-Tampering)
    let subtotal = 0;
    let totalDeliveryFee = 0;
    const validatedItems: any[] = [];

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

      const availableStock = typeof prod.stockCount === "number" ? prod.stockCount : 0;
      if (availableStock < qty) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${prod.name}". Requested: ${qty}, Available: ${availableStock}`,
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
        price: verifiedPrice,
        deliveryFee: verifiedDeliveryFee,
        quantity: qty,
      });

      subtotal += verifiedPrice * qty;
      totalDeliveryFee += verifiedDeliveryFee * qty;
    }

    // Active discount from MongoDB
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

    const finalAmount = Math.max(0, subtotal - discount + totalDeliveryFee);
    const amountInPaise = Math.round(finalAmount * 100);

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order total amount." },
        { status: 400 }
      );
    }

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;

    // Call Razorpay API to generate order
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          store: "Playo Edappal",
          customerName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          deliveryAddress: cleanAddress,
        },
      }),
    });

    const rzpData = await rzpResponse.json();

    if (!rzpResponse.ok || !rzpData.id) {
      console.error("Razorpay order creation error:", rzpData);
      return NextResponse.json(
        {
          success: false,
          error: rzpData.error?.description || "Failed to initialize payment with Razorpay.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      keyId: RAZORPAY_KEY_ID,
      subtotal,
      discount,
      deliveryFee: totalDeliveryFee,
      totalAmount: finalAmount,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
