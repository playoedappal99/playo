import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { validateAdminAuth, sanitizeInput } from "@/lib/security";
import { getCachedCategories, setCachedCategories, clearCategoriesCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cached = getCachedCategories();
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
      });
    }

    const db = await getDatabase();
    const categories = await db
      .collection("categories")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = categories.map((c) => ({
      id: c.id || c._id.toString(),
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      href: c.href || `/catalog?category=${c.slug}`,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    }));

    const responseData = { success: true, count: formatted.length, categories: formatted };
    setCachedCategories(responseData);

    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch categories", stack: error?.stack },
      { status: 200 }
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
    const { name, imageUrl } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const cleanName = sanitizeInput(name.trim(), 100);
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const db = await getDatabase();

    // Check duplicate slug
    const existing = await db.collection("categories").findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Category with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      slug,
      imageUrl:
        imageUrl && typeof imageUrl === "string" && imageUrl.trim()
          ? imageUrl.trim()
          : "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80",
      href: `/catalog?category=${slug}`,
      createdAt: new Date(),
    };

    const result = await db.collection("categories").insertOne(newCategory);

    // Invalidate cache immediately
    clearCategoriesCache();

    return NextResponse.json(
      {
        success: true,
        category: { ...newCategory, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
