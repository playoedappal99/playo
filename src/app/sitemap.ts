import { MetadataRoute } from "next";
import { getDatabase } from "@/lib/mongodb";
import { BUSINESS_INFO } from "@/lib/business-info";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BUSINESS_INFO.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/toy-shop-edappal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/toy-shop-near-ponnani`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/toy-shop-near-kuttippuram`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/toy-shop-near-valanchery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const db = await getDatabase();
    const products = await db.collection("products").find({}).toArray();
    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/product/${p.id || p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categories = await db.collection("categories").find({}).toArray();
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/catalog?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

