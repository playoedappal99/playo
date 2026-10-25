import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID || "rzp_live_Ts0qA8xL0fOFHL";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "UXwSzkOr7l4EeIfUrXYH3Rgk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = "INR",
      receipt: customReceipt,
      customerName = "Valued Customer",
      phone = "9999999999",
      email = "customer@playoedappal.in",
      deliveryAddress = "Playo Edappal Delivery Address",
      shippingOption = "Indian Post (Door-to-Door Delivery)",
      items,
    } = body;

    // Strict Sanitization
    const cleanName = sanitizeInput(customerName, 100) || "Valued Customer";
    const cleanPhone = sanitizeInput(phone, 20).replace(/\D/g, "") || "9999999999";
    const cleanEmail = sanitizeInput(email, 120) || "customer@playoedappal.in";
    const cleanAddress = sanitizeInput(deliveryAddress, 500) || "Playo Edappal Delivery";

    let amountInPaise = 0;
    let subtotal = 0;
    let totalDeliveryFee = 0;
    let discount = 0;
    const validatedItems: any[] = [];

    // Case 1: Items array provided -> Authoritative verification against MongoDB Atlas (Anti-tamper)
    if (Array.isArray(items) && items.length > 0) {
      const db = await getDatabase();

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
          imageUrl: prod.imageUrl || item.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
          specs: item.specs || (prod.scale ? `Scale: ${prod.scale}` : "Standard"),
        });

        subtotal += verifiedPrice * qty;
        totalDeliveryFee += verifiedDeliveryFee * qty;
      }

      // Active discount check
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
      amountInPaise = Math.round(finalAmount * 100);
    } else if (typeof amount === "number" || (typeof amount === "string" && !isNaN(Number(amount)))) {
      // Case 2: Direct amount passed (e.g. standard checkout test)
      const parsedAmount = Number(amount);
      // If amount >= 100 and likely in paise already, or in rupees
      amountInPaise = Math.round(parsedAmount);
      subtotal = Math.round(amountInPaise / 100);
    } else {
      return NextResponse.json(
        { success: false, error: "Either cart items or a valid total amount is required." },
        { status: 400 }
      );
    }

    // Minimum amount validation: 100 paise = 1 INR
    if (amountInPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum order amount must be at least ₹1.00 (100 paise).",
        },
        { status: 400 }
      );
    }

    const receipt = customReceipt || `rcpt_${Date.now().toString().slice(-8)}`;

    // Call Razorpay API to generate live order
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;

    // Compact item summary for notes (max 250 chars)
    const itemsSummary = validatedItems.length > 0
      ? validatedItems.map(i => `${i.name} (x${i.quantity})`).join(", ").slice(0, 240)
      : "Store Order";

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          store: "Playo Edappal",
          customerName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          deliveryAddress: cleanAddress.slice(0, 240),
          shippingOption: shippingOption.slice(0, 100),
          itemsSummary,
          deliveryFee: totalDeliveryFee.toString(),
          discount: discount.toString(),
        },
      }),
    });

    const rzpData = await rzpResponse.json();

    if (!rzpResponse.ok || !rzpData.id) {
      console.error("Razorpay order creation error:", rzpData);
      return NextResponse.json(
        {
          success: false,
          error: rzpData.error?.description || "Failed to initialize live payment with Razorpay.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: rzpData.id,
      order_id: rzpData.id, // standard alias
      amount: rzpData.amount,
      currency: rzpData.currency,
      keyId: RAZORPAY_KEY_ID,
      key: RAZORPAY_KEY_ID,
      receipt: rzpData.receipt,
      subtotal,
      discount,
      deliveryFee: totalDeliveryFee,
      totalAmount: Math.round(amountInPaise / 100),
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
