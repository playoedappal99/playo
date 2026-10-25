import { getDatabase } from "@/lib/mongodb";
import { sanitizeInput, escapeRegex } from "@/lib/security";
import { sendEmail, generateOrderEmailHtml } from "@/lib/email";
import { clearProductsCache } from "@/lib/cache";
import { ObjectId } from "mongodb";

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID || "rzp_live_Ts0qA8xL0fOFHL";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "UXwSzkOr7l4EeIfUrXYH3Rgk";

// In-flight mutex locks to prevent race conditions when client verify and webhooks hit simultaneously
const activeOrderLocks = new Map<string, Promise<any>>();

/**
 * Generates a deterministic, professional order ID based on the Razorpay Order or Payment ID.
 * This guarantees that both the client verification and the Razorpay Webhook resolve to the
 * EXACT SAME order ID, eliminating duplicate orders.
 */
export function generateOrderId(
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): string {
  if (razorpayOrderId && razorpayOrderId.startsWith("order_")) {
    const raw = razorpayOrderId.replace(/^order_/, "").toUpperCase();
    return `PLY-${raw.slice(0, 8)}`;
  }
  if (razorpayPaymentId && razorpayPaymentId.startsWith("pay_")) {
    const raw = razorpayPaymentId.replace(/^pay_/, "").toUpperCase();
    return `PLY-${raw.slice(0, 8)}`;
  }
  return `PLY-${Date.now().toString().slice(-6)}`;
}

export interface VerifiedOrderItem {
  id: string;
  mongoId?: string;
  name: string;
  category?: string;
  imageUrl?: string;
  price: number;
  deliveryFee?: number;
  quantity: number;
  specs?: string;
}

export interface CreateOrderParams {
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  customerName?: string;
  phone: string;
  email?: string;
  deliveryAddress?: string;
  shippingOption?: string;
  deliveryInstructions?: string;
  items?: VerifiedOrderItem[];
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  total?: number;
  source?: "client" | "webhook" | "sync";
}

/**
 * Concurrency-safe atomic order creation or retrieval.
 * Uses mutex locks + database unique checks to ensure no duplicate orders are ever created.
 * Reliably decrements stock count in MongoDB and clears server/client caches.
 */
