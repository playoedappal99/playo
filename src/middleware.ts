import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory sliding-window rate limiter for middleware edge runtime
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitEntry>();

// Malicious probe strings (SQLi, path traversal, exploit scanners)
const MALICIOUS_PATTERNS = [
  /\.\./,
  /%2e%2e/i,
  /\.env/i,
  /\.git/i,
  /wp-admin/i,
  /wp-login/i,
  /phpmyadmin/i,
  /<script/i,
  /eval\(/i,
  /etc\/passwd/i,
  /proc\/self/i,
];

async function verifySessionTokenEdge(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [base64Payload, signature] = token.split(".");
  if (!base64Payload || !signature) return false;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(base64Payload));
    const sigBytes = new Uint8Array(sigBuf);
    let binary = "";
    for (let i = 0; i < sigBytes.byteLength; i++) {
      binary += String.fromCharCode(sigBytes[i]);
    }
    const computedSignature = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (computedSignature !== signature) return false;

    // Check expiration
    const jsonStr = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(jsonStr);
    return typeof payload.expiresAt === "number" && Date.now() <= payload.expiresAt;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // 1. Block malicious traversal and bot scans
    const urlString = req.url;
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(urlString)) {
        return new NextResponse(
          JSON.stringify({ error: "Access Denied: Malicious request blocked" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 2. IP extraction
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // 3. Rate limiting for API endpoints
    if (pathname.startsWith("/api/")) {
      const now = Date.now();
      let limit = 120;
      let windowMs = 60000; // 1 minute

      if (pathname.startsWith("/api/upload")) {
        limit = 25;
        windowMs = 60000;
      } else if (pathname === "/api/orders" && method === "POST") {
        limit = 15;
        windowMs = 120000; // 2 minutes
      } else if (pathname.startsWith("/api/admin/auth")) {
        limit = 20;
        windowMs = 60000;
      }

      const rateKey = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;
      const record = ipMap.get(rateKey);

      if (!record || now > record.resetAt) {
        ipMap.set(rateKey, { count: 1, resetAt: now + windowMs });
      } else {
        record.count += 1;
        if (record.count > limit) {
          const retryAfter = Math.ceil((record.resetAt - now) / 1000);
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: "Too many requests. Rate limit exceeded, please slow down.",
              retryAfter,
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfter),
              },
            }
          );
        }
      }
    }

    // 4. Admin API Protection for mutating actions
    const isMutatingAdminEndpoint =
      (pathname.startsWith("/api/products") && (method === "POST" || method === "PUT" || method === "DELETE")) ||
      (pathname.startsWith("/api/categories") && (method === "POST" || method === "DELETE")) ||
      (pathname.startsWith("/api/offers") && (method === "POST" || method === "PATCH" || method === "DELETE")) ||
      (pathname.startsWith("/api/notifications") && (method === "PATCH" || method === "DELETE")) ||
      (pathname.startsWith("/api/upload") && method === "POST");

    if (isMutatingAdminEndpoint) {
      const adminKey = process.env.ADMIN_API_KEY || "playo_secure_admin_key_2026_edappal";
      const requestKey = req.headers.get("x-admin-key");
      const sessionSecret = process.env.ADMIN_SESSION_SECRET || "playo_admin_jwt_secret_token_99_edappal_superkey_2026";
      const sessionCookie = req.cookies.get("playo_admin_session")?.value;

      const isHeaderValid = Boolean(requestKey && requestKey === adminKey);
      const isCookieValid = await verifySessionTokenEdge(sessionCookie, sessionSecret);

      if (!isHeaderValid && !isCookieValid) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Unauthorized: Valid admin session or security key required for this operation.",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Security Headers
    const response = NextResponse.next();

    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://plus.unsplash.com; connect-src 'self' https://api.razorpay.com https://res.cloudinary.com; frame-src 'self' https://api.razorpay.com;"
    );

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
