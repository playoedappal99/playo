import { getDatabase } from "@/lib/mongodb";
import HomeClient from "@/components/HomeClient";
import { ProductItem, CategoryItem } from "@/data/store-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const db = await getDatabase();

    let rawProducts: any[] = [];
    let rawCategories: any[] = [];
    let catError = "";

    try {
      rawProducts = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray();
    } catch (e: any) {
      console.error("SSR products error:", e);
    }

    try {
      rawCategories = await db.collection("categories").find({}).sort({ createdAt: -1 }).toArray();
    } catch (e: any) {
      catError = e?.message || String(e);
      console.error("SSR categories error:", catError);
    }

    // Convert BSON to pure JSON-serializable structures for React Server Components
    const plainProducts = JSON.parse(JSON.stringify(rawProducts));
    const plainCategories = JSON.parse(JSON.stringify(rawCategories));

    const formattedProducts: ProductItem[] = plainProducts.map((p: any) => {
      const allImgs: string[] = Array.isArray(p.images) ? [...p.images] : [];
      if (p.imageUrl && !allImgs.includes(p.imageUrl)) {
        allImgs.unshift(p.imageUrl);
      }
      return {
        ...p,
        _id: String(p._id),
        id: p.id || String(p._id),
        imageUrl: allImgs[0] || p.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
        stockCount: typeof p.stockCount === "number" ? p.stockCount : 0,
        inStock: (typeof p.stockCount === "number" ? p.stockCount : 0) > 0,
      } as ProductItem;
    });

    const formattedCategories: CategoryItem[] = plainCategories.map((c: any) => ({
      id: c.id || String(c._id),
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      href: c.href || `/catalog?category=${c.slug}`,
      createdAt: c.createdAt,
    }));

    return (
      <HomeClient
        initialProducts={formattedProducts}
        initialCategories={formattedCategories}
      />
    );
  } catch (error: any) {
    console.error("Home page SSR error:", error);
    return <HomeClient initialProducts={[]} initialCategories={[]} />;
  }
}
