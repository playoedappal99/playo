"use client";

import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";

interface AdminAuthScreenProps {
  onAuthenticated: () => void;
}

export default function AdminAuthScreen({ onAuthenticated }: AdminAuthScreenProps) {
  const [mode, setMode] = useState<"login" | "forgot" | "otp" | "reset">("login");
  const [username, setUsername] = useState("playoedappal@admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP & Reset States
  const [otpCode, setOtpCode] = useState("");
  const [resetTicket, setResetTicket] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Anti-Inspection & DevTools Deterrents
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    // Security warning in console
    console.clear();
    console.log(
      "%cPLAYO EDAPPAL SECURITY PROTOCOL ACTIVE",
      "color: #FF9800; font-size: 20px; font-weight: 900; background: #0D1B2A; padding: 8px 16px; border-radius: 8px;"
    );
    console.log(
      "%cUnauthorized access, inspection, or API manipulation is strictly recorded and blocked.",
      "color: #ef4444; font-size: 13px; font-weight: bold;"
    );

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 1. Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPassword("");
        onAuthenticated();
      } else {
        setErrorMsg(data.error || "Invalid username or password.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request OTP for Forgot Password
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-password" }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "OTP sent to registered email.");
        setMode("otp");
      } else {
        setErrorMsg(data.error || "Failed to send OTP.");
      }
    } catch {
      setErrorMsg("Network error sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.resetTicket) {
        setResetTicket(data.resetTicket);
        setSuccessMsg("OTP verified. Please enter your new password.");
        setMode("reset");
      } else {
        setErrorMsg(data.error || "Invalid OTP code.");
      }
    } catch {
      setErrorMsg("Network error verifying OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          resetTicket,
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Password reset successfully! Logging you in...");
        setTimeout(() => {
          onAuthenticated();
        }, 1000);
      } else {
        setErrorMsg(data.error || "Failed to reset password.");
      }
    } catch {
      setErrorMsg("Network error updating password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex flex-col items-center justify-center p-4 selection:bg-[#FF9800] selection:text-white">
      {/* Background Decorative Rings */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-orange-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-amber-500/30" />
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md bg-[#16283C]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-8 space-y-6">
        {/* Minimal Shield Badge */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D1B2A] border border-[#FF9800]/40 flex items-center justify-center shadow-lg shadow-orange-500/10">
            <Lock className="w-6 h-6 text-[#FF9800]" />
          </div>
        </div>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================
            VIEW 1: SIGN IN (USERNAME & PASSWORD ONLY)
           ======================================================== */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 text-sm rounded-xl bg-[#0D1B2A] border border-white/10 text-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/20 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 text-sm rounded-xl bg-[#0D1B2A] border border-white/10 text-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/20 outline-none transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-[#0D1B2A] font-black text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-orange-500/20 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setMode("forgot");
                }}
                className="text-xs font-semibold text-gray-400 hover:text-[#FF9800] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            VIEW 2: FORGOT PASSWORD (REQUEST OTP)
           ======================================================== */}
        {mode === "forgot" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="text-center space-y-1.5">
              <p className="text-xs text-gray-300">
                A 6-digit verification code will be sent to the registered email:
              </p>
              <p className="text-xs font-mono font-bold text-amber-400 bg-[#0D1B2A] py-1.5 px-3 rounded-lg border border-white/10">
                playoedappal99@gmail.com
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-[#0D1B2A] font-black text-sm transition-all cursor-pointer shadow-md shadow-orange-500/20 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setMode("login");
                }}
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            VIEW 3: ENTER 6-DIGIT OTP
           ======================================================== */}
        {mode === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center">
              <label className="block text-xs text-gray-300 mb-2">
                Enter the 6-digit code sent to your email
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                className="w-full text-center tracking-[12px] text-2xl font-black font-mono px-4 py-3 rounded-xl bg-[#0D1B2A] border border-[#FF9800]/50 text-[#FF9800] placeholder-gray-600 focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-[#0D1B2A] font-black text-sm transition-all cursor-pointer shadow-md shadow-orange-500/20 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="text-gray-400 hover:text-[#FF9800] transition-colors cursor-pointer"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setMode("login");
                }}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            VIEW 4: SET NEW PASSWORD
           ======================================================== */}
        {mode === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 6 chars)"
                className="w-full px-4 py-3 text-sm rounded-xl bg-[#0D1B2A] border border-white/10 text-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/20 outline-none transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-4 py-3 text-sm rounded-xl bg-[#0D1B2A] border border-white/10 text-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-[#0D1B2A] font-black text-sm transition-all cursor-pointer shadow-md shadow-orange-500/20 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password & Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* Clean Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session • Rate-Limited Protection</span>
        </div>
      </div>
    </div>
  );
}
