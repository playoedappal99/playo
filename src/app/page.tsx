"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedPicks from "@/components/FeaturedPicks";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import TrustBadges from "@/components/TrustBadges";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { PRODUCTS_DATA } from "@/data/store-data";
import { useCart } from "@/data/cart-store";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const handleSelectCategory = (slug: string) => {
    setActiveCategory(slug);
    const targetElement = document.getElementById("products");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShopBestsellers = () => {
    setActiveCategory("all");
    const targetElement = document.getElementById("products");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExploreCategories = () => {
    const targetElement = document.getElementById("categories");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS_DATA;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Header with Brand Logo, Navigation, Search, and Cart */}
      <Navbar
        activePage="home"
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={handleSelectCategory}
      />

      <main className="flex-1">
        {/* 2. Hero Section: "Big adventures start with little toys" */}
        <HeroSection
          onShopBestsellers={handleShopBestsellers}
          onExploreCategories={handleExploreCategories}
          onSelectCategory={handleSelectCategory}
        />

        {/* 3. Category Section: "Find their next favourite" */}
        <CategorySection onSelectCategory={handleSelectCategory} />

        {/* 4. Products Section: "Loved by little drivers" */}
        <FeaturedPicks
          products={filteredProducts}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onAddToCart={addToCart}
          onBuyNow={(prod) => {
            addToCart(prod);
          }}
          onToggleWishlist={toggleWishlist}
          wishlistIds={wishlistIds}
        />

        {/* 5. Promotional Banner: "Up to 35% off electric rides" with countdown timer */}
        <SpecialOfferBanner
          onShopNow={() => handleSelectCategory("ride-ons")}
        />

        {/* 6. WhatsApp Help Strip: "Need help? Chat with us on WhatsApp" */}
        <WhatsAppHelpStrip />

        {/* 8. Trust Badges Pill Bar (Before Footer) */}
        <TrustBadges />
      </main>

      {/* 9. Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}
