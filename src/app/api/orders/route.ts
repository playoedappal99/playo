import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { escapeRegex, sanitizeInput, validateAdminAuth } from "@/lib/security";
import { syncRazorpayOrders, createOrGetOrder } from "@/lib/order-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    const phone = searchParams.get("phone");
    const sync = searchParams.get("sync");

    const isAdmin = validateAdminAuth(req);
    const db = await getDatabase();

    // Admin-triggered or explicit live Razorpay auto-sync
    if (isAdmin && sync === "true") {
      try {
        await syncRazorpayOrders({ limit: 50 });
      } catch (e) {
        console.warn("Admin sync error:", e);
      }
    }

    const query: any = {};

    if (isAdmin) {
      if (status && status !== "ALL") {
        query.status = status;
      }
      if (id && id.trim()) {
        const cleanId = id.trim();
        query.$or = [
          { id: cleanId },
          { razorpayPaymentId: cleanId },
          { razorpayOrderId: cleanId },
          { trackingNumber: cleanId },
        ];
      } else if (phone && phone.trim()) {
        const raw = phone.trim().replace(/\D/g, "");
        const last10 = raw.slice(-10);
        if (last10.length === 10) {
          query.$or = [
            { phone: last10 },
            { phone: `+91${last10}` },
            { phone: `91${last10}` },
            { phone: new RegExp(`${last10}$`) },
          ];
        } else {
          query.phone = raw;
        }
      } else if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        const regex = new RegExp(safeSearch, "i");
        query.$or = [
          { id: regex },
          { razorpayPaymentId: regex },
          { razorpayOrderId: regex },
          { customerName: regex },
          { phone: regex },
          { deliveryAddress: regex },
          { "items.name": regex },
        ];
      }
    } else {
      // Non-admin device-isolated queries: Only return orders placed by this device or exact order token
      if (ids && ids.trim()) {
        const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
        if (idList.length > 0) {
          query.$or = [
            { id: { $in: idList } },
            { razorpayPaymentId: { $in: idList } },
            { razorpayOrderId: { $in: idList } },
          ];
        } else {
          return NextResponse.json({ success: true, count: 0, orders: [] });
        }
      } else if (id && id.trim()) {
        const cleanId = id.trim();
        query.$or = [
          { id: cleanId },
          { razorpayPaymentId: cleanId },
          { razorpayOrderId: cleanId },
          { trackingNumber: cleanId },
        ];

        // Check if exists in DB; if not and looks like a Razorpay Payment ID, auto-sync live
        const preCheck = await db.collection("orders").findOne(query);
        if (!preCheck && (cleanId.startsWith("pay_") || cleanId.startsWith("order_"))) {
          try {
            await syncRazorpayOrders({ paymentId: cleanId });
          } catch {}
        }
      } else if (phone && phone.trim()) {
        const raw = phone.trim().replace(/\D/g, "");
        const last10 = raw.slice(-10);
        if (last10.length === 10) {
          query.$or = [
            { phone: last10 },
            { phone: `+91${last10}` },
            { phone: `91${last10}` },
            { phone: new RegExp(`${last10}$`) },
          ];

          // Check if exists in DB; if not, check live Razorpay to auto-recover customer order
          const preCheck = await db.collection("orders").findOne(query);
          if (!preCheck) {
            try {
              await syncRazorpayOrders({ phone: last10, limit: 30 });
            } catch {}
          }
        } else {
          return NextResponse.json({ success: true, count: 0, orders: [] });
        }
      } else {
        // Fallback: check device cookies
        const placedCookie = req.cookies.get("playo_placed_order_ids")?.value;
        const phoneCookie = req.cookies.get("playo_customer_phone")?.value;

        if (placedCookie) {
          const orderIds = placedCookie.split(",").map((s) => s.trim()).filter(Boolean);
          if (orderIds.length > 0) {
            query.$or = [
              { id: { $in: orderIds } },
              { razorpayPaymentId: { $in: orderIds } },
            ];
          }
        } else if (phoneCookie) {
          const last10 = phoneCookie.replace(/\D/g, "").slice(-10);
          if (last10.length === 10) {
            query.$or = [
              { phone: last10 },
              { phone: `+91${last10}` },
              { phone: new RegExp(`${last10}$`) },
            ];
          }
        } else {
          // Never dump all orders to anonymous requests
          return NextResponse.json({ success: true, count: 0, orders: [] });
        }
      }
    }

    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = orders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      id: o.id || o._id.toString(),
    }));

    // Deduplication Engine: Never show the same order twice in Admin or My Orders
    const seen = new Set<string>();
    const deduplicated: any[] = [];
    const duplicateIdsToDelete: string[] = [];

    for (const ord of formatted) {
      const dedupKey = ord.razorpayPaymentId
        ? `pay_${ord.razorpayPaymentId}`
        : ord.razorpayOrderId
        ? `order_${ord.razorpayOrderId}`
        : `id_${ord.id}`;

      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        deduplicated.push(ord);
      } else if (isAdmin && ord._id) {
        duplicateIdsToDelete.push(ord._id);
      }
    }

    // Auto-clean redundant duplicate documents in the background
    if (isAdmin && duplicateIdsToDelete.length > 0) {
      (async () => {
        try {
          const { ObjectId } = await import("mongodb");
          const objIds = duplicateIdsToDelete
            .filter((i) => ObjectId.isValid(i))
            .map((i) => new ObjectId(i));
          if (objIds.length > 0) {
            await db.collection("orders").deleteMany({ _id: { $in: objIds } });
          }
        } catch (cleanErr) {
          console.warn("Duplicate cleanup notice:", cleanErr);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      count: deduplicated.length,
      orders: deduplicated,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      deliveryAddress,
      shippingOption,
      deliveryInstructions,
      paymentMethod = "Razorpay (UPI / NetBanking)",
      items,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    // Strict Sanitization
    const cleanName = sanitizeInput(customerName, 100);
    const cleanPhone = sanitizeInput(phone, 20).replace(/\D/g, "");
    const cleanEmail = sanitizeInput(email, 120);
    const cleanAddress = sanitizeInput(deliveryAddress, 500);
    const cleanInstructions = sanitizeInput(deliveryInstructions, 500);

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
        { success: false, error: "At least one item is required in the order" },
        { status: 400 }
      );
    }

    // Atomic order creation via order service
    const { order, isNew } = await createOrGetOrder({
      razorpayPaymentId: razorpayPaymentId || `offline_${Date.now()}`,
      razorpayOrderId,
      razorpaySignature,
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
        message: isNew ? "Order placed successfully." : "Order already confirmed.",
      },
      { status: isNew ? 201 : 200 }
    );

    // Set tracking cookies
    const existingCookie = req.cookies.get("playo_placed_order_ids")?.value;
    const cookieOrders = existingCookie ? existingCookie.split(",").map((s) => s.trim()) : [];
    if (!cookieOrders.includes(order.id)) {
      cookieOrders.unshift(order.id);
    }

    response.cookies.set("playo_placed_order_ids", cookieOrders.join(","), {
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set("playo_customer_phone", cleanPhone.slice(-10), {
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
