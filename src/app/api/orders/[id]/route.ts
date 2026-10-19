import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { validateAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await getDatabase();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const order = await db.collection("orders").findOne(query);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        _id: order._id.toString(),
        id: order.id || order._id.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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
    const { status, trackingNumber, courier, carrierLocation, cancelReason } = body;

    const validStatuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateFields: any = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (courier) updateFields.courier = courier;
    if (carrierLocation) updateFields.carrierLocation = carrierLocation;
    if (cancelReason) updateFields.cancelReason = cancelReason;

    const db = await getDatabase();
    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const result = await db.collection("orders").updateOne(query, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
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

    const result = await db.collection("orders").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
