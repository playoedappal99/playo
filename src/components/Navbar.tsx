"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  ShoppingBag,
  Menu,
  X,
  Package,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Tag,
  Sparkles,
} from "lucide-react";
import { ProductItem, CategoryItem, PRODUCTS_DATA, CATEGORIES_DATA } from "@/data/store-data";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  activePage?: "home" | "catalog" | "my-orders" | "contact" | "admin" | "checkout" | string;
}

const POPULAR_SEARCHES = [
  "Kids Electric Jeep",
  "Mini Dirt Bike",
  "LED Kick Scooter",
  "Porsche Drift RC",
  "Diecast Supercar",
  "Baby Walker",
  "Electric Ride-on 12V",
  "Monster Truck RC",
];

export default function Navbar({
  cartCount = 0,
  onOpenCart,
  searchQuery = "",
  setSearchQuery,
  onSelectCategory,
  activePage = "home",
}: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [allProducts, setAllProducts] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>(CATEGORIES_DATA);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync local search when external prop changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Silently revalidate admin products and admin categories from database for live suggestions
  useEffect(() => {
    let isMounted = true;
    
    // Fetch latest admin categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setAllCategories(data.categories);
        }
      })
      .catch(() => {
        // Fallback already pre-hydrated with CATEGORIES_DATA
      });

    // Fetch latest products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {
        // Fallback already pre-hydrated with PRODUCTS_DATA
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // When search opens, re-fetch categories to immediately catch any newly added admin categories
  useEffect(() => {
    if (searchOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
            setAllCategories(data.categories);
          }
        })
        .catch(() => {});
    }
  }, [searchOpen]);

  // Close search popover on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  const currentQuery = (setSearchQuery ? searchQuery : localSearch) || "";
  const trimmedQuery = currentQuery.trim().toLowerCase();

  // Compute live suggestions
  const matchingProducts = useMemo(() => {
    if (!trimmedQuery) return [];
    return allProducts
      .filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(trimmedQuery);
        const catMatch = (p.category || p.categorySlug || "").toLowerCase().includes(trimmedQuery);
        const brandMatch = (p.brand || "").toLowerCase().includes(trimmedQuery);
        const tagMatch = (p.tag || "").toLowerCase().includes(trimmedQuery);
        return nameMatch || catMatch || brandMatch || tagMatch;
      })
      .slice(0, 5);
  }, [allProducts, trimmedQuery]);

  const matchingCategories = useMemo(() => {
    if (!trimmedQuery) return [];
    const sourceCategories = allCategories && allCategories.length > 0 ? allCategories : CATEGORIES_DATA;
    return sourceCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmedQuery) ||
        c.slug.toLowerCase().includes(trimmedQuery)
    ).slice(0, 4);
  }, [allCategories, trimmedQuery]);

  const matchingPopularSearches = useMemo(() => {
    if (!trimmedQuery) return [];
    return POPULAR_SEARCHES.filter((term) =>
      term.toLowerCase().includes(trimmedQuery)
    ).slice(0, 4);
  }, [trimmedQuery]);

  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery !== undefined ? customQuery : currentQuery).trim();
    if (setSearchQuery) {
      setSearchQuery(query);
    }
    setLocalSearch(query);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    if (activePage !== "catalog" || !setSearchQuery) {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  const handleProductClick = (productId: string) => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/product/${productId}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(categorySlug);
    }
    router.push(`/catalog?category=${categorySlug}`);
  };

  const handleTermClick = (term: string) => {
    handleSearchChange(term);
    handleSearchSubmit(undefined, term);
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Brand Logo: Playo */}
        <Link 
          href="/"
          onClick={() => {
            if (onSelectCategory) onSelectCategory("all");
          }}
          className="flex items-center select-none shrink-0 group transition-transform hover:scale-[1.03]"
          aria-label="Playo Home"
        >
          <div className="relative h-11 sm:h-12 md:h-13 w-auto flex items-center">
            <Image
              src="/images/playo-logo.png"
              alt="Playo Logo"
              width={160}
              height={66}
              priority
              className="h-10 sm:h-12 md:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Center Nav Links: Home, Catalog, My orders & tracking, Contact */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 font-medium text-sm lg:text-[15px]" aria-label="Main Navigation">
          {/* Home */}
          <Link
            href="/"
            className={`relative py-2 font-semibold transition-colors group cursor-pointer ${
              activePage === "home" ? "text-[#FF9800]" : "text-gray-700 hover:text-[#0D1B2A]"
            }`}
          >
            <span>Home</span>
            {activePage === "home" && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF9800] rounded-full" />
            )}
          </Link>

          {/* Catalog */}
          <Link
            href="/catalog"
            className={`relative py-2 font-medium transition-colors group cursor-pointer ${
              activePage === "catalog" ? "text-[#FF9800] font-semibold" : "text-gray-700 hover:text-[#0D1B2A]"
            }`}
          >
            <span>Catalog</span>
            <span className={`absolute bottom-0 left-0 h-[2.5px] bg-[#FF9800] rounded-full transition-all duration-200 ${
              activePage === "catalog" ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </Link>

          {/* My orders & tracking */}
          <Link
            href="/my-orders"
            className={`relative py-2 font-medium transition-colors group cursor-pointer ${
              activePage === "my-orders" ? "text-[#FF9800] font-semibold" : "text-gray-700 hover:text-[#0D1B2A]"
            }`}
          >
            <span>My orders & tracking</span>
            <span className={`absolute bottom-0 left-0 h-[2.5px] bg-[#FF9800] rounded-full transition-all duration-200 ${
              activePage === "my-orders" ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className={`relative py-2 font-medium transition-colors group cursor-pointer ${
              activePage === "contact" ? "text-[#FF9800] font-semibold" : "text-gray-700 hover:text-[#0D1B2A]"
            }`}
          >
            <span>Contact &amp; Store</span>
            <span className={`absolute bottom-0 left-0 h-[2.5px] bg-[#FF9800] rounded-full transition-all duration-200 ${
              activePage === "contact" ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </Link>
        </nav>

        {/* Right Action Icons: Search, User (My Orders), ShoppingBag (Cart) */}
        <div className="flex items-center gap-5 sm:gap-6">
          
          {/* Search Icon Trigger & Popover */}
          <div className="relative" ref={searchContainerRef}>
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) setMobileMenuOpen(false);
              }}
              type="button"
              aria-label="Search toys"
              className={`p-1.5 transition-colors cursor-pointer ${
                searchOpen ? "text-[#FF9800]" : "text-gray-800 hover:text-[#FF9800]"
              }`}
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Invisible Mobile Click-outside dismisser (no color dimming) */}
            {searchOpen && (
              <div 
                className="fixed inset-0 z-40 sm:hidden"
                onClick={() => setSearchOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Expandable Search Input & Live Suggestions Popover */}
            {searchOpen && (
              <div className="fixed inset-x-3 top-20 sm:top-12 sm:absolute sm:inset-auto sm:right-0 sm:w-[460px] max-w-[calc(100vw-24px)] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100/90 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col">
                
                {/* Search Input Bar */}
                <form 
                  onSubmit={(e) => handleSearchSubmit(e)}
                  className="flex items-center gap-2 p-2.5 sm:p-3 border-b border-gray-100 bg-white"
                >
                  <Search className="w-4 h-4 text-gray-400 ml-1 sm:ml-2 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search toys, cars, bikes, scooters..."
                    value={currentQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1 min-w-0 text-xs sm:text-sm text-gray-800 bg-transparent outline-none font-medium py-1 px-1 placeholder:text-gray-400"
                  />
                  {currentQuery && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange("")}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 shrink-0 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 sm:hidden shrink-0 cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>

                {/* Live Suggestions Body - Only displayed when the user starts typing */}
                {trimmedQuery ? (
                  <div className="max-h-[60vh] sm:max-h-[460px] overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4 text-left border-t border-gray-50">
                    {/* Matching Categories */}
                    {matchingCategories.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                          <Tag className="w-3 h-3 text-[#FF9800]" />
                          <span>Categories</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {matchingCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleCategoryClick(cat.slug)}
                              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF9800] text-xs font-bold transition-all border border-orange-200/60 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{cat.name}</span>
                              <ChevronRight className="w-3 h-3 text-orange-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Products */}
                    {matchingProducts.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#FF9800]" />
                            <span>Matching Toys ({matchingProducts.length})</span>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {matchingProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleProductClick(p.id)}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/50 transition-colors cursor-pointer group border border-transparent hover:border-orange-100"
                            >
                              <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-[#FF9800] transition-colors">
                                  {p.name}
                                </p>
                                <p className="text-[11px] text-gray-500 capitalize">
                                  {p.category || p.categorySlug}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs sm:text-sm font-extrabold text-[#0D1B2A]">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </p>
                                {p.discount && (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                                    {p.discount}
                                  </span>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF9800] transition-colors shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2.5">
                        <p className="text-xs sm:text-sm text-gray-600">
                          No exact toys found for <span className="font-bold text-gray-900">&quot;{currentQuery}&quot;</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Try searching for popular toys instead:
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                          {POPULAR_SEARCHES.slice(0, 5).map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleTermClick(term)}
                              className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF9800] text-xs font-semibold hover:bg-orange-100 transition-colors cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Searches */}
                    {matchingPopularSearches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                          <TrendingUp className="w-3 h-3 text-[#FF9800]" />
                          <span>Related Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {matchingPopularSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleTermClick(term)}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Search className="w-2.5 h-2.5 text-gray-400" />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Submit Trigger */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full py-2 px-3 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#FF9800] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-100 cursor-pointer"
                      >
                        <span>View all results for &quot;{currentQuery}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* User Account / Orders Icon */}
          <Link
            href="/my-orders"
            aria-label="My Orders & Account"
            className="p-1.5 text-gray-800 hover:text-[#FF9800] transition-colors cursor-pointer relative group"
            title="My Orders & Account"
          >
            <User className="w-5 h-5 stroke-[2]" />
          </Link>

          {/* Shopping Bag / Cart Icon with Orange Counter Badge */}
          <button
            onClick={onOpenCart}
            type="button"
            aria-label="Shopping Cart"
            className="p-1.5 text-gray-800 hover:text-[#FF9800] transition-colors relative cursor-pointer"
            title="View Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            <span className="absolute -top-1 -right-1 bg-[#FF9800] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {cartCount}
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (!mobileMenuOpen) setSearchOpen(false);
            }}
            type="button"
            aria-label="Toggle Navigation"
            className="md:hidden p-1.5 text-gray-800 hover:text-gray-900 cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
          {/* Mobile Search Form with guaranteed visible button */}
          <form 
            onSubmit={(e) => handleSearchSubmit(e)} 
            className="relative w-full flex items-center bg-gray-50 rounded-2xl px-3 py-2 border border-gray-200"
          >
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search toys, cars, bikes..."
              value={currentQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 min-w-0 text-xs sm:text-sm text-gray-800 bg-transparent outline-none font-medium pr-1"
            />
            {currentQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="p-1 text-gray-400 hover:text-gray-600 shrink-0 mr-1 cursor-pointer"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              type="submit" 
              className="shrink-0 whitespace-nowrap text-xs bg-[#FF9800] hover:bg-[#F57C00] text-white px-3.5 py-1.5 rounded-xl font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions in Mobile Drawer if typed */}
          {trimmedQuery && (
            <div className="bg-white rounded-2xl p-3 border border-orange-100 shadow-xs space-y-2.5">
              {matchingCategories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {matchingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF9800] text-[11px] font-bold"
                    >
                      {cat.name} →
                    </button>
                  ))}
                </div>
              )}
              {matchingProducts.length > 0 && (
                <div className="space-y-1.5">
                  {matchingProducts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.id)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain rounded bg-gray-50 shrink-0" />
                      ) : (
                        <Package className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500">₹{p.price.toLocaleString("en-IN")}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full text-center py-1.5 text-xs font-bold text-[#FF9800] hover:underline"
              >
                View all results for &quot;{currentQuery}&quot; →
              </button>
            </div>
          )}

          <div className="space-y-1 pt-1 font-medium text-sm">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                activePage === "home" ? "text-[#FF9800] bg-orange-50/60" : "text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>Home</span>
              {activePage === "home" && <span className="w-2 h-2 rounded-full bg-[#FF9800]" />}
            </Link>
            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                activePage === "catalog" ? "text-[#FF9800] bg-orange-50/60" : "text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>Catalog</span>
              {activePage === "catalog" && <span className="w-2 h-2 rounded-full bg-[#FF9800]" />}
            </Link>
            <Link
              href="/my-orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                activePage === "my-orders" ? "text-[#FF9800] bg-orange-50/60" : "text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>My orders & tracking</span>
              <Package className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                activePage === "contact" ? "text-[#FF9800] bg-orange-50/60" : "text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>Contact &amp; Store Location</span>
              {activePage === "contact" && <span className="w-2 h-2 rounded-full bg-[#FF9800]" />}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

