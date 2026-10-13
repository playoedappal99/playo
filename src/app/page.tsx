"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedPicks from "@/components/FeaturedPicks";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import Testimonials from "@/components/Testimonials";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import Footer from "@/components/Footer";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import { PRODUCTS_DATA, ProductItem } from "@/data/store-data";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Cart Management
  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product: {
            ...product,
            category: product.categorySlug,
            discount: product.discount,
            features: ["100% Genuine", "Safe for kids"],
            specs: {},
            inStock: true,
            tag: "Bestseller",
          },
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

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

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Header with Top Announcement, Logo, Search, and Subnav */}
      <Navbar
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
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
        />

        {/* 5. Promotional Banner: "Up to 35% off electric rides" with countdown timer */}
        <SpecialOfferBanner
          onShopNow={() => handleSelectCategory("ride-ons")}
        />

        {/* 6. Customer Testimonials: "What our happy customers say" */}
        <Testimonials />

        {/* 7. WhatsApp Help Strip: "Need help? Chat with us on WhatsApp" */}
        <WhatsAppHelpStrip />
      </main>

      {/* 8. Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
