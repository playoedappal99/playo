"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  ShoppingCart, 
  Star, 
  ChevronRight, 
  ChevronDown,
  X, 
  CheckCircle2, 
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import BuyNowModal from "@/components/BuyNowModal";
import { PRODUCTS_DATA, ProductItem } from "@/data/store-data";
import { useCart } from "@/data/cart-store";

const BRANDS = [
  { label: "All", value: "all" },
  { label: "Porsche", value: "Porsche" },
  { label: "CCA", value: "CCA" },
  { label: "DriftPro", value: "DriftPro" },
  { label: "Bburago", value: "Bburago" },
  { label: "Playo", value: "Playo" },
];

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "RC Cars", value: "rc-cars" },
  { label: "Diecast Cars", value: "diecast" },
  { label: "Electric Ride-ons", value: "ride-ons" },
  { label: "Small Scooters", value: "scooters" },
  { label: "Mini Bikes", value: "mini-bikes" },
  { label: "Soft Toys", value: "soft-toys" },
  { label: "Learning & STEM", value: "learning" },
];

const COLORS = [
  { name: "Black", value: "black", hex: "#111827" },
  { name: "Pink", value: "pink", hex: "#ec4899" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Red", value: "red", hex: "#ef4444" },
];

const SCALES = [
  { label: "All", value: "all" },
  { label: "1:24", value: "1:24" },
  { label: "1:18", value: "1:18" },
  { label: "1:16", value: "1:16" },
  { label: "1:14", value: "1:14" },
];

interface FilterState {
  brand: string;
  category: string;
  color: string;
  scale: string;
  inStock: boolean;
  outOfStock: boolean;
  maxPrice: number;
}

const DEFAULT_FILTERS: FilterState = {
  brand: "all",
  category: "all",
  color: "all",
  scale: "all",
  inStock: false,
  outOfStock: false,
  maxPrice: 10000,
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlQuery = searchParams.get("q");
  const urlFilter = searchParams.get("filter");

  // Filters State: draft (staged) vs applied (active)
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<ProductItem | null>(null);

  const {
    cartItems,
    wishlistIds,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    totalCartCount,
  } = useCart();

  // Prevent background catalog page from scrolling when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileFilterOpen]);

  // Sync draft filters with applied filters when drawer opens
  const handleOpenMobileFilter = () => {
    setDraftFilters({ ...appliedFilters });
    setIsMobileFilterOpen(true);
  };

  // Close mobile filter without applying
  const handleCloseMobileFilter = () => {
    setDraftFilters({ ...appliedFilters });
    setIsMobileFilterOpen(false);
  };

  // Initialize from URL params
  useEffect(() => {
    if (urlCategory) {
      setDraftFilters((prev) => ({ ...prev, category: urlCategory }));
      setAppliedFilters((prev) => ({ ...prev, category: urlCategory }));
    }
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
    if (urlFilter === "wishlist") {
      setShowWishlistOnly(true);
    }
  }, [urlCategory, urlQuery, urlFilter]);

  // Apply filters handler: commits draft to applied and closes drawer if open
  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setIsMobileFilterOpen(false);
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setShowWishlistOnly(false);
    setIsMobileFilterOpen(false);
  };

  const isAnyFilterActive = useMemo(() => {
    return (
      appliedFilters.brand !== "all" ||
      appliedFilters.category !== "all" ||
      appliedFilters.color !== "all" ||
      appliedFilters.scale !== "all" ||
      appliedFilters.inStock ||
      appliedFilters.outOfStock ||
      appliedFilters.maxPrice < 10000 ||
      searchQuery.trim() !== "" ||
      showWishlistOnly
    );
  }, [appliedFilters, searchQuery, showWishlistOnly]);

  // Check if draft has unapplied changes
  const hasUnappliedChanges = useMemo(() => {
    return (
      draftFilters.brand !== appliedFilters.brand ||
      draftFilters.category !== appliedFilters.category ||
      draftFilters.color !== appliedFilters.color ||
      draftFilters.scale !== appliedFilters.scale ||
      draftFilters.inStock !== appliedFilters.inStock ||
      draftFilters.outOfStock !== appliedFilters.outOfStock ||
      draftFilters.maxPrice !== appliedFilters.maxPrice
    );
  }, [draftFilters, appliedFilters]);

  // Filter & Sort Logic (reflects ONLY appliedFilters)
  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS_DATA];

    if (showWishlistOnly) {
      list = list.filter((p) => wishlistIds.includes(p.id));
    }

    // Brand filter
    if (appliedFilters.brand !== "all") {
      list = list.filter((p) => (p.brand || p.specs?.brand) === appliedFilters.brand);
    }

    // Category filter
    if (appliedFilters.category !== "all") {
      list = list.filter((p) => p.categorySlug === appliedFilters.category);
    }

    // Color filter
    if (appliedFilters.color !== "all") {
      list = list.filter(
        (p) =>
          p.color === appliedFilters.color ||
          (p.specs?.color && p.specs.color.toLowerCase().includes(appliedFilters.color))
      );
    }

    // Scale filter
    if (appliedFilters.scale !== "all") {
      list = list.filter(
        (p) =>
          p.scale === appliedFilters.scale ||
          (p.specs?.scale && p.specs.scale.includes(appliedFilters.scale))
      );
    }

    // Availability filters
    if (appliedFilters.inStock && !appliedFilters.outOfStock) {
      list = list.filter((p) => p.inStock !== false);
    } else if (!appliedFilters.inStock && appliedFilters.outOfStock) {
      list = list.filter((p) => p.inStock === false);
    }

    // Max Price filter
    list = list.filter((p) => p.price <= appliedFilters.maxPrice);

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.tag && p.tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
        break;
      default:
        break;
    }

    return list;
  }, [appliedFilters, searchQuery, sortBy, showWishlistOnly, wishlistIds]);

  // Sidebar Filter Controls Component
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Brand */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Brand</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Select Brand</span>
          <div className="relative">
            <select
              value={draftFilters.brand}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, brand: e.target.value }))}
              className="appearance-none bg-transparent pr-5 pl-2 py-1 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none hover:text-gray-900"
            >
              {BRANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Category</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Select Category</span>
          <div className="relative">
            <select
              value={draftFilters.category}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="appearance-none bg-transparent pr-5 pl-2 py-1 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none hover:text-gray-900"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Color</h3>
          {draftFilters.color !== "all" && (
            <button
              type="button"
              onClick={() => setDraftFilters((prev) => ({ ...prev, color: "all" }))}
              className="text-[11px] text-sky-600 hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {COLORS.map((col) => {
            const isSelected = draftFilters.color === col.value;
            return (
              <button
                key={col.value}
                type="button"
                onClick={() => setDraftFilters((prev) => ({ ...prev, color: isSelected ? "all" : col.value }))}
                className={`w-6 h-6 rounded-full transition-all relative cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-gray-900 scale-110 shadow-sm"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
                aria-label={`Filter by color ${col.name}`}
              />
            );
          })}
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Scale</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Select Scale</span>
          <div className="relative">
            <select
              value={draftFilters.scale}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, scale: e.target.value }))}
              className="appearance-none bg-transparent pr-5 pl-2 py-1 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none hover:text-gray-900"
            >
              {SCALES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Availability</h3>
        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draftFilters.inStock}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, inStock: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
            />
            <span>In stock</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draftFilters.outOfStock}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, outOfStock: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
            />
            <span>Out of stock</span>
          </label>
        </div>
      </div>

      {/* Max Price */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Max Price</h3>
          <span className="text-sm font-bold text-gray-900">
            ₹{draftFilters.maxPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="pt-1">
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={draftFilters.maxPrice}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="w-full accent-gray-900 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
          />
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 font-medium">
            <span>₹0</span>
            <span>₹10,000</span>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleApplyFilters}
          className={`w-full py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
            hasUnappliedChanges
              ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30"
              : "bg-[#13202e] hover:bg-black text-white"
          }`}
        >
          <span>Apply</span>
          {hasUnappliedChanges && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Clear Filters Button */}
      {isAnyFilterActive && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <Navbar
        activePage="catalog"
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">Toy Catalog</span>
          {appliedFilters.category !== "all" && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sky-600 font-bold capitalize">
                {CATEGORIES.find((c) => c.value === appliedFilters.category)?.label || appliedFilters.category}
              </span>
            </>
          )}
        </nav>

        {/* Top Control Bar: Search, Mobile Filter Toggle, Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by toy name, brand, or scale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-gray-200/90 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={handleOpenMobileFilter}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs cursor-pointer hover:bg-gray-50 active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
              <span>Filters</span>
              {isAnyFilterActive && (
                <span className="w-2 h-2 rounded-full bg-sky-500" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "featured" | "price-low" | "price-high" | "rating")}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-2xs"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Main Layout: Left Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 bg-transparent pr-4">
            <FilterControls />
          </aside>

          {/* Product Grid Area */}
          <section className="flex-1 w-full min-w-0">
            {/* Results count & active badges */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
              </p>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 px-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No products match your criteria</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  Try adjusting or clearing your filters to see more results from our collection.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Grid of Products (2 columns on mobile, 2 on tablet, 3 on desktop) */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlistIds.includes(product.id);
                  const inCartItem = cartItems.find((item) => item.product.id === product.id);

                  return (
                    <ProductCard
                      key={product.id}
                      variant="catalog"
                      product={product}
                      isWishlisted={isWishlisted}
                      onToggleWishlist={toggleWishlist}
                      onAddToCart={(prod) => addToCart(prod)}
                      onBuyNow={(prod) => {
                        addToCart(prod);
                        setBuyNowProduct(prod);
                      }}
                      onQuickView={(prod) => setQuickViewProduct(prod)}
                      inCart={Boolean(inCartItem)}
                      cartQuantity={inCartItem?.quantity || 0}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filters Slide-over Drawer with background scroll-lock */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden overscroll-none">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity" 
            onClick={handleCloseMobileFilter}
          />
          <div 
            className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto overscroll-contain z-10 flex flex-col justify-between"
            style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                  <h2 className="text-base font-bold text-gray-900">Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={handleCloseMobileFilter}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterControls />
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-square bg-[#f8fafc] p-6 flex items-center justify-center">
                <Image
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
                    {quickViewProduct.brand || quickViewProduct.categorySlug}
                  </span>
                  <h2 className="text-xl font-extrabold text-gray-900 mt-2 mb-1">
                    {quickViewProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {quickViewProduct.reviewsCount} customer reviews
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-gray-900">
                      ₹{quickViewProduct.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{quickViewProduct.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {quickViewProduct.discount}
                    </span>
                  </div>

                  {/* Specs & Features List */}
                  <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                    {quickViewProduct.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {quickViewProduct.specs?.scale && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Scale: {quickViewProduct.specs.scale}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="py-3 px-3 bg-[#3ba4e6] hover:bg-[#2892d5] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <ShoppingCart className="w-4 h-4 shrink-0" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(quickViewProduct);
                        const prod = quickViewProduct;
                        setQuickViewProduct(null);
                        setBuyNowProduct(prod);
                      }}
                      className="py-3 px-3 bg-[#13202e] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-98"
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20I%20am%20interested%20in%20${encodeURIComponent(quickViewProduct.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Ask about this toy on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Now Instant Checkout Modal */}
      {buyNowProduct && (
        <BuyNowModal
          product={buyNowProduct}
          onClose={() => setBuyNowProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      <TrustBadges />
      <WhatsAppHelpStrip />
      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
