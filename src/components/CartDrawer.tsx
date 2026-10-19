"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Phone, Tag } from "lucide-react";
import { ProductItem } from "../data/store-data";

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const [activeOffer, setActiveOffer] = useState<{ minAmount: number; discountPercentage: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.offers)) {
          interface OfferItem {
            minAmount: number;
            discountPercentage: number;
            status: string;
          }
          const active = (data.offers as OfferItem[]).filter((o) => o.status === "Active");
          if (active.length > 0) {
            // Pick highest discount offer
            active.sort((a, b) => b.discountPercentage - a.discountPercentage);
            setActiveOffer(active[0]);
          }
        }
      })
      .catch((err) => console.error("Error loading offers for cart:", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (activeOffer && subtotal >= activeOffer.minAmount) {
    discountAmount = Math.round((subtotal * activeOffer.discountPercentage) / 100);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Build WhatsApp prefilled order message
  const itemsText = cartItems
    .map(
      (item, i) =>
        `${i + 1}. ${item.product.name} (Qty: ${item.quantity}) - ₹${(
          item.product.price * item.quantity
        ).toLocaleString("en-IN")}`
    )
    .join("%0A");

  const whatsappMessage = `*NEW ORDER from Playo Edappal Website*%0A%0A${itemsText}%0A%0A*Total Amount: ₹${finalTotal.toLocaleString(
    "en-IN"
  )}*${discountAmount > 0 ? `%0A🎉 Special Offer Discount: -₹${discountAmount.toLocaleString("en-IN")}` : ""}%0A⚡ Free Doorstep Delivery%0A%0APlease confirm availability and delivery details!`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF9800]" />
              <h3 className="font-bold font-heading text-[#0D1B2A] text-lg">Your Cart</h3>
              <span className="bg-orange-100 text-orange-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-gray-900 text-base">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Explore our adventure bikes, mini scooters, 4x4 jeeps, diecasts, and teddy bears to fill it up!
                </p>
              </div>
            ) : (
              cartItems.map((item) => {
                const stockLimit = typeof item.product.stockCount === "number" ? item.product.stockCount : 999;
                const isMaxStock = item.quantity >= stockLimit;
                const isMinStock = item.quantity <= 1;

                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 relative group"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                          {item.product.category || item.product.categorySlug}
                        </p>
                        {stockLimit < 3 && stockLimit > 0 && (
                          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                            Only {stockLimit} left in stock!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-black text-sm text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </span>

                        {/* Quantity Controls - real world: never < 1, never > stock */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            disabled={isMinStock}
                            className="p-1 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={isMinStock ? "Minimum quantity is 1 (use trash to remove)" : "Decrease quantity"}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            disabled={isMaxStock}
                            className="p-1 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={isMaxStock ? `Stock limit reached (${stockLimit})` : "Increase quantity"}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Offer Discount */}
                {discountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Special Offer ({activeOffer?.discountPercentage}% OFF)</span>
                    </span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                ) : activeOffer && subtotal < activeOffer.minAmount ? (
                  <div className="text-[11px] text-sky-600 bg-sky-50 px-2 py-1 rounded-md border border-sky-100">
                    Add ₹{(activeOffer.minAmount - subtotal).toLocaleString("en-IN")} more to get {activeOffer.discountPercentage}% OFF!
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span>Delivery in Kerala</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-amber-600">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Primary Instant Checkout with Razorpay & Shipping */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0D1B2A] hover:bg-[#16283C] text-white font-extrabold text-sm shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>

              {/* Direct WhatsApp Checkout */}
              <a
                href={`https://wa.me/919072345678?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-200"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Order via WhatsApp Instead</span>
              </a>

              <p className="text-[10px] text-center text-gray-400">
                ⚡ Orders processed instantly by the Playo Edappal Showroom team
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
