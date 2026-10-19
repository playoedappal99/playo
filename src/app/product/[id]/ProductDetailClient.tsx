"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Share2,
  ShoppingBag,
  Check,
  ChevronRight,
  Maximize2,
  X,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ProductItem } from "@/data/store-data";
import { useCart } from "@/data/cart-store";
import { getOptimizedImageUrl } from "@/lib/image-utils";

interface ProductDetailClientProps {
  initialProduct: ProductItem;
  initialRelatedProducts: ProductItem[];
}

export default function ProductDetailClient({
  initialProduct,
  initialRelatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const product = initialProduct;
  const relatedProducts = initialRelatedProducts;

  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    product.imageUrl || "/images/catalog/porsche-drift-rc.jpg"
  );

  const {
    cartItems,
    wishlistIds,
    toggleWishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    totalCartCount,
  } = useCart();

  // Comprehensive Gallery images list: merges main images, galleryImages, and all colorMapping images
  const galleryList = useMemo(() => {
    if (!product) return [];

    const list: { url: string; label: string; angleName?: string; color?: string }[] = [];
    const seenUrls = new Set<string>();

    // 1. Add images from galleryImages if defined
    if (Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      product.galleryImages.forEach((g) => {
        if (g?.url && !seenUrls.has(g.url)) {
          seenUrls.add(g.url);
          list.push({
            url: g.url,
            label: g.label || `${product.name} view`,
            angleName: g.angleName || "Angle",
            color: (g as any).color,
          });
        }
      });
    }

    // 2. Add images from product.images
    if (Array.isArray(product.images)) {
      product.images.forEach((url, idx) => {
        if (url && typeof url === "string" && !seenUrls.has(url)) {
          seenUrls.add(url);
          list.push({
            url,
            label: `${product.name} - View ${idx + 1}`,
            angleName: `Angle ${idx + 1}`,
          });
        }
      });
    }

    // 3. Add images from all colorMappings so no color variant is ever missing
    if (Array.isArray(product.colorMappings)) {
      product.colorMappings.forEach((cm: any) => {
        if (Array.isArray(cm.images)) {
          cm.images.forEach((url: string, cIdx: number) => {
            if (url && typeof url === "string" && !seenUrls.has(url)) {
              seenUrls.add(url);
              list.push({
                url,
                label: `${product.name} - ${cm.color || "Color"} (Angle ${cIdx + 1})`,
                angleName: cm.color ? `${cm.color}` : `Color ${cIdx + 1}`,
                color: cm.color,
              });
            }
          });
        }
      });
    }

    // 4. Fallback if no images found
    if (list.length === 0) {
      const fallback = product.imageUrl || "/images/catalog/porsche-drift-rc.jpg";
      list.push({
        url: fallback,
        label: `${product.name} - Main View`,
        angleName: "Main View",
      });
    }

    return list;
  }, [product]);

  // Keep active image in sync with gallery list
  useEffect(() => {
    if (galleryList.length > 0) {
      if (!activeImageUrl || !galleryList.some((g) => g.url === activeImageUrl)) {
        setActiveImageUrl(galleryList[0].url);
      }
    }
  }, [galleryList, activeImageUrl]);

  // Colors list from DB
  const availableColors = useMemo(() => {
    if (!product) return [{ name: "Standard", inStock: true, imageIndex: 0 }];
    if (Array.isArray(product.availableColors) && product.availableColors.length > 0) {
      return product.availableColors;
    }
    if (typeof product.availableColors === "string" && product.availableColors.trim()) {
      const parts = product.availableColors.split(",").map((c) => c.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts.map((name) => ({ name: name.toUpperCase(), inStock: true, imageIndex: 0 }));
      }
    }
    if (product.color) {
      return [{ name: product.color.toUpperCase(), inStock: true, imageIndex: 0 }];
    }
    return [{ name: "STANDARD", inStock: true, imageIndex: 0 }];
  }, [product]);

  // Handle color selection: changes color and switches hero image to that color variant if available
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    if (!product || !Array.isArray(product.colorMappings)) return;
    const target = colorName.toLowerCase().trim();
    const matching = product.colorMappings.find((cm: any) => {
      if (!cm.color) return false;
      const subColors = cm.color.toLowerCase().split(",").map((s: string) => s.trim());
      return subColors.includes(target) || cm.color.toLowerCase().includes(target);
    });
    if (matching && Array.isArray(matching.images) && matching.images.length > 0) {
      setActiveImageUrl(matching.images[0]);
    }
  };

  // Handle thumbnail selection: switches hero image and selects matching color if associated
  const handleSelectThumbnail = (item: { url: string; color?: string }) => {
    setActiveImageUrl(item.url);
    if (item.color) {
      setSelectedColor(item.color.toUpperCase());
    }
  };

  // Update selected color when availableColors change
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].name);
    }
  }, [availableColors, selectedColor]);

  const maxStock = product && typeof product.stockCount === "number" ? product.stockCount : 10;
  const isOutOfStock = !product || maxStock <= 0 || product.inStock === false;

  // Real-world quantity bounds: min 1, max availableStock
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, true, quantity);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, false, quantity);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#0284c7] selection:text-white">
      {/* 1. Navbar */}
      <Navbar
        activePage="catalog"
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 pb-16">
        {/* Breadcrumb row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 mx-1.5 text-slate-300" />
            <Link href="/catalog" className="hover:text-slate-800 transition-colors">
              Catalog
            </Link>
            <ChevronRight className="w-3 h-3 mx-1.5 text-slate-300" />
            <span className="text-slate-700 font-semibold truncate">{product.name}</span>
          </nav>
        </div>

        {/* Product Details Main Stage */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* ================= LEFT: PRODUCT IMAGES ================= */}
            <div className="lg:col-span-7 space-y-4">
              {/* Primary Showcase Image Stage */}
              <div className="relative aspect-square sm:aspect-[4/3] w-full bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/80 shadow-xs group">
                <Image
                  src={getOptimizedImageUrl(activeImageUrl || product.imageUrl, { width: 1200 })}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-102 cursor-zoom-in"
                  onClick={() => setLightboxImage(activeImageUrl || product.imageUrl)}
                />

                {/* Lightbox / Zoom Trigger Icon */}
                <button
                  type="button"
                  onClick={() => setLightboxImage(activeImageUrl || product.imageUrl)}
                  className="absolute top-3.5 right-3.5 opacity-90 hover:opacity-100 bg-white/95 backdrop-blur-xs p-2 rounded-xl shadow-xs border border-gray-100 text-gray-700 hover:text-black transition-all cursor-pointer"
                  title="Zoom Image"
                  aria-label="Zoom Image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Left / Right Carousel Controls if Multiple Images */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const curIdx = galleryList.findIndex((g) => g.url === (activeImageUrl || product.imageUrl));
                        const prevIdx = (curIdx - 1 + galleryList.length) % galleryList.length;
                        handleSelectThumbnail(galleryList[prevIdx]);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 hover:text-black text-xl font-bold transition-all cursor-pointer select-none"
                      aria-label="Previous view"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const curIdx = galleryList.findIndex((g) => g.url === (activeImageUrl || product.imageUrl));
                        const nextIdx = (curIdx + 1) % galleryList.length;
                        handleSelectThumbnail(galleryList[nextIdx]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 hover:text-black text-xl font-bold transition-all cursor-pointer select-none"
                      aria-label="Next view"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Active View / Color Tag Overlay */}
                {galleryList.find((g) => g.url === (activeImageUrl || product.imageUrl))?.angleName && (
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {galleryList.find((g) => g.url === (activeImageUrl || product.imageUrl))?.angleName}
                  </div>
                )}
              </div>

              {/* Complete Gallery Thumbnail Strip (All Angles + Color Variants) */}
              {galleryList.length > 1 && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1 font-semibold">
                    <span>All Available Views & Colors ({galleryList.length})</span>
                    <span className="text-[11px] text-slate-400">Click to switch preview</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {galleryList.map((item, idx) => {
                      const isActive = (activeImageUrl || product.imageUrl) === item.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectThumbnail(item)}
                          className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-white shrink-0 border transition-all cursor-pointer p-1 ${
                            isActive
                              ? "border-[#0284c7] ring-2 ring-[#0284c7] ring-offset-2 shadow-sm scale-102"
                              : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                          }`}
                          title={item.label}
                        >
                          <Image
                            src={getOptimizedImageUrl(item.url, { width: 180, height: 180, crop: "fill" })}
                            alt={item.label || `${product.name} view ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                          {item.color && (
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white text-[8px] font-black text-center py-0.5 truncate uppercase">
                              {item.color}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ================= RIGHT: PRODUCT DETAILS ================= */}
            <div className="lg:col-span-5 max-w-lg">
              {/* Product Title & Share Icon Row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  {product.brand && (
                    <span className="text-xs font-bold text-sky-600 tracking-wider uppercase block mb-1">
                      {product.brand}
                    </span>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0f172a]">
                    {product.name}
                  </h1>
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer shrink-0 mt-0.5"
                  title="Share product link"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {copiedLink && (
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  Link copied to clipboard ✓
                </p>
              )}

              {/* Price & Stock Status Badge */}
              <div className="flex items-center gap-3 mt-2">
                <div className="text-lg sm:text-xl text-slate-800 font-extrabold">
                  ₹{product.price.toLocaleString("en-IN")}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {product.discount && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {product.discount}
                  </span>
                )}
              </div>

              {/* Stock status announcement */}
              <div className="mt-2.5">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Out of Stock (0 units remaining)</span>
                  </span>
                ) : maxStock < 3 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Hurry! Only {maxStock} unit(s) left in stock</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock ({maxStock} available)</span>
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="border-b border-gray-100 my-6" />

              {/* Available Colors */}
              {availableColors.length > 0 && (
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 block mb-2">
                    Available Colors:
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((colorItem) => {
                      const isSelected = selectedColor === colorItem.name;
                      return (
                        <button
                          key={colorItem.name}
                          type="button"
                          onClick={() => handleSelectColor(colorItem.name)}
                          className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? "border border-[#0ea5e9] bg-[#f0f9ff] text-[#0284c7]"
                              : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {colorItem.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions Row: [- QTY +] and [Add to cart] */}
              <div className="flex items-center gap-3 mt-6">
                {/* Quantity Box: strictly bounded: 1 <= qty <= maxStock */}
                <div className="flex items-center justify-between w-28 sm:w-32 h-11 border border-gray-200 rounded-lg bg-[#f8fafc] px-3">
                  <button
                    type="button"
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="text-gray-400 hover:text-gray-800 text-lg font-normal cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium text-slate-800 text-center select-none">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= maxStock || isOutOfStock}
                    className="text-gray-400 hover:text-gray-800 text-lg font-normal cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-11 border border-[#0f172a] rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 text-[#0f172a] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to cart"}</span>
                </button>
              </div>

              {/* Buy it now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full h-11 bg-[#111827] hover:bg-black active:bg-slate-900 text-white font-semibold text-sm rounded-lg flex items-center justify-center transition-colors cursor-pointer mt-3 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{isOutOfStock ? "Out of Stock" : "Buy it now"}</span>
              </button>

              {/* Features Section */}
              <div className="mt-8">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-3">
                  Features:
                </h3>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  {product.brand && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">Brand:</span>
                      <span className="text-slate-500 font-normal">{product.brand}</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-900">Category:</span>
                    <span className="text-slate-500 font-normal">
                      {product.category || product.categorySlug?.toUpperCase()}
                    </span>
                  </div>

                  {product.scale && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">Scale:</span>
                      <span className="text-slate-500 font-normal">{product.scale}</span>
                    </div>
                  )}

                  {selectedColor && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">Color:</span>
                      <span className="text-slate-500 font-normal">{selectedColor}</span>
                    </div>
                  )}

                  {product.material && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">Material:</span>
                      <span className="text-slate-500 font-normal">{product.material}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description Section */}
              {product.description && (
                <div className="mt-6">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-2">
                    Product Description
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products from DB */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                More Recommended Toys
              </h2>
              <Link
                href="/catalog"
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  isWishlisted={wishlistIds.includes(item.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={(p) => addToCart(p, false)}
                  onBuyNow={(p) => {
                    addToCart(p, false);
                    router.push("/checkout");
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <WhatsAppHelpStrip />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-7 h-7" />
          </button>
          <div className="relative w-full max-w-3xl aspect-square">
            <Image
              src={lightboxImage}
              alt="Enlarged view"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
