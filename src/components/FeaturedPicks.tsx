"use client";

import React, { useState, useMemo } from "react";
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
  const [buyNowProduct, setBuyNowProduct] = useState<ProductItem | null>(null);

  // Dynamically compute category filter tabs from DB products
  const filterTabs = useMemo(() => {
    const map = new Map<string, string>();
    map.set("all", "All");
    products.forEach((p) => {
      const slug = p.categorySlug || "other";
      const name = p.category || slug.replace(/-/g, " ");
      if (!map.has(slug)) {
        map.set(slug, name.charAt(0).toUpperCase() + name.slice(1));
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ name, slug }));
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.categorySlug === activeCategory || p.category === activeCategory);
  }, [products, activeCategory]);

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
              Top bestselling picks from our Edappal showroom collection
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

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-xs text-gray-500">No toys available in this category yet.</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Buy Now Checkout Modal */}
      {buyNowProduct && (
        <BuyNowModal
          product={buyNowProduct}
          onClose={() => setBuyNowProduct(null)}
        />
      )}
    </section>
  );
}
