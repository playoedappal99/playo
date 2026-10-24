import { getDatabase } from "@/lib/mongodb";
import HomeClient from "@/components/HomeClient";
import { ProductItem, CategoryItem } from "@/data/store-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PLAYO Toy Shop in Edappal, Malappuram | Kids' Toys & Ride-On Vehicles",
  description:
    "Discover toys for kids at PLAYO, near Nesto Hypermarket, Edappal, Malappuram. Explore available toy categories and visit us daily from 9:30 AM to 10:30 PM.",
  alternates: {
    canonical: "https://playoedappal.in",
  },
};

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
      // Self-healing: persist permanent CDN URL to database if any blob URL is detected
      for (const c of rawCategories) {
        if (c.imageUrl && typeof c.imageUrl === "string" && c.imageUrl.startsWith("blob:")) {
          const permanentCdn = "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80";
          db.collection("categories").updateOne({ _id: c._id }, { $set: { imageUrl: permanentCdn } }).catch(() => {});
          c.imageUrl = permanentCdn;
        }
      }
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

    const formattedCategories: CategoryItem[] = plainCategories.map((c: any) => {
      let img = c.imageUrl;
      if (!img || typeof img !== "string" || img.startsWith("blob:")) {
        img = "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80";
      }
      return {
        id: c.id || String(c._id),
        name: c.name,
        slug: c.slug,
        imageUrl: img,
        href: c.href || `/catalog?category=${c.slug}`,
        createdAt: c.createdAt,
      };
    });

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
