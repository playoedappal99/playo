import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { escapeRegex, sanitizeInput, validateAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    const phone = searchParams.get("phone");

    const isAdmin = validateAdminAuth(req);
    const query: any = {};

    if (isAdmin) {
      if (status && status !== "ALL") {
        query.status = status;
      }
      if (id && id.trim()) {
        query.id = id.trim();
      } else if (phone && phone.trim()) {
        query.phone = phone.trim().replace(/\D/g, "");
      } else if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        const regex = new RegExp(safeSearch, "i");
        query.$or = [
          { id: regex },
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
          query.id = { $in: idList };
        } else {
          return NextResponse.json({ success: true, count: 0, orders: [] });
        }
      } else if (id && id.trim()) {
        query.id = id.trim();
      } else if (phone && phone.trim()) {
        const cleanPhone = phone.trim().replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          query.phone = cleanPhone;
        } else {
          return NextResponse.json({ success: true, count: 0, orders: [] });
        }
      } else {
        // Fallback: check device cookie if present
        const placedCookie = req.cookies.get("playo_placed_order_ids")?.value;
        if (placedCookie) {
          const orderIds = placedCookie.split(",").map((s) => s.trim()).filter(Boolean);
          if (orderIds.length > 0) {
            query.id = { $in: orderIds };
          } else {
            return NextResponse.json({ success: true, count: 0, orders: [] });
          }
        } else {
          // Never dump all orders to anonymous requests
          return NextResponse.json({ success: true, count: 0, orders: [] });
        }
      }
    }

    const db = await getDatabase();
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

    return NextResponse.json({ success: true, count: formatted.length, orders: formatted });
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
    } = body;

    // 1. Strict Sanitization & Backend Validation
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

    const db = await getDatabase();

    // 2. Validate products strictly against MongoDB (Anti-Tampering)
    // Any price or discount submitted by client is DISCARDED. Prices are retrieved solely from DB!
    const validatedItems: any[] = [];
    let subtotal = 0;
    let totalDeliveryFee = 0;

    for (const item of items) {
      const qty = Math.floor(Number(item.quantity || item.qty || 1));
      if (isNaN(qty) || qty < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity (${qty}) for item` },
          { status: 400 }
        );
      }

      // Check product in DB by ID or exact Name
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

      // Authoritative Price & Delivery Fee from DB
      const verifiedPrice = Number(prod.price) || 0;
      const verifiedDeliveryFee = typeof prod.deliveryFee === "number" ? Math.max(0, prod.deliveryFee) : 0;
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

    // 3. Calculate Offer Discount strictly from MongoDB active rules
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
      console.warn("Could not calculate offer discount:", e);
    }

    const total = Math.max(0, subtotal - discount + totalDeliveryFee);
    const orderId = `PLY-${Date.now().toString().slice(-6)}`;

    // 4. Concurrency-Safe Atomic Stock Reservation
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
        // Rollback any earlier products decremented in this transaction
        for (const rolled of decrementedProducts) {
          await db.collection("products").updateOne(
            { id: rolled.id },
            { $inc: { stockCount: rolled.quantity, soldCount: -rolled.quantity } }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: `Could not reserve stock for "${it.name}". Only limited units were available and were just taken by another buyer.`,
          },
          { status: 409 }
        );
      }

      decrementedProducts.push({ id: it.id, quantity: it.quantity });
    }

    // 5. Update inStock flag and create stock alerts
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
            desc: `"${updatedProd.name}" is currently out of stock (0 units remaining).`,
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

    // 6. Assemble and insert complete Order document
    const newOrder = {
      id: orderId,
      orderNumber: orderId,
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
      carrierLocation: "Order received - awaiting showroom packing",
      paymentMethod,
      paymentStatus: "Paid",
      items: validatedItems,
      subtotal,
      discount,
      deliveryFee: totalDeliveryFee,
      total,
    };

    const orderResult = await db.collection("orders").insertOne(newOrder);

    // 7. Add notification for new order received
    await db.collection("notifications").insertOne({
      id: `notif-order-${orderId}`,
      type: "order",
      title: "New Order Received",
      desc: `Order #${orderId} received from ${cleanName} for ₹${total.toLocaleString("en-IN")}.`,
      time: "Just now",
      read: false,
      createdAt: new Date(),
    });

    const response = NextResponse.json(
      {
        success: true,
        order: { ...newOrder, _id: orderResult.insertedId.toString() },
      },
      { status: 201 }
    );

    const existingCookie = req.cookies.get("playo_placed_order_ids")?.value;
    const newCookieVal = existingCookie ? `${existingCookie},${orderId}` : orderId;
    response.cookies.set("playo_placed_order_ids", newCookieVal, {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
