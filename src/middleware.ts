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

export function middleware(req: NextRequest) {
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
    (pathname.startsWith("/api/upload") && method === "POST");

  if (isMutatingAdminEndpoint) {
    const adminKey = process.env.ADMIN_API_KEY || "playo_secure_admin_key_2026_edappal";
    const requestKey = req.headers.get("x-admin-key");

    if (!requestKey || requestKey !== adminKey) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Valid admin security key required for this operation.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 5. Proceed with Security Headers
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
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
