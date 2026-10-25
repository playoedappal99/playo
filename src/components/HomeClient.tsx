"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedPicks from "@/components/FeaturedPicks";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import TrustBadges from "@/components/TrustBadges";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ProductItem, CategoryItem } from "@/data/store-data";
import { useCart } from "@/data/cart-store";

interface HomeClientProps {
  initialProducts: ProductItem[];
  initialCategories: CategoryItem[];
}

export default function HomeClient({
  initialProducts,
  initialCategories,
}: HomeClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

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

  // Background silent refresh (no spinners or loading jumps)
  useEffect(() => {
    async function refreshStoreData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?nocache=true&t=${Date.now()}`, { cache: "no-store" }),
          fetch("/api/categories"),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        }
        if (catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error("Silent refresh error:", err);
      }
    }

    refreshStoreData();
  }, []);

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
    let result = products;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.categorySlug && p.categorySlug.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, searchQuery]);

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
        {/* 2. Hero Section */}
        <HeroSection
          onShopBestsellers={handleShopBestsellers}
          onExploreCategories={handleExploreCategories}
          onSelectCategory={handleSelectCategory}
        />

        {/* 3. Category Section: Dynamic from DB */}
        <CategorySection
          categories={categories}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Products Section: Dynamic from DB */}
        <FeaturedPicks
          products={filteredProducts}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onAddToCart={addToCart}
          onBuyNow={(prod) => {
            try {
              const directPayload = JSON.stringify({ product: prod, quantity: 1 });
              sessionStorage.setItem("playo_direct_checkout", directPayload);
              localStorage.setItem("playo_direct_checkout", directPayload);
            } catch {}
            addToCart(prod);
            router.push("/checkout");
          }}
          onToggleWishlist={toggleWishlist}
          wishlistIds={wishlistIds}
        />

        {/* 6. GEO & Search FAQs */}
        <FaqSection />

        {/* 9. WhatsApp Help Strip */}
        <WhatsAppHelpStrip />

        {/* 10. Trust Badges Pill Bar */}
        <TrustBadges />
      </main>

      {/* 11. Footer */}
      <Footer onSelectCategory={handleSelectCategory} categories={categories} />

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