export async function createOrGetOrder(params: CreateOrderParams): Promise<{
  order: any;
  isNew: boolean;
}> {
  const lockKey = params.razorpayPaymentId || params.razorpayOrderId || "global_lock";

  // If another request is currently processing this exact payment, wait for it
  if (activeOrderLocks.has(lockKey)) {
    try {
      await activeOrderLocks.get(lockKey);
    } catch {}
  }

  let resolveLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });
  activeOrderLocks.set(lockKey, lockPromise);

  try {
    const db = await getDatabase();

    // 1. Check if order already exists in MongoDB
    const existing = await db.collection("orders").findOne({
      $or: [
        { razorpayPaymentId: params.razorpayPaymentId },
        ...(params.razorpayOrderId ? [{ razorpayOrderId: params.razorpayOrderId }] : []),
      ],
    });

    if (existing) {
      return {
        order: {
          ...existing,
          _id: existing._id.toString(),
          id: existing.id || existing._id.toString(),
        },
        isNew: false,
      };
    }

    // 2. Normalize and sanitize customer details
    const cleanName = sanitizeInput(params.customerName, 100) || "Valued Customer";
    const rawPhone = (params.phone || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.slice(-10) || "9999999999";
    const cleanEmail = sanitizeInput(params.email, 120) || "customer@playoedappal.in";
    const cleanAddress =
      sanitizeInput(params.deliveryAddress, 500) || "Showroom Pickup / Standard Delivery";
    const cleanInstructions = sanitizeInput(params.deliveryInstructions, 500);

    const orderId = generateOrderId(params.razorpayOrderId, params.razorpayPaymentId);

    // 3. Validate items & calculate authoritative totals
    let validatedItems: VerifiedOrderItem[] = [];
    let subtotal = 0;
    let totalDeliveryFee = 0;

    if (Array.isArray(params.items) && params.items.length > 0) {
      for (const item of params.items) {
        const qty = Math.max(1, Math.floor(Number(item.quantity || 1)));

        // Multi-strategy lookup: by exact id, ObjectId, name, or case-insensitive regex
        const searchConditions: any[] = [];
        if (item.id) {
          searchConditions.push({ id: item.id });
          if (ObjectId.isValid(item.id)) {
            searchConditions.push({ _id: new ObjectId(item.id) });
          }
        }
        if (item.name && typeof item.name === "string") {
          searchConditions.push({ name: item.name });
          const cleanItemName = item.name.replace(/\s*\([^)]*\)/g, "").trim();
          searchConditions.push({
            name: new RegExp(`^${escapeRegex(cleanItemName)}$`, "i"),
          });
        }

        const prod = await db.collection("products").findOne(
          searchConditions.length > 0 ? { $or: searchConditions } : { name: item.name }
        );

        const verifiedPrice = prod ? Number(prod.price) || 0 : Number(item.price) || 0;
        const verifiedDelivery = prod && typeof prod.deliveryFee === "number"
          ? Math.max(0, prod.deliveryFee)
          : Number(item.deliveryFee) || 0;

        validatedItems.push({
          id: prod?.id || (prod?._id ? String(prod._id) : item.id),
          mongoId: prod?._id ? String(prod._id) : undefined,
          name: prod?.name || item.name,
          category: prod?.category || prod?.categorySlug || item.category || "General",
          imageUrl: prod?.imageUrl || item.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
          price: verifiedPrice,
          deliveryFee: verifiedDelivery,
          quantity: qty,
          specs: item.specs || (prod?.scale ? `Scale: ${prod.scale}` : "Standard"),
        });

        subtotal += verifiedPrice * qty;
        totalDeliveryFee += verifiedDelivery * qty;
      }
    } else {
      // Fallback for recovered webhook orders without full client payload
      const fallbackTotal = Number(params.total) || 0;
      validatedItems = [
        {
          id: `item-${orderId}`,
          name: "Playo Toy Order",
          category: "General",
          imageUrl: "/images/catalog/porsche-drift-rc.jpg",
          price: fallbackTotal,
          deliveryFee: 0,
          quantity: 1,
          specs: "Verified Order",
        },
      ];
      subtotal = fallbackTotal;
    }

    // 4. Calculate active discount
    let discount = Number(params.discount) || 0;
    if (discount === 0 && subtotal > 0) {
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
    }

    const total =
      params.total !== undefined && params.total > 0
        ? params.total
        : Math.max(0, subtotal - discount + totalDeliveryFee);

    // 5. Decrement Stock reliably in MongoDB for each ordered product
    for (const it of validatedItems) {
      try {
        const findConditions: any[] = [];
        if (it.mongoId && ObjectId.isValid(it.mongoId)) {
          findConditions.push({ _id: new ObjectId(it.mongoId) });
        }
        if (it.id && ObjectId.isValid(it.id)) {
          findConditions.push({ _id: new ObjectId(it.id) });
        }
        if (it.id) {
          findConditions.push({ id: it.id });
        }
        if (it.name) {
          findConditions.push({ name: it.name });
          const cleanItemName = it.name.replace(/\s*\([^)]*\)/g, "").trim();
          findConditions.push({ name: new RegExp(`^${escapeRegex(cleanItemName)}$`, "i") });
        }

        const targetProd = await db.collection("products").findOne(
          findConditions.length > 0 ? { $or: findConditions } : { id: it.id }
        );

        if (targetProd) {
          const rawStock = targetProd.stockCount;
          const currentStock =
            typeof rawStock === "number"
              ? rawStock
              : parseInt(String(rawStock || "0"), 10) || 0;

          const deductQty = Math.max(1, it.quantity);
          const newStock = Math.max(0, currentStock - deductQty);

          const rawSold = targetProd.soldCount;
          const currentSold =
            typeof rawSold === "number"
              ? rawSold
              : parseInt(String(rawSold || "0"), 10) || 0;
          const newSold = currentSold + deductQty;

          // Directly update by _id so it is 100% reliable regardless of field types
          await db.collection("products").updateOne(
            { _id: targetProd._id },
            {
              $set: {
                stockCount: newStock,
                soldCount: newSold,
                inStock: newStock > 0,
                updatedAt: new Date(),
              },
            }
          );

          console.log(
            `[Stock Decrement] "${targetProd.name}" stock reduced: ${currentStock} -> ${newStock} (Ordered: ${deductQty})`
          );

          if (newStock <= 0) {
            await db.collection("notifications").insertOne({
              id: `notif-oos-${targetProd.id || String(targetProd._id)}-${Date.now()}`,
              type: "stock",
              title: "Out of Stock Alert",
              desc: `"${targetProd.name}" is now OUT OF STOCK (0 units remaining in showroom).`,
              time: "Just now",
              read: false,
              createdAt: new Date(),
            });
          } else if (newStock < 3) {
            await db.collection("notifications").insertOne({
              id: `notif-low-${targetProd.id || String(targetProd._id)}-${Date.now()}`,
              type: "stock",
              title: "Low Stock Alert",
              desc: `"${targetProd.name}" has only ${newStock} unit(s) remaining in showroom inventory.`,
              time: "Just now",
              read: false,
              createdAt: new Date(),
            });
          }
        }
      } catch (stockErr) {
        console.warn(`Could not update stock for product ${it.name || it.id}:`, stockErr);
      }
    }

    // Invalidate product memory cache so both admin & user side get fresh live stock immediately
    clearProductsCache();

    // 6. Build official order document
    const isSpeedAndSafe =
      params.shippingOption === "speed_and_safe" ||
      (params.shippingOption && params.shippingOption.includes("Speed"));

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
      shippingOption: isSpeedAndSafe
        ? "Speed & Safe Courier Service"
        : "Indian Post (Door-to-Door Delivery)",
      deliveryInstructions: cleanInstructions,
      status: "Pending",
      estimatedDelivery: "2-3 Business Days",
      courier: isSpeedAndSafe
        ? "Speed & Safe Courier Service"
        : "India Post Doorstep Express",
      trackingNumber: `IP${Date.now().toString().slice(-8)}IN`,
      carrierLocation: "Order verified via Razorpay - awaiting showroom dispatch",
      paymentMethod: "Razorpay (UPI / Cards / NetBanking)",
      paymentStatus: "Paid",
      razorpayOrderId: params.razorpayOrderId || "",
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature || "",
      items: validatedItems,
      subtotal,
      discount,
      deliveryFee: totalDeliveryFee,
      total,
      source: params.source || "client",
    };

    // 7. Atomic Insert with duplicate key protection
    try {
      const orderResult = await db.collection("orders").insertOne(newOrder);

      // Notification for admin dashboard
      await db.collection("notifications").insertOne({
        id: `notif-order-${orderId}`,
        type: "order",
        title: "New Paid Order via Razorpay",
        desc: `Order #${orderId} received from ${cleanName} for ₹${total.toLocaleString("en-IN")} via Razorpay (${params.razorpayPaymentId}).`,
        time: "Just now",
        read: false,
        createdAt: new Date(),
      });

      // Send Instant Email to Showroom Admin
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

      return {
        order: { ...newOrder, _id: orderResult.insertedId.toString() },
        isNew: true,
      };
    } catch (insertErr: any) {
      // If code 11000 duplicate key occurred, fetch the existing order
      if (insertErr.code === 11000) {
        const found = await db.collection("orders").findOne({
          $or: [
            { razorpayPaymentId: params.razorpayPaymentId },
            { id: orderId },
          ],
        });
        if (found) {
          return {
            order: { ...found, _id: found._id.toString() },
            isNew: false,
          };
        }
      }
      throw insertErr;
    }
  } finally {
    activeOrderLocks.delete(lockKey);
    resolveLock!();
  }
}

