import crypto from "crypto";
import { getDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "playo_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SECRET = process.env.ADMIN_SESSION_SECRET || "playo_admin_jwt_secret_token_99_edappal_superkey_2026";

export const DEFAULT_ADMIN_USER = process.env.ADMIN_DEFAULT_USER || "playoedappal@admin";
export const DEFAULT_ADMIN_PASS = process.env.ADMIN_DEFAULT_PASS || "playoedappal123";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "playoedappal99@gmail.com";

/**
 * Hash a password using PBKDF2 with SHA-512 and random salt
 */
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

/**
 * Verify a password against salt and hash
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

/**
 * Create a cryptographically signed session token
 */
export function createSessionToken(username: string): string {
  const payload = {
    username,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const json = JSON.stringify(payload);
  const base64Payload = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(base64Payload).digest("base64url");
  return `${base64Payload}.${signature}`;
}

/**
 * Verify a signed session token
 */
export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  if (!token || !token.includes(".")) return { valid: false };
  const [base64Payload, signature] = token.split(".");
  if (!base64Payload || !signature) return { valid: false };

  const expectedSignature = crypto.createHmac("sha256", SECRET).update(base64Payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false };
  }

  try {
    const json = Buffer.from(base64Payload, "base64url").toString("utf8");
    const payload = JSON.parse(json);
    if (Date.now() > payload.expiresAt) {
      return { valid: false };
    }
    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}

/**
 * Check if the current request has a valid admin session
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return false;

    const verification = verifySessionToken(sessionCookie.value);
    return verification.valid;
  } catch {
    return false;
  }
}

/**
 * Set the admin session cookie on the response
 */
export async function setAdminSessionCookie(username: string) {
  const token = createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return token;
}

/**
 * Clear the admin session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Ensure default admin user is initialized in database
 */
export async function ensureAdminUserInitialized() {
  const db = await getDatabase();
  const existing = await db.collection("admin_users").findOne({ username: DEFAULT_ADMIN_USER });
  if (!existing) {
    const { hash, salt } = hashPassword(DEFAULT_ADMIN_PASS);
    await db.collection("admin_users").insertOne({
      username: DEFAULT_ADMIN_USER,
      email: ADMIN_EMAIL,
      passwordHash: hash,
      salt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Verify admin login credentials against MongoDB
 */
export async function authenticateAdminUser(username: string, pass: string): Promise<boolean> {
  const cleanUser = username.trim();
  const db = await getDatabase();
  let userDoc = await db.collection("admin_users").findOne({ username: cleanUser });

  if (!userDoc) {
    // If not in DB yet, check against default credentials
    if (cleanUser === DEFAULT_ADMIN_USER && pass === DEFAULT_ADMIN_PASS) {
      await ensureAdminUserInitialized();
      return true;
    }
    return false;
  }

  return verifyPassword(pass, userDoc.salt, userDoc.passwordHash);
}

/**
 * Update admin password in MongoDB
 */
export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  const db = await getDatabase();
  const { hash, salt } = hashPassword(newPassword);

  const res = await db.collection("admin_users").updateOne(
    { username: DEFAULT_ADMIN_USER },
    {
      $set: {
        passwordHash: hash,
        salt,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return res.acknowledged;
}
