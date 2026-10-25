import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/security";
import { createOrGetOrder } from "@/lib/order-service";
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

    // 2. Strict Sanitization
    const cleanName = sanitizeInput(customerName, 100) || "Valued Customer";
    const rawPhone = (phone || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.slice(-10) || "9999999999";
    const cleanEmail = sanitizeInput(email, 120) || "customer@playoedappal.in";
    const cleanAddress = sanitizeInput(deliveryAddress, 500) || "Edappal, Malappuram";
    const cleanInstructions = sanitizeInput(deliveryInstructions, 500);

    // 3. Atomically create or retrieve order (Anti-Duplicate Engine)
    const { order, isNew } = await createOrGetOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      customerName: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      deliveryAddress: cleanAddress,
      shippingOption,
      deliveryInstructions: cleanInstructions,
      items,
      source: "client",
    });

    const response = NextResponse.json(
      {
        success: true,
        order,
        message: isNew
          ? "Payment verified & order placed successfully."
          : "Order already verified and confirmed.",
      },
      { status: isNew ? 201 : 200 }
    );

    // Set device tracking cookies for seamless tracking in /my-orders
    const existingCookie = req.cookies.get("playo_placed_order_ids")?.value;
    const cookieOrders = existingCookie ? existingCookie.split(",").map(s => s.trim()) : [];
    if (!cookieOrders.includes(order.id)) {
      cookieOrders.unshift(order.id);
    }

    response.cookies.set("playo_placed_order_ids", cookieOrders.join(","), {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set("playo_customer_phone", cleanPhone, {
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