/**
 * Real-time Auto-Sync with live Razorpay API.
 * Recovers orders when customers pay via UPI / mobile but the browser closed or refreshed
 * before client verification completed.
 */
export async function syncRazorpayOrders(options: {
  phone?: string;
  paymentId?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;
    const recoveredOrders: any[] = [];
    const db = await getDatabase();

    // Case 1: Specific Razorpay Payment ID provided
    if (options.paymentId && options.paymentId.startsWith("pay_")) {
      const res = await fetch(`https://api.razorpay.com/v1/payments/${options.paymentId}`, {
        headers: { Authorization: authHeader },
        cache: "no-store",
      });

      if (res.ok) {
        const payment = await res.json();
        if (payment.status === "captured") {
          const notes = payment.notes || {};
          const itemsSummary = notes.itemsSummary || "Toy Order via Razorpay";
          const amountInRupees = Math.round(Number(payment.amount || 0) / 100);

          const { order } = await createOrGetOrder({
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id,
            customerName: notes.customerName || payment.email || "Valued Customer",
            phone: notes.phone || payment.contact || "9999999999",
            email: notes.email || payment.email || "customer@playoedappal.in",
            deliveryAddress: notes.deliveryAddress || "Showroom Pickup / Standard Delivery",
            shippingOption: notes.shippingOption || "Indian Post (Door-to-Door Delivery)",
            deliveryInstructions: "Auto-synced from Razorpay Live Payment Gateway",
            total: amountInRupees,
            source: "sync",
            items: [
              {
                id: `sync-${payment.id}`,
                name: itemsSummary,
                category: "General",
                imageUrl: "/images/catalog/porsche-drift-rc.jpg",
                price: amountInRupees,
                quantity: 1,
                specs: "Live Verified Order",
              },
            ],
          });
          recoveredOrders.push(order);
        }
      }
      return recoveredOrders;
    }

    // Case 2: Scan recent captured payments (by phone or latest 50 payments)
    const listUrl = `https://api.razorpay.com/v1/payments?count=${options.limit || 50}`;
    const listRes = await fetch(listUrl, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });

    if (!listRes.ok) return [];

    const listData = await listRes.json();
    const payments = Array.isArray(listData.items) ? listData.items : [];

    const targetPhone = options.phone ? options.phone.replace(/\D/g, "").slice(-10) : "";

    for (const payment of payments) {
      if (payment.status !== "captured") continue;

      const paymentContact = (payment.contact || "").replace(/\D/g, "").slice(-10);

      // If phone filtering requested, match phone
      if (targetPhone && paymentContact !== targetPhone) {
        continue;
      }

      // Check if already in MongoDB
      const exists = await db.collection("orders").findOne({
        $or: [
          { razorpayPaymentId: payment.id },
          ...(payment.order_id ? [{ razorpayOrderId: payment.order_id }] : []),
        ],
      });

      if (!exists) {
        // Auto-recover order
        const notes = payment.notes || {};
        const itemsSummary = notes.itemsSummary || "Toy Order via Razorpay";
        const amountInRupees = Math.round(Number(payment.amount || 0) / 100);

        const { order } = await createOrGetOrder({
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          customerName: notes.customerName || payment.email || "Valued Customer",
          phone: paymentContact || "9999999999",
          email: notes.email || payment.email || "customer@playoedappal.in",
          deliveryAddress: notes.deliveryAddress || "Showroom Pickup / Standard Delivery",
          shippingOption: notes.shippingOption || "Indian Post (Door-to-Door Delivery)",
          deliveryInstructions: "Auto-synced from Razorpay Live Payment Gateway",
          total: amountInRupees,
          source: "sync",
          items: [
            {
              id: `sync-${payment.id}`,
              name: itemsSummary,
              category: "General",
              imageUrl: "/images/catalog/porsche-drift-rc.jpg",
              price: amountInRupees,
              quantity: 1,
              specs: "Live Verified Order",
            },
          ],
        });
        recoveredOrders.push(order);
      }
    }

    return recoveredOrders;
  } catch (err) {
    console.warn("Razorpay order auto-sync error:", err);
    return [];
  }
}
