import { getDatabase } from "@/lib/mongodb";
import CatalogClient from "@/components/CatalogClient";
import { ProductItem, CategoryItem } from "@/data/store-data";
import { Suspense } from "react";
import { Metadata } from "next";
import { BUSINESS_INFO, getBreadcrumbSchema } from "@/lib/business-info";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Toy Shop in Edappal, Malappuram",
  description:
    "Explore kids' electric cars, 4x4 ride-on jeeps, mini bikes, light-up scooters, RC cars, and diecast models at PLAYO Edappal. In-store test drives & Kerala delivery.",
  alternates: {
    canonical: `${BUSINESS_INFO.url}/catalog`,
  },
  openGraph: {
    title: "Toy Catalog & Kids' Ride-Ons | PLAYO Edappal",
    description:
      "Explore kids' electric cars, 4x4 ride-on jeeps, mini bikes, scooters, and toys at PLAYO Edappal near Nesto Hypermarket.",
    url: `${BUSINESS_INFO.url}/catalog`,
    type: "website",
  },
};

export default async function CatalogPage() {
  let initialProducts: ProductItem[] = [];
  let initialCategories: CategoryItem[] = [];

  try {
    const db = await getDatabase();
    let rawProducts: any[] = [];
    let rawCategories: any[] = [];

    try {
      [rawProducts, rawCategories] = await Promise.all([
        db.collection("products").find({}).sort({ createdAt: -1 }).toArray(),
        db.collection("categories").find({}).sort({ createdAt: -1 }).toArray(),
      ]);
    } catch (e) {
      console.error("Catalog products fetch error:", e);
    }

    try {
      // Categories already fetched in parallel above
    } catch (e) {
      console.error("Catalog categories fetch error:", e);
    }

    const plainProducts = JSON.parse(JSON.stringify(rawProducts));
    const plainCategories = JSON.parse(JSON.stringify(rawCategories));

    initialProducts = plainProducts.map((p: any) => {
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

    initialCategories = plainCategories.map((c: any) => {
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
  } catch (err) {
    console.error("Error loading SSR catalog data:", err);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CatalogClient
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
