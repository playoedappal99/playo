"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye
} from "lucide-react";
import { ProductItem } from "@/data/store-data";

interface ProductCardProps {
  product: ProductItem;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onBuyNow: (product: ProductItem) => void;
  onQuickView?: (product: ProductItem) => void;
  inCart?: boolean;
  cartQuantity?: number;
  className?: string;
  variant?: "standard" | "catalog";
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onQuickView,
  inCart = false,
  cartQuantity = 0,
  className = "",
  variant = "catalog",
}: ProductCardProps) {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("playo_cart_toast", {
          detail: { product, message: "Added to cart ✅" },
        })
      );
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product);
  };

  if (variant === "catalog") {
    const isOutOfStock = product.inStock === false;
    const brandName = product.brand || product.specs?.brand;
    const scaleText = product.scale || product.specs?.scale;

    return (
      <div
        className={`group relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${className}`}
      >
        <div>
          {/* Top Image Container */}
          <div
            onClick={() => onQuickView && onQuickView(product)}
            className="relative aspect-square w-full bg-white p-2.5 sm:p-4 flex items-center justify-center overflow-hidden border-b border-gray-100/60 cursor-pointer"
          >
            <div className="relative w-full h-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            {/* Wishlist Button (shows on hover or if wishlisted) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-2 right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:shadow-md flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white transition-all cursor-pointer active:scale-90 ${
                isWishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <Heart
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                  isWishlisted ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </button>
          </div>

          {/* Product Details */}
          <div className="p-2.5 sm:p-4 pb-1.5 sm:pb-2 space-y-1 sm:space-y-2">
            {/* Meta row: Brand / Scale */}
            <div className="flex items-center justify-between text-xs min-h-[0.95rem] sm:min-h-[1.125rem]">
              {brandName ? (
                <span className="text-sky-600 font-semibold tracking-wider uppercase text-[10px] sm:text-[11px]">
                  {brandName}
                </span>
              ) : scaleText ? (
                <span className="text-slate-400 font-medium text-[10px] sm:text-[11px]">
                  {scaleText}
                </span>
              ) : (
                <span />
              )}

              {brandName && scaleText && (
                <span className="text-slate-400 font-medium text-[10px] sm:text-[11px]">
                  {scaleText}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h3
              onClick={() => onQuickView && onQuickView(product)}
              className="text-xs sm:text-sm font-bold text-gray-900 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] cursor-pointer"
            >
              {product.name}
            </h3>

            {/* Price */}
            <div className="pt-0.5">
              <span className="text-sm sm:text-lg font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="p-2.5 sm:p-4 pt-1 sm:pt-2">
          {isOutOfStock ? (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <button
                type="button"
                disabled
                className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium bg-[#94a3b8] text-white flex items-center justify-center cursor-not-allowed opacity-90 truncate"
              >
                Out of Stock
              </button>
              <button
                type="button"
                disabled
                className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium bg-[#94a3b8] text-white flex items-center justify-center cursor-not-allowed opacity-90 truncate"
              >
                Out of Stock
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleAddClick}
                className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 truncate bg-[#0D1B2A] hover:bg-black text-white"
                title="Add to Cart"
              >
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mr-1 opacity-90 hidden xs:inline" />
                <span className="truncate">Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNowClick}
                className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold bg-[#FF9800] hover:bg-[#F57C00] text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 truncate"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(13,27,42,0.08)] hover:border-amber-300/60 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${className}`}
    >
      <div>
        {/* Top Media Container */}
        <div 
          onClick={() => onQuickView && onQuickView(product)}
          className="relative aspect-[4/3] w-full bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]/50 p-2.5 sm:p-3.5 flex items-center justify-center overflow-hidden border-b border-gray-50 cursor-pointer"
        >
          {/* Product Image */}
          <div className="relative w-full h-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain object-center group-hover:scale-106 transition-transform duration-500 ease-out"
            />
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md shadow-xs hover:shadow-md flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white transition-all cursor-pointer active:scale-90"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Quick View Hover Cue (Desktop) */}
          {onQuickView && (
            <div className="hidden sm:flex absolute inset-0 bg-black/15 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-white/95 text-[11px] font-bold text-[#0D1B2A] shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick View</span>
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-4 pb-2 sm:pb-3 space-y-1.5 sm:space-y-2">
          {/* Rating Row */}
          <div className="flex items-center gap-1 font-bold text-gray-700">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < product.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onQuickView && onQuickView(product)}
            className="text-xs sm:text-sm font-bold text-[#0D1B2A] line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors min-h-[2.5rem] sm:min-h-[2.75rem] cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Quick Specs Pills */}
          {product.specs?.ageGroup && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] font-medium">
                Age: {product.specs.ageGroup}
              </span>
              {product.specs.battery && (
                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] sm:text-[10px] font-medium hidden xs:inline">
                  {product.specs.battery}
                </span>
              )}
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 pt-1">
            <span className="text-xs sm:text-base font-black text-[#0D1B2A]">
              ₹ {product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
              ₹ {product.originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto shrink-0">
              {product.discount}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Action Buttons: Add to Cart & Buy Now */}
      <div className="p-2.5 sm:p-4 pt-1 sm:pt-1.5 grid grid-cols-2 gap-1.5 sm:gap-2">
        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddClick}
          className="py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 bg-[#0D1B2A] hover:bg-black text-white hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#0D1B2A]"
          title="Add to Cart"
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0 hidden xs:inline opacity-90" />
          <span className="truncate">Add to Cart</span>
        </button>

        {/* Buy Now Button */}
        <button
          type="button"
          onClick={handleBuyNowClick}
          className="py-2 sm:py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black text-white bg-[#FF9800] hover:bg-[#F57C00] flex items-center justify-center shadow-sm shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-[#FF9800]"
          title="Instant 1-Step Checkout"
        >
          <span className="truncate">Buy Now</span>
        </button>
      </div>
    </div>
  );
}
