"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Share2,
  ShoppingBag,
  Check,
  ChevronRight,
  Maximize2,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS_DATA, ProductItem } from "@/data/store-data";
import { useCart } from "@/data/cart-store";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string | undefined;

  // Find product by id, slug, or default to porsche / drift-rc-giftbox
  const product: ProductItem = useMemo(() => {
    if (!rawId) {
      return PRODUCTS_DATA.find((p) => p.id === "prod-porsche-rc") || PRODUCTS_DATA[0];
    }
    const found = PRODUCTS_DATA.find(
      (p) =>
        p.id === rawId ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === rawId.toLowerCase() ||
        (rawId.includes("porsche") && p.id === "prod-porsche-rc") ||
        (rawId.includes("drift") && p.id === "prod-drift-giftbox")
    );
    return (
      found ||
      PRODUCTS_DATA.find((p) => p.id === "prod-porsche-rc") ||
      PRODUCTS_DATA.find((p) => p.id === "prod-drift-giftbox") ||
      PRODUCTS_DATA[0]
    );
  }, [rawId]);

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

  // Gallery images list (showing side-by-side as in the screenshot)
  const galleryList = useMemo(() => {
    if (product.galleryImages && product.galleryImages.length > 0) {
      return product.galleryImages;
    }
    return [
      {
        url: product.imageUrl,
        label: `${product.name} angle 1`,
        angleName: "Angle 1",
      },
      {
        url: product.imageUrl,
        label: `${product.name} angle 2`,
        angleName: "Angle 2",
      },
    ];
  }, [product]);

  // Colors list
  const availableColors = useMemo(() => {
    if (Array.isArray(product.availableColors) && product.availableColors.length > 0) {
      return product.availableColors;
    }
    if (product.color) {
      return [{ name: product.color.toUpperCase(), inStock: true, imageIndex: 0 }];
    }
    return [{ name: "VIOLET", inStock: true, imageIndex: 0 }];
  }, [product]);

  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0]?.name || "VIOLET"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleSelectColor = (colorItem: { name: string; imageIndex?: number }) => {
    setSelectedColor(colorItem.name);
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < 10) {
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
    for (let i = 0; i < quantity; i++) {
      addToCart(product, false);
    }
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, false);
    }
    router.push("/checkout");
  };

  // Related products
  const relatedProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((p) => p.id !== product.id).slice(0, 4);
  }, [product]);

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

        {/* Product Details Main Stage: EXACTLY LIKE USER'S SCREENSHOT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* ================= LEFT: PRODUCT IMAGES (Side-by-side as in screenshot) ================= */}
            <div className="lg:col-span-7">
              <div
                className={`grid ${
                  galleryList.length === 1
                    ? "grid-cols-1 max-w-lg mx-auto"
                    : "grid-cols-1 sm:grid-cols-2"
                } gap-4 sm:gap-6`}
              >
                {galleryList.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxImage(item.url)}
                    className="relative aspect-square w-full bg-white rounded-lg overflow-hidden flex items-center justify-center cursor-zoom-in group"
                  >
                    <Image
                      src={item.url}
                      alt={item.label || product.name}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 35vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-102"
                    />

                    {/* Subtle enlarge hint on hover */}
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-full shadow-xs border border-gray-100">
                      <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>

              {/* If there are additional images (e.g., angle 3) */}
              {galleryList.length > 2 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                  {galleryList.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxImage(item.url)}
                      className="relative aspect-square rounded-md overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors p-1 bg-white cursor-pointer"
                    >
                      <Image
                        src={item.url}
                        alt={item.label}
                        fill
                        className="object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ================= RIGHT: PRODUCT DETAILS (Exact match to screenshot) ================= */}
            <div className="lg:col-span-5 max-w-lg">
              
              {/* Product Title & Share Icon Row */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0f172a]">
                  {product.name}
                </h1>

                {/* Share Button (Circular border icon as in screenshot) */}
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

              {/* Price */}
              <div className="text-base sm:text-lg text-slate-800 font-medium mt-1">
                Rs. {product.price.toLocaleString("en-IN")}
              </div>

              {/* Thin Divider Line */}
              <div className="border-b border-gray-100 my-6" />

              {/* Available Colors */}
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
                        onClick={() => handleSelectColor(colorItem)}
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

              {/* Actions Row: [- 1 +] and [🛍️ Add to cart] */}
              <div className="flex items-center gap-3 mt-6">
                
                {/* Quantity Box */}
                <div className="flex items-center justify-between w-28 sm:w-32 h-11 border border-gray-200 rounded-lg bg-[#f8fafc] px-3">
                  <button
                    type="button"
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                    className="text-gray-400 hover:text-gray-800 text-lg font-normal cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium text-slate-800 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= 10}
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
                  className="flex-1 h-11 border border-[#0f172a] rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 text-[#0f172a] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
                  <span>Add to cart</span>
                </button>
              </div>

              {/* Buy it now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-11 bg-[#111827] hover:bg-black active:bg-slate-900 text-white font-semibold text-sm rounded-lg flex items-center justify-center transition-colors cursor-pointer mt-3 shadow-xs"
              >
                <span>Buy it now</span>
              </button>

              {/* Features Section */}
              <div className="mt-8">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-3">
                  Features:
                </h3>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-900">Scale:</span>
                    <span className="text-slate-500 font-normal">
                      {product.scale || product.specs?.scale || "1:24"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-900">Category:</span>
                    <span className="text-slate-500 font-normal">
                      {product.category || product.categorySlug?.toUpperCase() || "GIFTS"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-900">Color:</span>
                    <span className="text-slate-500 font-normal">
                      {selectedColor}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-900">Material:</span>
                    <span className="text-slate-500 font-normal">
                      {product.specs?.material || "Diecast Metal with Plastic Parts"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Description Section */}
              <div className="mt-6">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-2">
                  Product Description
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 italic mb-2">
                  {product.description || "Celebrate every beautiful moment with us"}
                </p>

                <ul className="space-y-1 text-xs sm:text-sm text-slate-700">
                  {(
                    product.bullets || [
                      "Premium hamper box",
                      "RC car with gun type remote",
                      "extra tyre and drift cones",
                    ]
                  ).map((bullet, idx) => (
                    <li key={idx} className="flex items-center">
                      <span>-{bullet.replace(/^-+\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* Related products */}
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
