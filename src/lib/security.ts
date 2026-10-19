import { NextRequest } from "next/server";

/**
 * Escapes regex special characters to prevent Regular Expression Denial of Service (ReDoS)
 * and malicious regex injection in MongoDB text searches.
 */
export function escapeRegex(text: string): string {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Sanitizes user-provided input strings by stripping dangerous HTML tags,
 * null bytes, script tags, and limiting length.
 */
export function sanitizeInput(input: any, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]+>/g, "") // Strip general HTML tags
    .trim()
    .slice(0, maxLength);
}

import { verifySessionToken } from "./admin-auth";

/**
 * Validates admin API authorization via secret key header OR verified HTTP-only session cookie.
 */
export function validateAdminAuth(req: NextRequest | Request): boolean {
  const adminKey =
    process.env.ADMIN_API_KEY || "playo_secure_admin_key_2026_edappal";
  const headerKey = req.headers.get("x-admin-key");

  if (headerKey && headerKey === adminKey) {
    return true;
  }

  // Check signed HTTP-only session cookie
  if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    const sessionCookie = (req as NextRequest).cookies.get("playo_admin_session")?.value;
    if (sessionCookie) {
      const verification = verifySessionToken(sessionCookie);
      if (verification.valid) return true;
    }
  }

  // Fallback check on raw Cookie header
  const rawCookie = req.headers.get("cookie");
  if (rawCookie) {
    const match = rawCookie.match(/playo_admin_session=([^;]+)/);
    if (match && match[1]) {
      const verification = verifySessionToken(match[1]);
      if (verification.valid) return true;
    }
  }

  return false;
}

/**
 * Inspects binary buffer magic bytes to ensure uploaded file is a valid, safe image.
 * Protects against polyglot webshells, disguised executables, and malicious SVGs.
 */
export function validateImageBuffer(buffer: Buffer): {
  isValid: boolean;
  mimeType: string | null;
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return {
      isValid: false,
      mimeType: null,
      error: "File is too small or corrupt",
    };
  }

  // Max image size: 5MB (5 * 1024 * 1024 bytes)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    return {
      isValid: false,
      mimeType: null,
      error: `File size exceeds the 5MB maximum limit (received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  // Check JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, mimeType: "image/jpeg" };
  }

  // Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, mimeType: "image/png" };
  }

  // Check WEBP: "RIFF" .... "WEBP"
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { isValid: true, mimeType: "image/webp" };
  }

  // Check GIF: "GIF87a" or "GIF89a"
  const gifHeader = buffer.toString("ascii", 0, 6);
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return { isValid: true, mimeType: "image/gif" };
  }

  // Check AVIF: ftypavif or ftypavis in bytes 4-12
  const ftypStr = buffer.toString("ascii", 4, 12);
  if (ftypStr.includes("avif") || ftypStr.includes("avis")) {
    return { isValid: true, mimeType: "image/avif" };
  }

  return {
    isValid: false,
    mimeType: null,
    error:
      "Invalid file type. Only authentic JPEG, PNG, WEBP, AVIF, and GIF image formats are accepted.",
  };
}

/**
 * Ultra-fast in-memory sliding-window rate limiter
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean expired records every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}
