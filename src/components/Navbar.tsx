"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Search, 
  User, 
  Heart, 
  ShoppingCart, 
  ChevronDown,
  Sparkles,
  ArrowRight,
  Home,
  Menu,
  X
} from "lucide-react";

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categories = [
    { 
      name: "Home", 
      slug: "all", 
      isHome: true,
      items: []
    },
    { 
      name: "Small Scooters", 
      slug: "scooters", 
      emoji: "🛴",
      items: ["3-Wheel Kick Scooters", "LED Light Scooters", "Foldable Kids Scooters", "Toddler Balance Scooters"]
    },
    { 
      name: "Mini Bikes", 
      slug: "scooters", 
      emoji: "🚲",
      items: ["Balance Bikes", "Battery Mini Choppers", "Electric Dirt Bikes", "Training Wheel Bikes"]
    },
    { 
      name: "Toy Jeeps", 
      slug: "ride-ons", 
      emoji: "🚙",
      items: ["4x4 Electric Jeep", "Remote Controlled Jeeps", "Police Patrol Jeep", "Off-Road Safari Ride-on"]
    },
    { 
      name: "Various Toys", 
      slug: "learning", 
      emoji: "🧁",
      items: ["Stacking Rings", "Building Blocks", "Musical Activity Toys", "Montessori Puzzles"]
    },
    { 
      name: "Soft Toys", 
      slug: "soft-toys", 
      emoji: "🧸",
      items: ["Giant Teddy Bears", "Plush Puppies", "Animated Musical Dolls", "Baby Cuddle Pillows"]
    },
    { 
      name: "RC Cars", 
      slug: "rc-cars", 
      emoji: "🏎️",
      items: ["Speed Drift Racers", "Rock Crawlers", "Monster 4WD Trucks", "Rechargeable Stunt Cars"]
    },
    { 
      name: "Diecast Cars", 
      slug: "rc-cars", 
      emoji: "🚕",
      items: ["1:24 Scale Supercars", "Vintage Classic Models", "Metal Pullback Cars", "Collector Edition Sets"]
    },
  ];

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setActiveCategory(cat.name);
    onSelectCategory(cat.slug);
    setOpenDropdown(null);
  };

  return (
    <header className="w-full bg-white border-b border-gray-100/90 sticky top-0 z-50">
      {/* 1. Main Navigation Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
          
          {/* Brand Logo: ToyMall with cute Bear Icon */}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onSelectCategory("all"); setActiveCategory("Home"); }}
            className="flex items-center gap-2.5 select-none shrink-0 group transition-transform hover:scale-[1.02]"
          >
            {/* Bear Logo Graphic */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center">
              <Image
                src="/images/bear-avatar.png"
                alt="ToyMall Cute Bear Mascot"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Brand Typography */}
            <div className="flex flex-col -space-y-0.5">
              <div className="flex items-baseline font-black font-outfit text-2xl sm:text-[26px] tracking-tight">
                <span className="text-[#132c4a]">Toy</span>
                <span className="text-[#f59e0b]">Mall</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 tracking-wider">
                Toys • Fun • Happiness
              </span>
            </div>
          </a>

          {/* Search Bar (Centered Pill) */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <div className="relative w-full flex items-center rounded-full border border-gray-200/90 bg-[#f8fafc]/60 hover:bg-white focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-xs">
              <Search className="w-4 h-4 text-gray-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search for toys, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-2.5 pr-12 rounded-full text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none font-medium"
              />
              <button 
                type="button"
                aria-label="Search"
                className="absolute right-1 w-8 h-8 rounded-full bg-[#132c4a] hover:bg-[#1f3f66] text-white flex items-center justify-center transition-all shadow-xs active:scale-95"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Right Action Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Account */}
            <button className="flex flex-col items-center justify-center text-gray-700 hover:text-[#132c4a] transition-colors group">
              <User className="w-5 h-5 text-gray-700 stroke-[1.75] group-hover:text-[#132c4a]" />
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900">Account</span>
                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => onSelectCategory("all")}
              className="relative flex flex-col items-center justify-center text-gray-700 hover:text-rose-600 transition-colors group cursor-pointer"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-gray-700 stroke-[1.75] group-hover:text-rose-600" />
                <span className="absolute -top-1 -right-2 bg-[#ef4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              </div>
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 mt-0.5">Wishlist</span>
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="relative flex flex-col items-center justify-center text-gray-700 hover:text-[#132c4a] transition-colors group cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700 stroke-[1.75] group-hover:text-[#132c4a]" />
                <span className="absolute -top-1 -right-2 bg-[#ef4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              </div>
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 mt-0.5">Cart</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 sm:hidden">
          <div className="relative w-full flex items-center rounded-full border border-gray-200 bg-[#f8fafc] px-3 py-1.5 shadow-xs">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search for toys, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent outline-none font-medium"
            />
            <button 
              type="button"
              className="w-7 h-7 rounded-full bg-[#132c4a] text-white flex items-center justify-center shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Subnav Pills Bar */}
      <nav className="border-t border-gray-100/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2 overflow-x-auto no-scrollbar">
            
            {/* Category Pills List */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.name;

                if (cat.isHome) {
                  return (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                        isActive 
                          ? "bg-[#fef3c7] text-[#78350f] border border-amber-200/60" 
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Home className="w-3.5 h-3.5 text-gray-800" />
                      <span>{cat.name}</span>
                    </button>
                  );
                }

                return (
                  <div 
                    key={cat.name} 
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(cat.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-amber-50 text-amber-900 border border-amber-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-sm leading-none">{cat.emoji}</span>
                      <span>{cat.name}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                    </button>

                    {/* Hover Dropdown Menu */}
                    {openDropdown === cat.name && cat.items && cat.items.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {cat.items.map((subItem) => (
                          <button
                            key={subItem}
                            onClick={() => {
                              onSelectCategory(cat.slug);
                              setActiveCategory(cat.name);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs text-gray-600 hover:text-[#132c4a] hover:bg-amber-50/60 font-medium transition-colors"
                          >
                            {subItem}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* New Arrivals Action Pill (Right) */}
            <button
              onClick={() => {
                onSelectCategory("ride-ons");
                setActiveCategory("RC Cars");
              }}
              className="bg-[#132c4a] hover:bg-[#1a385c] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 ml-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>New Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1.5 animate-in slide-in-from-top duration-200">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                handleCategoryClick(cat);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-gray-900 rounded-lg text-left"
            >
              <span className="text-base">{cat.emoji || "🏠"}</span>
              <span>{cat.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              onSelectCategory("ride-ons");
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 bg-[#132c4a] text-white text-xs font-bold rounded-full shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
