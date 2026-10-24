import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { escapeRegex, validateAdminAuth } from "@/lib/security";
import { getCachedProducts, setCachedProducts, clearProductsCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const stockStatus = searchParams.get("stockStatus");
    const sort = searchParams.get("sort") || "newest";
    const cacheKey = req.url;

    // Check memory cache (5s TTL for fresh data + instant speed)
    const cached = getCachedProducts(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
      });
    }

    if (searchParams.get("categories") === "true") {
      try {
        const db = await getDatabase();
        const cats = await db.collection("categories").find({}).toArray();
        const formatted = cats.map(c => ({
          id: c.id || c._id.toString(),
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
        }));
        return NextResponse.json({ success: true, count: formatted.length, categories: formatted });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message, stack: err.stack });
      }
    }
    const query: any = {};

    if (category && category !== "all" && category !== "ALL") {
      query.$or = [{ categorySlug: category }, { category: category }];
    }

    if (tag && tag.trim()) {
      query.tag = tag.trim();
    }

    if (stockStatus === "IN_STOCK") {
      query.stockCount = { $gt: 0 };
    } else if (stockStatus === "OUT_OF_STOCK") {
      query.stockCount = { $lte: 0 };
    }

    if (search && search.trim()) {
      const q = escapeRegex(search.trim());
      const regex = new RegExp(q, "i");
      const searchConditions = [
        { name: regex },
        { brand: regex },
        { category: regex },
        { categorySlug: regex },
        { tag: regex },
        { description: regex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === "price-low") sortOptions = { price: 1 };
    if (sort === "price-high") sortOptions = { price: -1 };
    if (sort === "best-selling") sortOptions = { soldCount: -1, createdAt: -1 };
    if (sort === "rating") sortOptions = { rating: -1, reviewsCount: -1 };

    const db = await getDatabase();
    const products = await db
      .collection("products")
      .find(query)
      .sort(sortOptions)
      .toArray();

    const formatted = products.map((p) => {
      // Gather all images from main images AND all colorMappings
      const allImgs: string[] = Array.isArray(p.images) ? [...p.images] : [];
      if (p.imageUrl && !allImgs.includes(p.imageUrl)) {
        allImgs.unshift(p.imageUrl);
      }
      if (Array.isArray(p.colorMappings)) {
        p.colorMappings.forEach((cm: any) => {
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

      // Build rich galleryImages ensuring color images are present with labels
      const gallery = Array.isArray(p.galleryImages) && p.galleryImages.length > 0
        ? [...p.galleryImages]
        : [];

      // Add main images if missing
      allImgs.forEach((url, i) => {
        if (!gallery.some((g: any) => g.url === url)) {
          gallery.push({
            url,
            label: `${p.name} - View ${i + 1}`,
            angleName: `Angle ${i + 1}`,
          });
        }
      });

      // Tag color mapping images with their color names
      if (Array.isArray(p.colorMappings)) {
        p.colorMappings.forEach((cm: any) => {
          if (Array.isArray(cm.images)) {
            cm.images.forEach((url: string) => {
              const found = gallery.find((g: any) => g.url === url);
              if (found) {
                found.color = cm.color;
                if (!found.label.includes(cm.color)) {
                  found.label = `${p.name} - ${cm.color}`;
                }
              }
            });
          }
        });
      }

      return {
        ...p,
        _id: p._id.toString(),
        id: p.id || p._id.toString(),
        images: allImgs,
        galleryImages: gallery,
        imageUrl: allImgs[0] || p.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
        stockCount: typeof p.stockCount === "number" ? p.stockCount : 0,
        deliveryFee: typeof p.deliveryFee === "number" ? p.deliveryFee : 0,
        inStock: (typeof p.stockCount === "number" ? p.stockCount : 0) > 0,
      };
    });

    const responsePayload = {
      success: true,
      count: formatted.length,
      products: formatted,
    };
    setCachedProducts(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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
    const {
      name,
      brand,
      category,
      categorySlug,
      price,
      stockCount,
      scale,
      material,
      description,
      tag,
      availableColors,
      colorMappings,
      images,
      imageUrl,
      deliveryFee,
    } = body;

    // Backend validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    const numStock = Number(stockCount);
    if (isNaN(numStock) || numStock < 0) {
      return NextResponse.json(
        { success: false, error: "Stock quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    const numDeliveryFee = deliveryFee !== undefined && deliveryFee !== "" ? Math.max(0, Number(deliveryFee) || 0) : 0;

    const cleanName = name.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const productId = `prod-${baseSlug}-${Date.now().toString().slice(-4)}`;

    const catName = category ? category.trim() : "General";
    const catSlug = categorySlug
      ? categorySlug.trim()
      : catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Collect all images from main images AND colorMappings
    const allImagesList: string[] = [];
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img && typeof img === "string" && !allImagesList.includes(img)) {
          allImagesList.push(img);
        }
      });
    }
    if (imageUrl && typeof imageUrl === "string" && !allImagesList.includes(imageUrl)) {
      allImagesList.push(imageUrl);
    }
    if (Array.isArray(colorMappings)) {
      colorMappings.forEach((cm: any) => {
        if (Array.isArray(cm.images)) {
          cm.images.forEach((cImg: string) => {
            if (cImg && typeof cImg === "string" && !allImagesList.includes(cImg)) {
              allImagesList.push(cImg);
            }
          });
        }
      });
    }

    if (allImagesList.length === 0) {
      allImagesList.push("/images/catalog/porsche-drift-rc.jpg");
    }

    const primaryImg = allImagesList[0];

    // Build rich galleryImages
    const galleryImages: any[] = [];
    (Array.isArray(images) && images.length > 0 ? images : [primaryImg]).forEach(
      (url: string, idx: number) => {
        galleryImages.push({
          url,
          label: `${cleanName} - View ${idx + 1}`,
          angleName: `Angle ${idx + 1}`,
        });
      }
    );

    if (Array.isArray(colorMappings)) {
      colorMappings.forEach((cm: any) => {
        if (Array.isArray(cm.images)) {
          cm.images.forEach((url: string, cIdx: number) => {
            if (!galleryImages.some((g) => g.url === url)) {
              galleryImages.push({
                url,
                label: `${cleanName} - ${cm.color || "Color"} View ${cIdx + 1}`,
                angleName: cm.color || `Color ${cIdx + 1}`,
                color: cm.color,
              });
            }
          });
        }
      });
    }

    const originalPrice = Math.round(numPrice * 1.3);
    const discount = "23% OFF";

    const newProduct = {
      id: productId,
      name: cleanName,
      brand: brand && typeof brand === "string" ? brand.trim() : undefined,
      category: catName,
      categorySlug: catSlug,
      price: numPrice,
      originalPrice,
      discount,
      deliveryFee: numDeliveryFee,
      stockCount: numStock,
      inStock: numStock > 0,
      scale: scale && typeof scale === "string" ? scale.trim() : undefined,
      material: material && typeof material === "string" ? material.trim() : "Diecast Metal with Plastic Parts",
      description: description && typeof description === "string" ? description.trim() : undefined,
      tag: tag && typeof tag === "string" ? tag.trim() : undefined,
      availableColors: availableColors && typeof availableColors === "string" ? availableColors.trim() : undefined,
      colorMappings: Array.isArray(colorMappings) ? colorMappings : [],
      images: allImagesList,
      imageUrl: primaryImg,
      galleryImages,
      rating: 5,
      reviewsCount: 1,
      soldCount: 0,
      specs: {
        brand: brand && typeof brand === "string" ? brand.trim() : undefined,
        category: catName,
        scale: scale && typeof scale === "string" ? scale.trim() : undefined,
        material: material && typeof material === "string" ? material.trim() : "Diecast Metal with Plastic Parts",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection("products").insertOne(newProduct);

    // Invalidate cache immediately on new insert
    clearProductsCache();

    return NextResponse.json(
      {
        success: true,
        product: { ...newProduct, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
