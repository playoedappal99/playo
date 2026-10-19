import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("playo_cart_id")?.value;
  if (!cartId) {
    cartId = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  return cartId;
}

export async function GET() {
  try {
    const cartId = await getCartSessionId();
    const db = await getDatabase();

    const cartDoc = await db.collection("carts").findOne({ cartId });

    if (!cartDoc || !Array.isArray(cartDoc.items)) {
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
      const prod = await db
        .collection("products")
        .findOne({ $or: [{ id: item.productId }, { id: item.product?.id }] });

      if (prod) {
        const availableStock = typeof prod.stockCount === "number" ? prod.stockCount : 0;
        // Clamp quantity to available stock (or 0 if out of stock)
        let validatedQty = item.quantity;
        if (availableStock <= 0) {
          validatedQty = 0;
        } else if (validatedQty > availableStock) {
          validatedQty = availableStock;
        } else if (validatedQty < 1) {
          validatedQty = 1;
        }

        if (validatedQty > 0) {
          enrichedItems.push({
            product: {
              ...prod,
              _id: prod._id.toString(),
              id: prod.id || prod._id.toString(),
              stockCount: availableStock,
              inStock: availableStock > 0,
            },
            quantity: validatedQty,
          });
          subtotal += prod.price * validatedQty;
        }
      }
    }

    // Update cart in DB if items changed
    await db.collection("carts").updateOne(
      { cartId },
      {
        $set: {
          items: enrichedItems.map((i) => ({
            productId: i.product.id,
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
    const cartId = await getCartSessionId();
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const product = await db
      .collection("products")
      .findOne({ $or: [{ id: productId }, { name: productId }] });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const availableStock = typeof product.stockCount === "number" ? product.stockCount : 0;
    if (availableStock <= 0) {
      return NextResponse.json(
        { success: false, error: `"${product.name}" is currently out of stock` },
        { status: 400 }
      );
    }

    const addQty = Math.max(1, Number(quantity) || 1);

    const cartDoc = await db.collection("carts").findOne({ cartId });
    const currentItems = (cartDoc?.items || []) as { productId: string; quantity: number }[];

    const existingIndex = currentItems.findIndex(
      (it) => it.productId === product.id || it.productId === productId
    );

    if (existingIndex > -1) {
      const currentQty = currentItems[existingIndex].quantity;
      const targetQty = currentQty + addQty;

      if (targetQty > availableStock) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot add more. Available stock limit for "${product.name}" is ${availableStock} (already in cart: ${currentQty}).`,
          },
          { status: 400 }
        );
      }
      currentItems[existingIndex].quantity = targetQty;
    } else {
      if (addQty > availableStock) {
        return NextResponse.json(
          {
            success: false,
            error: `Requested quantity exceeds available stock (${availableStock}).`,
          },
          { status: 400 }
        );
      }
      currentItems.push({ productId: product.id, quantity: addQty });
    }

    await db.collection("carts").updateOne(
      { cartId },
      { $set: { items: currentItems, updatedAt: new Date() } },
      { upsert: true }
    );

    const response = NextResponse.json({
      success: true,
      message: "Added to cart in database",
      cartId,
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
    const cartId = await getCartSessionId();
    const body = await req.json();
    const { productId, delta, quantity: exactQty } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const product = await db
      .collection("products")
      .findOne({ $or: [{ id: productId }, { name: productId }] });

    const availableStock = product && typeof product.stockCount === "number" ? product.stockCount : 10;

    const cartDoc = await db.collection("carts").findOne({ cartId });
    const currentItems = (cartDoc?.items || []) as { productId: string; quantity: number }[];

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

    // Real-world rule: never exceed available stock count, never less than 1!
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
    const cartId = await getCartSessionId();
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
    const filtered = currentItems.filter(
      (it) => it.productId !== productId
    );

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
