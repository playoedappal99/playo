"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, MessageCircle, Check } from "lucide-react";
import { ProductItem } from "../data/store-data";

interface FeaturedPicksProps {
  products: ProductItem[];
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
}

export default function FeaturedPicks({
  products,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}: FeaturedPicksProps) {
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

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

  const handleAdd = (prod: ProductItem) => {
    onAddToCart(prod);
    setJustAddedId(prod.id);
    setTimeout(() => setJustAddedId(null), 1400);
  };

  return (
    <section id="products" className="py-12 sm:py-16 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0b1b2b] tracking-tight">
              Loved by little drivers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Top picks from our collection
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
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#0b1b2b] text-white shadow-sm"
                      : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8 Product Cards Grid (4 columns on desktop, 2 on tablet, 1 or 2 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filtered.map((item) => {
            const isWishlisted = wishlistIds.includes(item.id);
            const isAdded = justAddedId === item.id;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image & Wishlist Button */}
                  <div className="relative aspect-[4/3] w-full bg-white p-3 overflow-hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>

                    {/* Wishlist Heart Icon */}
                    <button
                      onClick={() => onToggleWishlist(item.id)}
                      aria-label="Wishlist"
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="px-4 pt-2 pb-3">
                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">({item.reviewsCount})</span>
                    </div>

                    {/* Pricing with Discount */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm sm:text-base font-black text-gray-950">
                        ₹ {item.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                        ₹ {item.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                        {item.discount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons (Add to Cart + WhatsApp) */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAdd(item)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[#0b1b2b] hover:bg-[#1a2d42] text-white active:scale-95"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp Order Button */}
                  <a
                    href={`https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20I%20am%20interested%20in%20${encodeURIComponent(item.name)}%20(₹${item.price})`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-2.5 rounded-lg text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
