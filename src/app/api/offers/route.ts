import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { validateAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();
    const offers = await db
      .collection("offers")
      .find({})
      .sort({ createdAtDate: -1 })
      .toArray();

    const formatted = offers.map((o) => ({
      ...o,
      _id: o._id.toString(),
      id: o.id || o._id.toString(),
      minAmount: Number(o.minAmount) || 0,
      discountPercentage: Number(o.discountPercentage) || 0,
    }));

    return NextResponse.json({ success: true, count: formatted.length, offers: formatted });
  } catch (error: any) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authorization key required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { minAmount, discountPercentage, description } = body;

    const numMin = Number(minAmount);
    if (isNaN(numMin) || numMin <= 0) {
      return NextResponse.json(
        { success: false, error: "Minimum purchase amount must be greater than ₹0" },
        { status: 400 }
      );
    }

    const numPct = Number(discountPercentage);
    if (isNaN(numPct) || numPct <= 0 || numPct > 100) {
      return NextResponse.json(
        { success: false, error: "Discount percentage must be between 1% and 100%" },
        { status: 400 }
      );
    }

    const desc =
      description && typeof description === "string" && description.trim()
        ? description.trim()
        : `When a customer orders ₹${numMin.toLocaleString("en-IN")} or more, they automatically receive a ${numPct}% discount.`;

    const newOffer = {
      id: `off-${Date.now()}`,
      minAmount: Math.round(numMin),
      discountPercentage: Math.round(numPct),
      description: desc,
      status: "Active",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      createdAtDate: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection("offers").insertOne(newOffer);

    return NextResponse.json(
      {
        success: true,
        offer: { ...newOffer, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
