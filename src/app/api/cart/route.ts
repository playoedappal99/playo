import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

async function getCartSessionId(req?: NextRequest): Promise<string> {
  const headerCartId = req?.headers.get("x-cart-id");
  if (headerCartId && headerCartId.trim()) {
    return headerCartId.trim();
  }
  const cookieStore = await cookies();
  let cartId = cookieStore.get("playo_cart_id")?.value;
  if (!cartId) {
    cartId = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  return cartId;
}

export async function GET(req: NextRequest) {
  try {
    const cartId = await getCartSessionId(req);
    const db = await getDatabase();

    const cartDoc = await db.collection("carts").findOne({ cartId });

    if (!cartDoc || !Array.isArray(cartDoc.items) || cartDoc.items.length === 0) {
      const response = NextResponse.json({ success: true, items: [], totalCount: 0, subtotal: 0 });
      response.cookies.set("playo_cart_id", cartId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    // Refresh stock and price for each item from MongoDB
    const enrichedItems: any[] = [];
    let subtotal = 0;

    for (const item of cartDoc.items) {
      const pId = item.productId || item.product?.id || item.id;
      if (!pId) continue;

      const orQueries: any[] = [{ id: pId }, { id: String(pId) }, { name: pId }];
      if (ObjectId.isValid(pId)) {
        orQueries.push({ _id: new ObjectId(pId) });
      }

      const prod = await db.collection("products").findOne({ $or: orQueries });

      const baseProd = prod || item.product || {
        id: pId,
        name: item.name || "Showroom Toy",
        price: Number(item.price) || 0,
        imageUrl: item.imageUrl || "/images/playo-logo.png",
        stockCount: 10,
        inStock: true,
      };

      const availableStock = typeof baseProd.stockCount === "number" ? Math.max(1, baseProd.stockCount) : 10;
      let validatedQty = Math.max(1, Math.min(Number(item.quantity) || 1, availableStock));

      const price = Number(baseProd.price) || 0;
      enrichedItems.push({
        product: {
          ...baseProd,
          _id: baseProd._id ? baseProd._id.toString() : pId,
          id: baseProd.id || pId,
          stockCount: availableStock,
          inStock: availableStock > 0,
        },
        quantity: validatedQty,
      });
      subtotal += price * validatedQty;
    }

    // Update cart in DB with refreshed items
    await db.collection("carts").updateOne(
      { cartId },
      {
        $set: {
          items: enrichedItems.map((i) => ({
            productId: i.product.id,
            product: i.product,
            quantity: i.quantity,
          })),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const totalCount = enrichedItems.reduce((acc, it) => acc + it.quantity, 0);

    const response = NextResponse.json({
      success: true,
      items: enrichedItems,
      totalCount,
      subtotal,
    });
    response.cookies.set("playo_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error: any) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cartId = await getCartSessionId(req);
    const body = await req.json();
    const { productId, quantity = 1, product: bodyProduct } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const orQueries: any[] = [{ id: productId }, { id: String(productId) }, { name: productId }];
    if (ObjectId.isValid(productId)) {
      orQueries.push({ _id: new ObjectId(productId) });
    }

    let product = await db.collection("products").findOne({ $or: orQueries });

    if (!product && bodyProduct) {
      product = bodyProduct;
    }

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const availableStock = typeof product.stockCount === "number" ? Math.max(1, product.stockCount) : 10;
    const addQty = Math.max(1, Number(quantity) || 1);

    const cartDoc = await db.collection("carts").findOne({ cartId });
    const currentItems = (cartDoc?.items || []) as { productId: string; product?: any; quantity: number }[];

    const existingIndex = currentItems.findIndex(
      (it) => it.productId === product.id || it.productId === productId
    );

    if (existingIndex > -1) {
      const currentQty = currentItems[existingIndex].quantity;
      const targetQty = Math.min(availableStock, currentQty + addQty);
      currentItems[existingIndex].quantity = targetQty;
      currentItems[existingIndex].product = product;
    } else {
      currentItems.push({
        productId: product.id || productId,
        product,
        quantity: Math.min(availableStock, addQty),
      });
    }

    await db.collection("carts").updateOne(
      { cartId },
      { $set: { items: currentItems, updatedAt: new Date() } },
      { upsert: true }
    );

    const response = NextResponse.json({
      success: true,
      message: "Added to cart",
      cartId,
      itemsCount: currentItems.reduce((acc, it) => acc + it.quantity, 0),
    });
    response.cookies.set("playo_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error: any) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cartId = await getCartSessionId(req);
    const body = await req.json();
    const { productId, delta, quantity: exactQty } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const orQueries: any[] = [{ id: productId }, { id: String(productId) }, { name: productId }];
    if (ObjectId.isValid(productId)) {
      orQueries.push({ _id: new ObjectId(productId) });
    }

    const product = await db.collection("products").findOne({ $or: orQueries });
    const availableStock = product && typeof product.stockCount === "number" ? Math.max(1, product.stockCount) : 10;

    const cartDoc = await db.collection("carts").findOne({ cartId });
    const currentItems = (cartDoc?.items || []) as { productId: string; quantity: number; product?: any }[];

    const itemIdx = currentItems.findIndex(
      (it) => it.productId === productId || it.productId === product?.id
    );

    if (itemIdx === -1) {
      return NextResponse.json({ success: false, error: "Item not in cart" }, { status: 404 });
    }

    let newQty: number;
    if (typeof exactQty === "number") {
      newQty = exactQty;
    } else if (typeof delta === "number") {
      newQty = currentItems[itemIdx].quantity + delta;
    } else {
      return NextResponse.json({ success: false, error: "Provide delta or quantity" }, { status: 400 });
    }

    if (newQty > availableStock) {
      newQty = availableStock;
    }
    if (newQty < 1) {
      newQty = 1;
    }

    currentItems[itemIdx].quantity = newQty;

    await db.collection("carts").updateOne(
      { cartId },
      { $set: { items: currentItems, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      quantity: newQty,
      availableStock,
    });
  } catch (error: any) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cartId = await getCartSessionId(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const clear = searchParams.get("clear");

    const db = await getDatabase();

    if (clear === "true") {
      await db.collection("carts").updateOne({ cartId }, { $set: { items: [], updatedAt: new Date() } });
      return NextResponse.json({ success: true, message: "Cart cleared" });
    }

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const cartDoc = await db.collection("carts").findOne({ cartId });
    const currentItems = (cartDoc?.items || []) as { productId: string; quantity: number }[];
    const filtered = currentItems.filter((it) => it.productId !== productId);

    await db.collection("carts").updateOne(
      { cartId },
      { $set: { items: filtered, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Item removed from cart" });
  } catch (error: any) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
