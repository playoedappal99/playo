"use client";

import React, { useState } from "react";
import { ProductItem } from "../data/store-data";
import ProductCard from "./ProductCard";
import BuyNowModal from "./BuyNowModal";

interface FeaturedPicksProps {
  products: ProductItem[];
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onBuyNow?: (product: ProductItem) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
}

export default function FeaturedPicks({
  products,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
}: FeaturedPicksProps) {
  // Instant Buy Now Checkout State
  const [buyNowProduct, setBuyNowProduct] = useState<ProductItem | null>(null);

  const filterTabs = [
    { name: "All", slug: "all" },
    { name: "Ride-ons", slug: "ride-ons" },
    { name: "RC Cars", slug: "rc-cars" },
    { name: "Scooters", slug: "scooters" },
    { name: "Toys", slug: "toys" },
  ];

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.categorySlug === activeCategory);

  const handleBuyNow = (prod: ProductItem) => {
    onAddToCart(prod);
    if (onBuyNow) {
      onBuyNow(prod);
    }
    setBuyNowProduct(prod);
  };

  return (
    <section id="products" className="py-12 sm:py-16 bg-[#F5F7FA]" aria-label="Bestselling Products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight">
              Loved by little drivers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Top bestselling picks from our Edappal collection
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {filterTabs.map((tab) => {
              const active = activeCategory === tab.slug;
              return (
                <button
                  key={tab.slug}
                  onClick={() => onSelectCategory(tab.slug)}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF9800] ${
                    active
                      ? "bg-[#0D1B2A] text-white shadow-xs"
                      : "bg-white text-gray-700 hover:text-[#0D1B2A] border border-gray-200/90 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid: 2 per line on mobile, 4 per line on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filtered.map((item) => {
            const isWishlisted = wishlistIds.includes(item.id);

            return (
              <ProductCard
                key={item.id}
                product={item}
                isWishlisted={isWishlisted}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onBuyNow={handleBuyNow}
              />
            );
          })}
        </div>
      </div>

      {/* ========================================================
          INSTANT BUY NOW CHECKOUT MODAL
          Directly places the order when customer clicks "Buy Now"
         ======================================================== */}
      {buyNowProduct && (
        <BuyNowModal
          product={buyNowProduct}
          onClose={() => setBuyNowProduct(null)}
        />
      )}
    </section>
  );
}
