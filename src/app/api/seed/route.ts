import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { CATEGORIES_DATA, PRODUCTS_DATA } from "@/data/store-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();

    const productCount = await db.collection("products").countDocuments();
    const categoryCount = await db.collection("categories").countDocuments();

    if (productCount > 0 && categoryCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already populated",
        productCount,
        categoryCount,
      });
    }

    // Seed Categories
    if (categoryCount === 0) {
      const categoriesToInsert = CATEGORIES_DATA.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
        href: `/catalog?category=${c.slug}`,
        createdAt: new Date(),
      }));
      await db.collection("categories").insertMany(categoriesToInsert);
    }

    // Seed Products
    if (productCount === 0) {
      const productsToInsert = PRODUCTS_DATA.map((p, idx) => {
        const stockCount = p.inStock === false ? 0 : (idx === 0 ? 5 : idx === 1 ? 2 : idx === 2 ? 1 : 8);
        return {
          id: p.id,
          name: p.name,
          brand: p.brand || p.specs?.brand || "Playo",
          category: p.category || "General",
          categorySlug: p.categorySlug,
          price: p.price,
          originalPrice: p.originalPrice || Math.round(p.price * 1.3),
          discount: p.discount || "20% OFF",
          stockCount,
          inStock: stockCount > 0,
          scale: p.scale || p.specs?.scale || "1:24",
          material: p.specs?.material || "Diecast Metal with Plastic Parts",
          description: p.description || "Celebrate every beautiful moment with Playo Toys",
          tag: p.tag || (idx === 0 ? "Bestseller" : idx === 2 ? "Limited Edition" : undefined),
          availableColors: p.color || "Standard",
          colorMappings: [],
          images: p.galleryImages?.map((g) => g.url) || [p.imageUrl],
          imageUrl: p.imageUrl,
          galleryImages: p.galleryImages || [
            { url: p.imageUrl, label: `${p.name} view 1`, angleName: "Angle 1" },
          ],
          rating: p.rating || 5,
          reviewsCount: p.reviewsCount || 42,
          soldCount: idx === 0 ? 14 : idx === 2 ? 9 : 3,
          specs: p.specs || {},
          createdAt: new Date(Date.now() - idx * 3600000),
          updatedAt: new Date(),
        };
      });
      await db.collection("products").insertMany(productsToInsert);
    }

    // Seed Initial Offer
    const offerCount = await db.collection("offers").countDocuments();
    if (offerCount === 0) {
      await db.collection("offers").insertOne({
        id: "off-initial",
        minAmount: 2000,
        discountPercentage: 10,
        description: "When a customer orders ₹2,000 or more, they automatically receive a 10% discount.",
        status: "Active",
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        createdAtDate: new Date(),
      });
    }

    const finalProductCount = await db.collection("products").countDocuments();
    const finalCategoryCount = await db.collection("categories").countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully into MongoDB Atlas",
      products: finalProductCount,
      categories: finalCategoryCount,
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
