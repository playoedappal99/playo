import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();

    // 1. Fetch products with low stock (< 3 and > 0)
    const lowStockProducts = await db
      .collection("products")
      .find({ stockCount: { $gt: 0, $lt: 3 } })
      .toArray();

    // 2. Fetch products out of stock (<= 0)
    const outOfStockProducts = await db
      .collection("products")
      .find({ stockCount: { $lte: 0 } })
      .toArray();

    // 3. Fetch recent / pending orders
    const recentOrders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // 4. Stored custom / dismissal state
    const readDocs = await db.collection("notification_reads").find({}).toArray();
    const readIds = new Set(readDocs.map((r) => r.notifId));

    const notifications: any[] = [];

    // Out of stock alerts
    for (const p of outOfStockProducts) {
      const notifId = `notif-oos-${p.id || p._id.toString()}`;
      notifications.push({
        id: notifId,
        type: "stock",
        title: "Out of Stock Alert",
        desc: `"${p.name}" is currently completely out of stock (0 units).`,
        time: "Requires Restock",
        read: readIds.has(notifId),
        priority: 1,
      });
    }

    // Low stock alerts (< 3)
    for (const p of lowStockProducts) {
      const notifId = `notif-low-${p.id || p._id.toString()}`;
      notifications.push({
        id: notifId,
        type: "stock",
        title: "Low Stock Alert",
        desc: `"${p.name}" has only ${p.stockCount} unit(s) remaining in showroom inventory.`,
        time: "Stock < 3",
        read: readIds.has(notifId),
        priority: 2,
      });
    }

    // New order received alerts
    for (const ord of recentOrders) {
      const notifId = `notif-ord-${ord.id || ord._id.toString()}`;
      notifications.push({
        id: notifId,
        type: "order",
        title: ord.status === "Pending" ? "New Order Received" : `Order ${ord.status}`,
        desc: `Order #${ord.id} received from ${ord.customerName} (${ord.items?.length || 1} item(s) - ₹${(ord.total || 0).toLocaleString("en-IN")}).`,
        time: ord.orderDate || "Recently",
        read: readIds.has(notifId),
        priority: ord.status === "Pending" ? 1 : 3,
      });
    }

    // Sort by priority and read status
    notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return a.priority - b.priority;
    });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
      notifications,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notifIds, markAll = false } = body;
    const db = await getDatabase();

    if (markAll) {
      // Fetch all generated IDs
      const lowStock = await db.collection("products").find({ stockCount: { $lt: 3 } }).toArray();
      const recentOrders = await db.collection("orders").find({}).limit(20).toArray();

      const allIds = [
        ...lowStock.map((p) => `notif-low-${p.id || p._id.toString()}`),
        ...lowStock.map((p) => `notif-oos-${p.id || p._id.toString()}`),
        ...recentOrders.map((o) => `notif-ord-${o.id || o._id.toString()}`),
      ];

      const bulkOps = allIds.map((id) => ({
        updateOne: {
          filter: { notifId: id },
          update: { $set: { notifId: id, readAt: new Date() } },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await db.collection("notification_reads").bulkWrite(bulkOps);
      }
    } else if (Array.isArray(notifIds)) {
      for (const id of notifIds) {
        await db.collection("notification_reads").updateOne(
          { notifId: id },
          { $set: { notifId: id, readAt: new Date() } },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (error: any) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
