"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductItem } from "@/data/store-data";
import { CartItem } from "@/components/CartDrawer";

const CART_STORAGE_KEY = "playo_cart_items_v3";
const CART_SESSION_KEY = "playo_cart_session_id_v3";
const WISHLIST_STORAGE_KEY = "playo_wishlist_ids_db_v1";

function getClientSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(CART_SESSION_KEY);
  if (!sid) {
    sid = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(CART_SESSION_KEY, sid);
  }
  return sid;
}

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("playo_cart_synced", { detail: items }));
  } catch {}
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial hydration from localStorage (0ms latency, never empty if items exist)
  useEffect(() => {
    const local = loadLocalCart();
    if (local.length > 0) {
      setCartItems(local);
    }

    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      }
    } catch {}
  }, []);

  // 2. Multi-component & Cross-Tab Synchronization
  useEffect(() => {
    const handleSync = (e: CustomEvent) => {
      if (Array.isArray(e.detail)) {
        setCartItems(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCartItems(parsed);
        } catch {}
      }
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setWishlistIds(parsed);
        } catch {}
      }
    };

    window.addEventListener("playo_cart_synced" as any, handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("playo_cart_synced" as any, handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  // Open cart drawer event listener
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("playo_open_cart", handleOpenCart);
    return () => window.removeEventListener("playo_open_cart", handleOpenCart);
  }, []);

  // 3. Fetch DB-backed cart and enrich
  const refreshCartFromDb = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionId = getClientSessionId();
      const res = await fetch("/api/cart", {
        cache: "no-store",
        headers: { "x-cart-id": sessionId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          if (data.items.length > 0) {
            setCartItems(data.items);
            saveLocalCart(data.items);
          } else {
            // Server has 0 items, check if we have local items to recover
            const local = loadLocalCart();
            if (local.length > 0) {
              // Re-sync local items to server
              for (const it of local) {
                fetch("/api/cart", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-cart-id": sessionId,
                  },
                  body: JSON.stringify({
                    productId: it.product.id,
                    quantity: it.quantity,
                    product: it.product,
                  }),
                }).catch(() => {});
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to refresh cart from server:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial server sync
  useEffect(() => {
    refreshCartFromDb();
  }, [refreshCartFromDb]);

  // 4. Add to cart
  const addToCart = async (
    product: ProductItem,
    openDrawer: boolean = false,
    quantityToAdd: number = 1
  ) => {
    const availableStock = typeof product.stockCount === "number" ? Math.max(1, product.stockCount) : 10;
    const addQty = Math.max(1, quantityToAdd);

    // Update locally and broadcast to all components immediately
    let updatedItems: CartItem[] = [];
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const targetQty = Math.min(availableStock, existing.quantity + addQty);
        updatedItems = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      } else {
        updatedItems = [
          ...prev,
          {
            product: {
              ...product,
              stockCount: availableStock,
              inStock: true,
            },
            quantity: addQty,
          },
        ];
      }
      saveLocalCart(updatedItems);
      return updatedItems;
    });

    // Sync to backend asynchronously
    try {
      const sessionId = getClientSessionId();
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cart-id": sessionId,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: addQty,
          product,
        }),
      });
    } catch (err) {
      console.warn("Background cart save notice:", err);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("playo_cart_toast", {
          detail: { product, message: `Added "${product.name}" to cart ✅` },
        })
      );
    }

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  // 5. Update quantity
  const updateQuantity = async (productId: string, delta: number) => {
    let nextItems: CartItem[] = [];
    setCartItems((prev) => {
      nextItems = prev
        .map((item) => {
          if (item.product.id === productId) {
            const maxStock = typeof item.product.stockCount === "number" ? item.product.stockCount : 10;
            const newQty = item.quantity + delta;
            if (newQty < 1) return null; // remove if < 1
            return { ...item, quantity: Math.min(maxStock, newQty) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      saveLocalCart(nextItems);
      return nextItems;
    });

    try {
      const sessionId = getClientSessionId();
      const updatedItem = nextItems.find((i) => i.product.id === productId);
      if (updatedItem) {
        await fetch("/api/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-cart-id": sessionId,
          },
          body: JSON.stringify({ productId, quantity: updatedItem.quantity }),
        });
      } else {
        await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
          method: "DELETE",
          headers: { "x-cart-id": sessionId },
        });
      }
    } catch (err) {
      console.warn("Update cart quantity sync notice:", err);
    }
  };

  // 6. Remove item from cart
  const removeFromCart = async (productId: string) => {
    let nextItems: CartItem[] = [];
    setCartItems((prev) => {
      nextItems = prev.filter((item) => item.product.id !== productId);
      saveLocalCart(nextItems);
      return nextItems;
    });

    try {
      const sessionId = getClientSessionId();
      await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
        headers: { "x-cart-id": sessionId },
      });
    } catch (err) {
      console.warn("Remove from cart sync notice:", err);
    }
  };

  // 7. Clear cart
  const clearCart = async () => {
    setCartItems([]);
    saveLocalCart([]);
    try {
      const sessionId = getClientSessionId();
      await fetch("/api/cart?clear=true", {
        method: "DELETE",
        headers: { "x-cart-id": sessionId },
      });
    } catch (err) {
      console.warn("Clear cart sync notice:", err);
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
