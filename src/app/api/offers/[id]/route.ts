import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { validateAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authorization key required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    const db = await getDatabase();
    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const offer = await db.collection("offers").findOne(query);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    const newStatus = status || (offer.status === "Active" ? "Inactive" : "Active");
    await db.collection("offers").updateOne(query, { $set: { status: newStatus } });

    return NextResponse.json({
      success: true,
      message: "Offer status updated",
      status: newStatus,
    });
  } catch (error: any) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authorization key required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const db = await getDatabase();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const result = await db.collection("offers").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
