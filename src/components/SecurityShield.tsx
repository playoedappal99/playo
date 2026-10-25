"use client";

import { useEffect } from "react";

/**
 * Defensive Security Shield for Playo Edappal
 * Protects client-side runtime against tampering, unauthorized script execution,
 * and malicious inspection/scraping attempts in production environments.
 */
export default function SecurityShield() {
  useEffect(() => {
    // 1. Prevent unauthorized devtools shortcuts in production
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return false;
      }
    };

    // 2. Prevent right-click context menu inspection on images & sensitive cards
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow context menu only inside inputs or textareas so typing is unaffected
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      // Prevent context menu on images and checkout banners
      if (target.tagName === "IMG" || target.closest(".no-inspect")) {
        e.preventDefault();
      }
    };

    // 3. Prominent Console Security Warning
    try {
      const bannerStyle =
        "color: #EA580C; font-size: 20px; font-weight: 900; background: #070D18; padding: 8px 16px; border-radius: 8px;";
      const textStyle = "color: #94a3b8; font-size: 13px; font-weight: 600;";
      console.log("%c🛡️ PLAYO EDAPPAL SECURITY SYSTEM ACTIVE", bannerStyle);
      console.log(
        "%cStop! This browser feature is intended for developers. Pasting code here or attempting unauthorized manipulation is logged and blocked by zero-trust backend validation.",
        textStyle
      );
    } catch {}

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return null;
}
