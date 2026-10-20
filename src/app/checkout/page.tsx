"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutSection from "@/components/CheckoutSection";
import { useCart } from "@/data/cart-store";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, wishlistIds, setIsCartOpen } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // By passing null, CheckoutSection checks out all active items in the database-backed cart
  const checkoutProduct = null;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      <Navbar
        activePage="checkout"
        cartCount={isMounted ? cartItems.reduce((acc, i) => acc + i.quantity, 0) : 0}
        wishlistCount={isMounted ? wishlistIds.length : 0}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>

        {/* The Exact Checkout Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
          <CheckoutSection
            product={checkoutProduct}
            isModal={false}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
