/**
 * High-performance image utilities for Cloudinary CDN delivery
 * Automatically injects f_auto (auto WebP/AVIF format) and q_auto (intelligent compression)
 * cutting payload sizes by 80-90% for lightning-fast loading speeds.
 */

export function getOptimizedImageUrl(
  url?: string | null,
  options?: {
    width?: number;
    height?: number;
    quality?: "auto" | "good" | "best" | "low";
    crop?: "fill" | "fit" | "limit" | "thumb";
  }
): string {
  if (!url || typeof url !== "string") {
    return "/images/catalog/porsche-drift-rc.jpg";
  }

  // If not hosted on Cloudinary, return as is
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  // Already transformed
  if (url.includes("/f_auto,q_auto") || url.includes("/q_auto,f_auto")) {
    return url;
  }

  const width = options?.width || 1000;
  const quality = options?.quality || "auto";
  const crop = options?.crop || "limit";

  let transformString = `f_auto,q_${quality},w_${width},c_${crop}`;
  if (options?.height) {
    transformString += `,h_${options.height}`;
  }

  // Insert transformation after /upload/
  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/${transformString}/`);
  }

  return url;
}

export function getThumbnailUrl(url?: string | null): string {
  return getOptimizedImageUrl(url, { width: 240, height: 240, crop: "fill" });
}

export function getHeroImageUrl(url?: string | null): string {
  return getOptimizedImageUrl(url, { width: 1200, quality: "auto" });
}
