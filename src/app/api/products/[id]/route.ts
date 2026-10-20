import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { clearProductsCache } from "@/lib/cache";
import { validateAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const product = await db.collection("products").findOne(query);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Enrich images and galleryImages with color mappings if not present
    const allImgs: string[] = Array.isArray(product.images) ? [...product.images] : [];
    if (product.imageUrl && !allImgs.includes(product.imageUrl)) {
      allImgs.unshift(product.imageUrl);
    }
    if (Array.isArray(product.colorMappings)) {
      product.colorMappings.forEach((cm: any) => {
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

    const gallery = Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? [...product.galleryImages]
      : [];

    allImgs.forEach((url, i) => {
      if (!gallery.some((g: any) => g.url === url)) {
        gallery.push({
          url,
          label: `${product.name} - View ${i + 1}`,
          angleName: `Angle ${i + 1}`,
        });
      }
    });

    if (Array.isArray(product.colorMappings)) {
      product.colorMappings.forEach((cm: any) => {
        if (Array.isArray(cm.images)) {
          cm.images.forEach((url: string) => {
            const found = gallery.find((g: any) => g.url === url);
            if (found) {
              found.color = cm.color;
              if (!found.label.includes(cm.color)) {
                found.label = `${product.name} - ${cm.color}`;
              }
            }
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product._id.toString(),
        id: product.id || product._id.toString(),
        images: allImgs,
        galleryImages: gallery,
        imageUrl: allImgs[0] || product.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
        stockCount: typeof product.stockCount === "number" ? product.stockCount : 0,
        inStock: (typeof product.stockCount === "number" ? product.stockCount : 0) > 0,
      },
    }, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    } = body;

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
          label: `${name.trim()} - Angle ${idx + 1}`,
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
                label: `${name.trim()} - ${cm.color || "Color"} View ${cIdx + 1}`,
                angleName: cm.color || `Color ${cIdx + 1}`,
                color: cm.color,
              });
            }
          });
        }
      });
    }

    const updateDoc: any = {
      name: name.trim(),
      brand: brand && typeof brand === "string" ? brand.trim() : undefined,
      category: catName,
      categorySlug: catSlug,
      price: numPrice,
      stockCount: numStock,
      inStock: numStock > 0,
      scale: scale && typeof scale === "string" ? scale.trim() : undefined,
      material: material && typeof material === "string" ? material.trim() : undefined,
      description: description && typeof description === "string" ? description.trim() : undefined,
      tag: tag && typeof tag === "string" ? tag.trim() : undefined,
      availableColors: availableColors && typeof availableColors === "string" ? availableColors.trim() : undefined,
      images: allImagesList,
      imageUrl: primaryImg,
      galleryImages,
      updatedAt: new Date(),
    };

    if (Array.isArray(colorMappings)) {
      updateDoc.colorMappings = colorMappings;
    }

    const db = await getDatabase();
    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const result = await db.collection("products").updateOne(query, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    clearProductsCache();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
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
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const mongoId = searchParams.get("mongoId");

    const db = await getDatabase();
    const orConditions: any[] = [{ id: id }, { _id: id }];
    if (ObjectId.isValid(id)) {
      orConditions.push({ _id: new ObjectId(id) });
    }
    if (mongoId && ObjectId.isValid(mongoId)) {
      orConditions.push({ _id: new ObjectId(mongoId) });
    }

    const result = await db.collection("products").deleteOne({ $or: orConditions });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    clearProductsCache();

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully from MongoDB",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
