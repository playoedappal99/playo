"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, X, ShoppingBag } from "lucide-react";
import { ProductItem } from "@/data/store-data";

interface ToastItem {
  id: number;
  product: ProductItem;
  message: string;
}

export default function CartToast() {
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    const handleCartToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        product: ProductItem;
        message?: string;
      }>;
      if (customEvent.detail && customEvent.detail.product) {
        setToast({
          id: Date.now(),
          product: customEvent.detail.product,
          message: customEvent.detail.message || "Added to cart ✅",
        });
      }
    };

    window.addEventListener("playo_cart_toast", handleCartToast);
    return () => window.removeEventListener("playo_cart_toast", handleCartToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const handleOpenCart = () => {
    setToast(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("playo_open_cart"));
    }
  };

  return (
    <div
      key={toast.id}
      className="fixed bottom-5 right-4 sm:right-6 z-[99999] max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white text-gray-900 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3.5 ring-1 ring-black/5">
        {/* Product Image Thumbnail */}
        <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
          <Image
            src={toast.product.imageUrl}
            alt={toast.product.name}
            fill
            className="object-contain p-0.5"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <p className="text-xs font-bold text-emerald-700 leading-none">
              Added to cart ✅
            </p>
          </div>
          <h4 className="text-xs font-bold text-gray-900 truncate mt-1">
            {toast.product.name}
          </h4>
          <p className="text-[11px] font-semibold text-gray-500">
            ₹{toast.product.price.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Actions: View Cart & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenCart}
            className="px-2.5 py-1.5 rounded-xl bg-[#0D1B2A] hover:bg-[#16283C] text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3 text-orange-400" />
            <span>Cart</span>
          </button>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
