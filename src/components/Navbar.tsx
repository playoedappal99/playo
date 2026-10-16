"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  activePage?: "home" | "catalog" | "my-orders" | "contact";
}

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = (setSearchQuery ? searchQuery : localSearch).trim();
    if (setSearchQuery) {
      setSearchQuery(query);
    }
    setSearchOpen(false);
    setMobileMenuOpen(false);
    if (activePage !== "catalog") {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
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
            href="/#footer"
            className={`relative py-2 font-medium transition-colors group cursor-pointer ${
              activePage === "contact" ? "text-[#FF9800] font-semibold" : "text-gray-700 hover:text-[#0D1B2A]"
            }`}
          >
            <span>Contact</span>
            <span className={`absolute bottom-0 left-0 h-[2.5px] bg-[#FF9800] rounded-full transition-all duration-200 ${
              activePage === "contact" ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </Link>
        </nav>

        {/* Right Action Icons: Search, User (My Orders), ShoppingBag (Cart) */}
        <div className="flex items-center gap-5 sm:gap-6">
          
          {/* Search Icon Trigger */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              type="button"
              aria-label="Search toys"
              className="p-1.5 text-gray-800 hover:text-[#FF9800] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Expandable Search Input Popover */}
            {searchOpen && (
              <form 
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-10 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search toys, bikes, scooters..."
                  value={setSearchQuery ? searchQuery : localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full text-xs sm:text-sm text-gray-800 bg-transparent outline-none font-medium py-1.5"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Go
                </button>
              </form>
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
            {/* Orange notification badge matching brand */}
            <span className="absolute -top-1 -right-1 bg-[#FF9800] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {cartCount}
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search toys, cars, bikes..."
              value={setSearchQuery ? searchQuery : localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-xs text-gray-800 bg-transparent outline-none font-medium"
            />
            <button type="submit" className="text-xs bg-[#FF9800] hover:bg-[#F57C00] text-white px-3 py-1 rounded-full font-bold">Search</button>
          </form>

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
              href="/#footer"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                activePage === "contact" ? "text-[#FF9800] bg-orange-50/60" : "text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>Contact</span>
              {activePage === "contact" && <span className="w-2 h-2 rounded-full bg-[#FF9800]" />}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
