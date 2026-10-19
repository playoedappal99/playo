import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDatabase } from "@/lib/mongodb";
import {
  authenticateAdminUser,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  isAuthenticatedAdmin,
  updateAdminPassword,
  DEFAULT_ADMIN_USER,
  ADMIN_EMAIL,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import { sendEmail, generateOtpEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

// In-memory brute-force protection
interface LoginAttempt {
  count: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttempt>();

// Temporary in-memory / DB reset tickets: ticket -> { email, expiresAt }
const resetTickets = new Map<string, { email: string; expiresAt: number }>();

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  return NextResponse.json({
    authenticated: isAuth,
    username: isAuth ? DEFAULT_ADMIN_USER : undefined,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Client IP for rate-limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // -------------------------------------------------------------
    // ACTION 1: LOGIN
    // -------------------------------------------------------------
    if (action === "login") {
      const { username, password } = body;

      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: "Username and password are required." },
          { status: 400 }
        );
      }

      // Check brute-force lockout
      const attempt = loginAttempts.get(ip);
      const now = Date.now();
      if (attempt && attempt.lockedUntil > now) {
        const remainingMinutes = Math.ceil((attempt.lockedUntil - now) / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Too many failed login attempts. Locked for security. Try again in ${remainingMinutes} minutes.`,
          },
          { status: 429 }
        );
      }

      const isValid = await authenticateAdminUser(username, password);

      if (!isValid) {
        // Record failed attempt
        const currentCount = (attempt?.count || 0) + 1;
        if (currentCount >= 5) {
          loginAttempts.set(ip, { count: currentCount, lockedUntil: now + 15 * 60 * 1000 });
          return NextResponse.json(
            { success: false, error: "Invalid credentials. Account locked for 15 minutes due to repeated failures." },
            { status: 429 }
          );
        } else {
          loginAttempts.set(ip, { count: currentCount, lockedUntil: 0 });
          return NextResponse.json(
            { success: false, error: `Invalid credentials. ${5 - currentCount} attempts remaining.` },
            { status: 401 }
          );
        }
      }

      // Success: clear lockout and set session cookie
      loginAttempts.delete(ip);
      const token = await setAdminSessionCookie(username);

      const response = NextResponse.json({
        success: true,
        message: "Authentication successful.",
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });

      return response;
    }

    // -------------------------------------------------------------
    // ACTION 2: LOGOUT
    // -------------------------------------------------------------
    if (action === "logout") {
      await clearAdminSessionCookie();
      const response = NextResponse.json({ success: true, message: "Logged out." });
      response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // -------------------------------------------------------------
    // ACTION 3: FORGOT PASSWORD (GENERATE & EMAIL OTP)
    // -------------------------------------------------------------
    if (action === "forgot-password") {
      const targetEmail = ADMIN_EMAIL;
      const otp = crypto.randomInt(100000, 999999).toString();
      const salt = crypto.randomBytes(16).toString("hex");
      const otpHash = crypto.pbkdf2Sync(otp, salt, 10000, 32, "sha256").toString("hex");

      const db = await getDatabase();
      // Invalidate existing unused OTPs for this email
      await db.collection("admin_otps").updateMany(
        { email: targetEmail, used: false },
        { $set: { used: true, invalidatedAt: new Date() } }
      );

      // Store new OTP with 10-minute expiry
      await db.collection("admin_otps").insertOne({
        email: targetEmail,
        otpHash,
        salt,
        attempts: 0,
        used: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      });

      // Send Email via native TLS SMTP
      const emailHtml = generateOtpEmailHtml(otp);
      const emailResult = await sendEmail({
        to: targetEmail,
        subject: `[Playo Edappal] Admin Password Reset Code: ${otp}`,
        html: emailHtml,
        text: `Your Playo Edappal Admin password reset OTP is: ${otp}. It expires in 10 minutes.`,
      });

      if (!emailResult.success) {
        console.error("Failed to send OTP email:", emailResult.error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to send email. Please check your network and mail settings.",
            details: emailResult.error,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to registered administrator email (${targetEmail.replace(/(.{3})(.*)(@.*)/, "$1***$3")}).`,
      });
    }

    // -------------------------------------------------------------
    // ACTION 4: VERIFY OTP
    // -------------------------------------------------------------
    if (action === "verify-otp") {
      const { otp } = body;
      if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 6-digit OTP code." },
          { status: 400 }
        );
      }

      const cleanOtp = otp.trim();
      const db = await getDatabase();
      const now = new Date();

      const activeOtp = await db.collection("admin_otps").findOne({
        email: ADMIN_EMAIL,
        used: false,
        expiresAt: { $gt: now },
      });

      if (!activeOtp) {
        return NextResponse.json(
          { success: false, error: "OTP expired or not found. Please request a new OTP." },
          { status: 400 }
        );
      }

      if (activeOtp.attempts >= 5) {
        await db.collection("admin_otps").updateOne(
          { _id: activeOtp._id },
          { $set: { used: true, reason: "max_attempts_exceeded" } }
        );
        return NextResponse.json(
          { success: false, error: "Maximum verification attempts exceeded. Please request a new OTP." },
          { status: 429 }
        );
      }

      // Verify OTP hash
      const checkHash = crypto.pbkdf2Sync(cleanOtp, activeOtp.salt, 10000, 32, "sha256").toString("hex");
      if (checkHash !== activeOtp.otpHash) {
        await db.collection("admin_otps").updateOne(
          { _id: activeOtp._id },
          { $inc: { attempts: 1 } }
        );
        const remaining = 4 - activeOtp.attempts;
        return NextResponse.json(
          { success: false, error: `Invalid OTP code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new OTP."}` },
          { status: 400 }
        );
      }

      // Mark OTP as used
      await db.collection("admin_otps").updateOne(
        { _id: activeOtp._id },
        { $set: { used: true, verifiedAt: new Date() } }
      );

      // Generate a short-lived reset ticket (valid for 15 minutes)
      const resetTicket = crypto.randomBytes(32).toString("hex");
      resetTickets.set(resetTicket, {
        email: ADMIN_EMAIL,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully. You can now set a new password.",
        resetTicket,
      });
    }

    // -------------------------------------------------------------
    // ACTION 5: RESET PASSWORD
    // -------------------------------------------------------------
    if (action === "reset-password") {
      const { resetTicket, newPassword } = body;

      if (!resetTicket || !resetTickets.has(resetTicket)) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired password reset session. Please request a new OTP." },
          { status: 403 }
        );
      }

      const ticketData = resetTickets.get(resetTicket)!;
      if (Date.now() > ticketData.expiresAt) {
        resetTickets.delete(resetTicket);
        return NextResponse.json(
          { success: false, error: "Password reset session has expired. Please request a new OTP." },
          { status: 403 }
        );
      }

      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      // Update password in MongoDB
      await updateAdminPassword(newPassword.trim());

      // Invalidate the reset ticket
      resetTickets.delete(resetTicket);

      // Also set the session cookie so the user is immediately logged in!
      const token = await setAdminSessionCookie(DEFAULT_ADMIN_USER);

      const response = NextResponse.json({
        success: true,
        message: "Administrator password updated successfully! Logged in.",
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });

      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("Admin Auth Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
