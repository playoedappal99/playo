import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { clearCategoriesCache } from "@/lib/cache";
import { validateAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

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
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const result = await db.collection("categories").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    clearCategoriesCache();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
