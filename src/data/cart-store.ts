"use client";

import { useState, useEffect } from "react";
import { ProductItem } from "@/data/store-data";
import { CartItem } from "@/components/CartDrawer";

const CART_STORAGE_KEY = "toymall_cart_items_v1";
const WISHLIST_STORAGE_KEY = "toymall_wishlist_ids_v1";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      }
    } catch {
      // ignore JSON errors
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds, isMounted]);

  // Listen to open cart drawer event
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("playo_open_cart", handleOpenCart);
    return () => window.removeEventListener("playo_open_cart", handleOpenCart);
  }, []);

  const addToCart = (product: ProductItem, openDrawer: boolean = false) => {
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
            features: product.features || ["100% Genuine", "Safe for kids", "Tested quality"],
            specs: product.specs || {},
            inStock: product.inStock !== false,
            tag: product.tag || "Bestseller",
          },
          quantity: 1,
        },
      ];
    });

    // Trigger toast notification
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("playo_cart_toast", {
          detail: { product, message: "Added to cart ✅" },
        })
      );
    }

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cartItems,
    wishlistIds,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    totalCartCount,
  };
}
