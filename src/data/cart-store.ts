"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductItem } from "@/data/store-data";
import { CartItem } from "@/components/CartDrawer";

const WISHLIST_STORAGE_KEY = "playo_wishlist_ids_db_v1";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch DB-backed cart on load
  const refreshCartFromDb = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCartItems(data.items);
        }
      }
    } catch (err) {
      console.error("Failed to load cart from DB:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCartFromDb();

    // Load wishlist
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      }
    } catch {
      // ignore
    }
  }, [refreshCartFromDb]);

  // Sync wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  // Open cart drawer event listener
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("playo_open_cart", handleOpenCart);
    return () => window.removeEventListener("playo_open_cart", handleOpenCart);
  }, []);

  // 2. Add to cart in database
  const addToCart = async (
    product: ProductItem,
    openDrawer: boolean = false,
    quantityToAdd: number = 1
  ) => {
    const availableStock = typeof product.stockCount === "number" ? product.stockCount : 10;
    if (availableStock <= 0) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("playo_cart_toast", {
            detail: {
              product,
              message: `"${product.name}" is currently out of stock.`,
              isError: true,
            },
          })
        );
      }
      return;
    }

    // Optimistic UI update with real-world quantity bounds
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const targetQty = Math.min(availableStock, existing.quantity + quantityToAdd);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      }
      const initialQty = Math.min(availableStock, Math.max(1, quantityToAdd));
      return [
        ...prev,
        {
          product: {
            ...product,
            stockCount: availableStock,
            inStock: availableStock > 0,
          },
          quantity: initialQty,
        },
      ];
    });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: quantityToAdd }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback and notify
        refreshCartFromDb();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("playo_cart_toast", {
              detail: {
                product,
                message: data.error || "Cannot add more than available stock",
                isError: true,
              },
            })
          );
        }
        return;
      }
      // Refresh to ensure exact sync
      refreshCartFromDb();
    } catch (err) {
      console.error("Error adding to cart:", err);
      refreshCartFromDb();
    }

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

  // 3. Update quantity: Never less than 1, never greater than available stock!
  const updateQuantity = async (productId: string, delta: number) => {
    let clampedQty = 1;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = typeof item.product.stockCount === "number" ? item.product.stockCount : 999;
          const calculated = item.quantity + delta;

          // Enforce bounds: min 1, max maxStock
          if (calculated < 1) {
            clampedQty = 1;
          } else if (calculated > maxStock) {
            clampedQty = maxStock;
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("playo_cart_toast", {
                  detail: {
                    product: item.product,
                    message: `Maximum stock limit reached (${maxStock} units).`,
                    isError: true,
                  },
                })
              );
            }
          } else {
            clampedQty = calculated;
          }
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );

    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: clampedQty }),
      });
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      refreshCartFromDb();
    }
  };

  // 4. Remove item from cart
  const removeFromCart = async (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));

    try {
      await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error removing from cart:", err);
      refreshCartFromDb();
    }
  };

  // 5. Clear cart
  const clearCart = async () => {
    setCartItems([]);
    try {
      await fetch("/api/cart?clear=true", { method: "DELETE" });
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
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
    isLoading,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCartFromDb,
    toggleWishlist,
    totalCartCount,
  };
}
