import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateAdminAuth, validateImageBuffer } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Admin Security Header Authorization
    if (!validateAdminAuth(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin authorization key required to upload images.",
        },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[];
      const singleFile = formData.get("file") as File | null;
      const rawFolder = (formData.get("folder") as string) || "playoedappal/products";
      const folder = rawFolder.replace(/[^a-zA-Z0-9_\-\/]/g, "").slice(0, 80);

      const filesToProcess = files.length > 0 ? files : singleFile ? [singleFile] : [];

      if (filesToProcess.length === 0) {
        return NextResponse.json(
          { success: false, error: "No image file provided" },
          { status: 400 }
        );
      }

      // Max 10 images per batch to prevent server exhaustion
      if (filesToProcess.length > 10) {
        return NextResponse.json(
          { success: false, error: "Maximum 10 images can be uploaded per batch." },
          { status: 400 }
        );
      }

      const uploadPromises = filesToProcess.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2. Strict Magic Byte Binary Inspection
        const validation = validateImageBuffer(buffer);
        if (!validation.isValid || !validation.mimeType) {
          throw new Error(validation.error || `Invalid file type for "${file.name}"`);
        }

        const safeMime = validation.mimeType;
        const base64Data = `data:${safeMime};base64,${buffer.toString("base64")}`;
        return await uploadToCloudinary(base64Data, folder);
      });

      const results = await Promise.all(uploadPromises);

      return NextResponse.json({
        success: true,
        url: results[0]?.secure_url || "",
        urls: results.map((r) => r.secure_url),
        results,
      });
    } else {
      const body = await req.json();
      const { file, folder = "playoedappal/products" } = body;

      if (!file || typeof file !== "string") {
        return NextResponse.json(
          { success: false, error: "No file data provided (expected base64 data URI or image URL)" },
          { status: 400 }
        );
      }

      // If base64 data URI, validate magic bytes
      if (file.startsWith("data:image/")) {
        const base64Content = file.split(",")[1];
        if (base64Content) {
          const buffer = Buffer.from(base64Content, "base64");
          const validation = validateImageBuffer(buffer);
          if (!validation.isValid) {
            return NextResponse.json(
              { success: false, error: validation.error || "Invalid image binary content" },
              { status: 400 }
            );
          }
        }
      }

      const safeFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, "").slice(0, 80);
      const result = await uploadToCloudinary(file, safeFolder);
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        result,
      });
    }
  } catch (error: any) {
    console.error("Cloudinary upload security error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 400 }
    );
  }
}
