import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductItem } from "@/data/store-data";
import { 
  BUSINESS_INFO, 
  getProductSchema, 
  getBreadcrumbSchema 
} from "@/lib/business-info";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const db = await getDatabase();

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    let product = await db.collection("products").findOne(query);
    if (!product) {
      product = await db.collection("products").findOne({
        name: new RegExp(`^${id.replace(/-/g, " ")}$`, "i"),
      });
    }

    if (!product) {
      return {
        title: "Product Details | PLAYO Edappal Toy Showroom",
        description: "Explore kids' ride-on cars, bikes, jeeps, and toys at PLAYO Edappal showroom near Nesto Hypermarket.",
        alternates: {
          canonical: `${BUSINESS_INFO.url}/catalog`,
        },
      };
    }

    const prodId = product.id || String(product._id);
    const prodImg = product.imageUrl || product.images?.[0] || "/images/catalog/porsche-drift-rc.jpg";

    return {
      title: `${product.name} | PLAYO Toy Shop Edappal`,
      description:
        product.description?.slice(0, 160) ||
        `Buy ${product.name} at PLAYO Edappal near Nesto Hypermarket. Price: ₹${product.price}. Verified quality, motor warranty, and delivery across Kerala.`,
      alternates: {
        canonical: `${BUSINESS_INFO.url}/product/${prodId}`,
      },
      openGraph: {
        title: `${product.name} | PLAYO Toy Shop Edappal`,
        description:
          product.description?.slice(0, 160) ||
          `Buy ${product.name} at PLAYO Edappal near Nesto Hypermarket. Verified quality and Kerala delivery.`,
        url: `${BUSINESS_INFO.url}/product/${prodId}`,
        images: [
          {
            url: prodImg.startsWith("http") ? prodImg : `${BUSINESS_INFO.url}${prodImg}`,
            alt: `${product.name} - PLAYO Edappal`,
          },
        ],
      },
    };
  } catch {
    return {
      title: "PLAYO Toy Shop in Edappal | Kids' Ride-Ons & Toys",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDatabase();

  let query: Record<string, unknown> = { id };
  if (ObjectId.isValid(id)) {
    query = { $or: [{ id }, { _id: new ObjectId(id) }] };
  }

  let rawProduct = await db.collection("products").findOne(query);

  if (!rawProduct) {
    // Try matching slug or name
    rawProduct = await db.collection("products").findOne({
      $or: [
        { id: { $regex: new RegExp(id, "i") } },
        { name: new RegExp(`^${id.replace(/-/g, " ")}$`, "i") },
      ],
    });
  }

  if (!rawProduct) {
    // Fallback to first available product in showroom if any exist
    rawProduct = await db.collection("products").findOne({});
  }

  if (!rawProduct) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">
          The toy you requested does not exist or has been removed from inventory.
        </p>
        <Link
          href="/catalog"
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Format images and gallery
  const allImgs: string[] = Array.isArray(rawProduct.images) ? [...rawProduct.images] : [];
  if (rawProduct.imageUrl && !allImgs.includes(rawProduct.imageUrl)) {
    allImgs.unshift(rawProduct.imageUrl);
  }
  if (Array.isArray(rawProduct.colorMappings)) {
    rawProduct.colorMappings.forEach((cm: { color: string; images?: string[] }) => {
      if (Array.isArray(cm.images)) {
        cm.images.forEach((url: string) => {
          if (url && typeof url === "string" && !allImgs.includes(url)) {
            allImgs.push(url);
          }
        });
      }
    });
  }

  if (allImgs.length === 0) {
    allImgs.push("/images/catalog/porsche-drift-rc.jpg");
  }

  const gallery: { url: string; label: string; angleName?: string; color?: string }[] =
    Array.isArray(rawProduct.galleryImages) && rawProduct.galleryImages.length > 0
      ? [...rawProduct.galleryImages]
      : [];

  allImgs.forEach((url, i) => {
    if (!gallery.some((g) => g.url === url)) {
      gallery.push({
        url,
        label: `${rawProduct.name} - View ${i + 1}`,
        angleName: `Angle ${i + 1}`,
      });
    }
  });

  if (Array.isArray(rawProduct.colorMappings)) {
    rawProduct.colorMappings.forEach((cm: { color: string; images?: string[] }) => {
      if (Array.isArray(cm.images)) {
        cm.images.forEach((url: string) => {
          const found = gallery.find((g) => g.url === url);
          if (found) {
            found.color = cm.color;
            if (!found.label.includes(cm.color)) {
              found.label = `${rawProduct.name} - ${cm.color}`;
            }
          }
        });
      }
    });
  }

  // Fetch up to 4 related products directly in database
  let relatedDocs: Record<string, unknown>[] = [];
  try {
    relatedDocs = await db
      .collection("products")
      .find({ id: { $ne: rawProduct.id } })
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(4)
      .toArray();
  } catch (e) {
    console.error("Error fetching related products:", e);
  }

  // Pure JSON conversion for Server Component -> Client Component boundary
  const plainProduct = JSON.parse(JSON.stringify(rawProduct));
  const plainRelated = JSON.parse(JSON.stringify(relatedDocs));

  const formattedProduct: ProductItem = {
    ...plainProduct,
    _id: String(plainProduct._id),
    id: plainProduct.id || String(plainProduct._id),
    images: allImgs,
    galleryImages: gallery,
    imageUrl: allImgs[0] || plainProduct.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
    stockCount: typeof plainProduct.stockCount === "number" ? plainProduct.stockCount : 0,
    deliveryFee: typeof plainProduct.deliveryFee === "number" ? plainProduct.deliveryFee : 0,
    inStock: (typeof plainProduct.stockCount === "number" ? plainProduct.stockCount : 0) > 0,
  };

  const formattedRelated: ProductItem[] = plainRelated.map((p: Record<string, unknown> & { _id: unknown; id?: string; imageUrl?: string; images?: string[]; stockCount?: number }) => ({
    ...p,
    _id: String(p._id),
    id: p.id || String(p._id),
    imageUrl: p.imageUrl || p.images?.[0] || "/images/catalog/porsche-drift-rc.jpg",
    stockCount: typeof p.stockCount === "number" ? p.stockCount : 0,
    inStock: (typeof p.stockCount === "number" ? p.stockCount : 0) > 0,
  }));

  const productSchema = getProductSchema({
    id: formattedProduct.id,
    name: formattedProduct.name,
    description: formattedProduct.description,
    imageUrl: formattedProduct.imageUrl,
    images: formattedProduct.images,
    price: formattedProduct.price,
    originalPrice: formattedProduct.originalPrice,
    inStock: formattedProduct.inStock,
    category: formattedProduct.category || formattedProduct.categorySlug,
    brand: formattedProduct.brand || "PLAYO",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Toy Catalog", url: "/catalog" },
    { name: formattedProduct.name, url: `/product/${formattedProduct.id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient
        initialProduct={formattedProduct}
        initialRelatedProducts={formattedRelated}
      />
    </>
  );
}
