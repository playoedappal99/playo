import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();

    // 1. Calculate sales count directly from all orders in DB
    const orders = await db.collection("orders").find({ status: { $ne: "Cancelled" } }).toArray();

    const salesMap: Record<string, { count: number; name: string; revenue: number }> = {};

    for (const ord of orders) {
      if (Array.isArray(ord.items)) {
        for (const it of ord.items) {
          const key = it.id || it.name;
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;

          if (!salesMap[key]) {
            salesMap[key] = { count: 0, name: it.name, revenue: 0 };
          }
          salesMap[key].count += qty;
          salesMap[key].revenue += price * qty;
        }
      }
    }

    // 2. Fetch all products from DB
    const products = await db.collection("products").find({}).toArray();

    // 3. Attach actual soldCount and rank
    const rankedProducts = products.map((p) => {
      const keyById = p.id;
      const keyByName = p.name;
      const orderSales = (salesMap[keyById]?.count || 0) + (salesMap[keyByName]?.count || 0);
      const directSoldCount = Number(p.soldCount) || 0;
      const totalSold = Math.max(orderSales, directSoldCount);

      return {
        ...p,
        _id: p._id.toString(),
        id: p.id || p._id.toString(),
        name: p.name || "",
        reviewsCount: Number(p.reviewsCount) || 0,
        soldCount: totalSold,
        revenue: (salesMap[keyById]?.revenue || 0) + (salesMap[keyByName]?.revenue || 0) || totalSold * (Number(p.price) || 0),
      };
    });

    // 4. Sort by soldCount descending, then reviews/rating
    rankedProducts.sort((a, b) => {
      if (b.soldCount !== a.soldCount) return b.soldCount - a.soldCount;
      return b.reviewsCount - a.reviewsCount;
    });

    return NextResponse.json({
      success: true,
      count: rankedProducts.length,
      bestsellers: rankedProducts,
    });
  } catch (error: any) {
    console.error("Error fetching bestsellers:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
