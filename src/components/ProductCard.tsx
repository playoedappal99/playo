"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye
} from "lucide-react";
import { ProductItem } from "@/data/store-data";
import { getOptimizedImageUrl } from "@/lib/image-utils";

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

  const isOutOfStock = product.inStock === false;
  const brandName = product.brand || product.specs?.brand;
  const scaleText = product.scale || product.specs?.scale;

  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(23,33,43,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${className}`}
    >
      <div>
        {/* Top Image Container */}
        <Link
          href={`/product/${product.id}`}
          prefetch={true}
          className="relative aspect-[4/3] w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-gray-100 cursor-pointer block"
        >
          {/* Main Product Image - Fills entire container edge-to-edge without blank margins */}
          <div className="relative w-full h-full">
            <Image
              src={getOptimizedImageUrl(product.imageUrl, { width: 500 })}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-350 ease-out w-full h-full"
            />
          </div>

          {/* Top-Left Tag/Badge (NEW / BESTSELLER / SCALE) */}
          {product.tag ? (
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-sky-600 text-white shadow-xs">
              {product.tag}
            </span>
          ) : scaleText ? (
            <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wider bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
              {scaleText}
            </span>
          ) : null}



          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:shadow-md flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white transition-all cursor-pointer active:scale-90 ${
              isWishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Quick View Hover Cue (Desktop) */}
          {onQuickView && (
            <div className="hidden sm:flex absolute inset-0 bg-black/15 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none z-10">
              <span className="px-3 py-1 rounded-full bg-white/95 text-[11px] font-bold text-[#0D1B2A] shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick View</span>
              </span>
            </div>
          )}
        </Link>

        {/* Product Details Content */}
        <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-1.5">
          {/* Meta row: Brand & Scale */}
          <div className="flex items-center justify-between text-xs min-h-[1rem] sm:min-h-[1.125rem]">
            {brandName ? (
              <span className="text-sky-700 font-semibold tracking-wider uppercase text-[10px] sm:text-[11px] truncate">
                {brandName}
              </span>
            ) : scaleText ? (
              <span className="text-slate-500 font-medium text-[10px] sm:text-[11px]">
                Scale: {scaleText}
              </span>
            ) : (
              <span />
            )}

            {brandName && scaleText && (
              <span className="text-slate-500 font-medium text-[10px] sm:text-[11px] shrink-0 ml-1">
                {scaleText}
              </span>
            )}
          </div>

          {/* Product Name (14px mobile, 16px desktop, 2-line clamp) */}
          <Link href={`/product/${product.id}`} prefetch={true} className="block">
            <h3 className="text-sm sm:text-base font-semibold text-[#0D1B2A] leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.75rem] group-hover:text-sky-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Optional Rating Row if reviews exist */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 pt-0.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < product.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-400 text-[10px] sm:text-[11px]">
                ({product.reviewsCount || 12})
              </span>
            </div>
          )}

          {/* Price Row (diecastshub format: bold main price, original strikethrough) */}
          <div className="pt-1 sm:pt-2 flex items-baseline justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-base sm:text-[18px] font-bold text-[#0D1B2A]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] sm:text-[13px] text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row (diecastshub pattern: icon-only cart on mobile, full on desktop) */}
      <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-3.5 pt-0">
        {isOutOfStock ? (
          <div className="w-full">
            <button
              type="button"
              disabled
              className="w-full py-2 sm:py-2.5 px-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-300 text-white flex items-center justify-center cursor-not-allowed opacity-90"
            >
              Out of Stock
            </button>
          </div>
        ) : (
          <div className="flex items-stretch gap-1.5 sm:gap-2">
            {/* Add to Cart: compact square icon on mobile, full pill on desktop */}
            <button
              type="button"
              onClick={handleAddClick}
              className="w-10 sm:w-auto sm:flex-1 h-[38px] sm:h-auto py-2 sm:py-2.5 px-0 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 bg-[#0D1B2A] hover:bg-black text-white shrink-0"
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4 shrink-0 sm:mr-1.5 opacity-90" />
              <span className="hidden sm:inline truncate">Add to Cart</span>
            </button>

            {/* Buy Now: fills remaining space on mobile & desktop */}
            <button
              type="button"
              onClick={handleBuyNowClick}
              className="flex-1 h-[38px] sm:h-auto py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold bg-[#FF9800] hover:bg-[#F57C00] text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
              title="Buy Now"
            >
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

