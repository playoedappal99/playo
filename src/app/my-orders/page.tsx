"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  PhoneCall,
  ChevronRight,
  Printer,
  Calendar,
  ArrowLeft,
  Clock,
  ShieldCheck,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/data/cart-store";

export type OrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  quantity: number;
  specs?: string;
}

export interface OrderDetail {
  id: string;
  orderDate: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  status: OrderStatus;
  estimatedDelivery: string;
  courier: string;
  trackingNumber: string;
  carrierLocation: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  cancelReason?: string;
}

function normalizeStatus(statusStr: string): OrderStatus {
  const s = (statusStr || "").toLowerCase().trim();
  if (s.includes("cancel")) return "Cancelled";
  if (s.includes("deliver")) return "Delivered";
  if (s.includes("confirm")) return "Confirmed";
  return "Pending";
}

const TRACKING_STEPS: { key: OrderStatus; title: string; desc: string }[] = [
  { key: "Pending", title: "Pending", desc: "Awaiting store confirmation" },
  { key: "Confirmed", title: "Confirmed", desc: "Verified & packed in showroom" },
  { key: "Delivered", title: "Delivered", desc: "Delivered to doorstep" },
];

function getStepIndex(status: OrderStatus): number {
  if (status === "Pending") return 0;
  if (status === "Confirmed") return 1;
  if (status === "Delivered") return 2;
  return -1; // Cancelled
}

function StatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Pending</span>
        </span>
      );
    case "Confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Confirmed</span>
        </span>
      );
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Cancelled</span>
        </span>
      );
  }
}

function MyOrdersContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("id");

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(urlOrderId));
  const [trackInput, setTrackInput] = useState<string>("");
  const [trackError, setTrackError] = useState<string>("");

  const {
    cartItems,
    wishlistIds,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalCartCount,
  } = useCart();

  const mapRawOrder = (raw: any): OrderDetail => ({
    id: raw.id,
    orderDate: raw.orderDate || "Recently",
    customerName: raw.customerName || "Customer",
    phone: raw.phone || "",
    deliveryAddress: raw.deliveryAddress || "Edappal, Malappuram",
    status: normalizeStatus(raw.status),
    estimatedDelivery: raw.estimatedDelivery || "2-3 Business Days",
    courier: raw.courier || "India Post Doorstep Express",
    trackingNumber: raw.trackingNumber || `TRK-${raw.id}`,
    carrierLocation: raw.carrierLocation || "Edappal Fulfillment Hub",
    paymentMethod: raw.paymentMethod || "Razorpay (UPI / NetBanking)",
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any, i: number) => ({
          id: it.id || `it-${i}`,
          name: it.name || "Playo Toy",
          category: it.category || "General",
          imageUrl: it.imageUrl || it.image || "/images/catalog/porsche-drift-rc.jpg",
          price: Number(it.price) || 0,
          quantity: Number(it.quantity || it.qty) || 1,
          specs: it.specs || "Standard",
        }))
      : [],
    subtotal: Number(raw.subtotal) || Number(raw.total) || 0,
    deliveryFee: Number(raw.deliveryFee) || 0,
    discount: Number(raw.discount) || 0,
    total: Number(raw.total) || 0,
    cancelReason: raw.cancelReason,
  });

  // Load orders directly from MongoDB database API for orders placed on THIS device
  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        if (urlOrderId) {
          const res = await fetch(`/api/orders?id=${encodeURIComponent(urlOrderId)}`, { cache: "no-store" });
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            const mapped: OrderDetail[] = data.orders.map(mapRawOrder);
            setOrders(mapped);
            setSelectedOrderId(urlOrderId);

            // Add urlOrderId to device tracking storage
            try {
              const stored = localStorage.getItem("playo_placed_order_ids");
              const list: string[] = stored ? JSON.parse(stored) : [];
              if (!list.includes(urlOrderId)) {
                list.unshift(urlOrderId);
                localStorage.setItem("playo_placed_order_ids", JSON.stringify(list));
              }
            } catch {}
            return;
          }
        }

        // Get placed order IDs saved in this device's localStorage
        let deviceIds: string[] = [];
        try {
          const stored = localStorage.getItem("playo_placed_order_ids");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              deviceIds = parsed.filter((id) => typeof id === "string" && id.trim().length > 0);
            }
          }
        } catch (e) {
          console.warn("Could not read device order IDs:", e);
        }

        if (deviceIds.length === 0) {
          // No orders placed on this device yet - do not fetch any stranger's orders!
          setOrders([]);
          return;
        }

        const res = await fetch(`/api/orders?ids=${encodeURIComponent(deviceIds.join(","))}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const mapped: OrderDetail[] = data.orders.map(mapRawOrder);
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [urlOrderId]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setTrackError("");
    setIsLoading(true);
    try {
      const q = trackInput.trim();
      const isPhone = /^\d{10}$/.test(q.replace(/\D/g, ""));
      const endpoint = isPhone
        ? `/api/orders?phone=${encodeURIComponent(q.replace(/\D/g, ""))}`
        : `/api/orders?id=${encodeURIComponent(q)}`;

      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        const mapped = data.orders.map(mapRawOrder);
        setOrders(mapped);
        if (mapped.length === 1) {
          setSelectedOrderId(mapped[0].id);
        }

        // Save found order IDs into this device's storage
        try {
          const stored = localStorage.getItem("playo_placed_order_ids");
          const list: string[] = stored ? JSON.parse(stored) : [];
          mapped.forEach((m) => {
            if (!list.includes(m.id)) list.unshift(m.id);
          });
          localStorage.setItem("playo_placed_order_ids", JSON.stringify(list));
        } catch {}
      } else {
        setTrackError(`No order found matching "${q}". Please verify the Order ID or 10-digit mobile number.`);
      }
    } catch (err: any) {
      setTrackError(err.message || "Failed to search order");
    } finally {
      setIsLoading(false);
    }
  };

  const currentOrder = useMemo(() => {
    return selectedOrderId ? orders.find((o) => o.id === selectedOrderId) : null;
  }, [selectedOrderId, orders]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col font-sans selection:bg-[#FF9800] selection:text-white">
      {/* Header */}
      <Navbar
        activePage="my-orders"
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          {selectedOrderId ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="hover:text-gray-900 transition-colors cursor-pointer text-gray-500"
              >
                My Orders
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#FF9800] font-bold">#{selectedOrderId}</span>
            </>
          ) : (
            <span className="text-gray-900 font-semibold">My Orders</span>
          )}
        </nav>

        {/* VIEW 1: LIST OF ALL ORDERED ITEMS */}
        {!selectedOrderId && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] tracking-tight flex items-center gap-2.5">
                <Package className="w-7 h-7 text-[#FF9800]" />
                <span>My Orders</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Live orders from showroom database with tracking: Pending, Confirmed, Delivered, or Cancelled.
              </p>
            </div>

            {/* Live Order Tracking Lookup Form */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="Enter Order ID (e.g. PLY-123456) or 10-digit Mobile Number"
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Track Order
                </button>
              </form>
              {trackError && (
                <p className="text-xs font-semibold text-rose-600 mt-2">
                  {trackError}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-500">Loading your orders from database...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/90 p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No orders placed yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Browse our catalog to order ride-ons, scooters, diecast models, and soft toys.
                </p>
                <div className="pt-2 flex justify-center">
                  <Link
                    href="/catalog"
                    className="px-4 py-2 bg-[#0D1B2A] hover:bg-black text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#FF9800] transition-colors">
                          Order #{ord.id}
                        </span>
                        <StatusBadge status={ord.status} />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Placed on {ord.orderDate}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="font-semibold text-gray-700">
                          Total: ₹{ord.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items Preview */}
                    <div className="py-3.5 divide-y divide-gray-50">
                      {ord.items.map((it) => (
                        <div key={it.id} className="py-2 flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            <Image
                              src={it.imageUrl}
                              alt={it.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider block">
                              {it.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                              {it.name}
                            </h4>
                            {it.specs && (
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {it.specs}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className="font-bold text-gray-900">
                                ₹{it.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-gray-400">Qty: {it.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-md">Deliver to: {ord.deliveryAddress}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[#FF9800] font-bold text-xs group-hover:translate-x-1 transition-transform self-end sm:self-auto">
                        <span>View Details & Track</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ORDER DETAILS & TRACKING */}
        {selectedOrderId && currentOrder && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Back Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 shadow-2xs transition-all cursor-pointer self-start"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
                <span>Back to All Orders</span>
              </button>
            </div>

            {/* Tracker Card */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-lg sm:text-xl font-bold text-[#0D1B2A]">
                      Order #{currentOrder.id}
                    </span>
                    <StatusBadge status={currentOrder.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Ordered on {currentOrder.orderDate}</span>
                  </p>
                </div>

                <div className="bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100 self-start sm:self-auto">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    Estimated Delivery
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {currentOrder.estimatedDelivery}
                  </span>
                </div>
              </div>

              {/* Status Visual Tracker */}
              {currentOrder.status === "Cancelled" ? (
                <div className="py-6 sm:py-8">
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-900">
                        This order has been cancelled
                      </h3>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        {currentOrder.cancelReason || "The order was cancelled upon request. If you paid online via UPI/Card, the refund will reflect in your account within 3-5 business days."}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <Link
                          href="/catalog"
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          Shop Replacement Item
                        </Link>
                        <a
                          href={`https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20I%20have%20a%20query%20about%20my%20cancelled%20order%20${currentOrder.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-rose-800 hover:underline flex items-center gap-1"
                        >
                          <span>Contact Support</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 sm:py-8">
                  <div className="relative">
                    <div className="hidden sm:block absolute top-4 left-12 right-12 h-1 bg-gray-100 rounded-full z-0">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(getStepIndex(currentOrder.status) / (TRACKING_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 relative z-10">
                      {TRACKING_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(currentOrder.status);
                        const isCompleted = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={step.key}
                            className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center"
                          >
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                isCompleted
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : isCurrent
                                  ? step.key === "Pending"
                                    ? "bg-amber-500 text-white ring-4 ring-amber-100 shadow-xs"
                                    : step.key === "Confirmed"
                                    ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-xs"
                                    : "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : isCurrent ? (
                                step.key === "Pending" ? (
                                  <Clock className="w-5 h-5 text-white animate-pulse" />
                                ) : step.key === "Confirmed" ? (
                                  <ShieldCheck className="w-5 h-5 text-white" />
                                ) : (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                )
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            <div>
                              <span
                                className={`text-xs sm:text-sm font-bold block ${
                                  isCurrent
                                    ? "text-gray-900"
                                    : isCompleted
                                    ? "text-emerald-700"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.title}
                              </span>
                              <span className="text-[11px] text-gray-400 block mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Courier Strip */}
              <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <span>{currentOrder.courier}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 font-mono">{currentOrder.trackingNumber}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{currentOrder.carrierLocation}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href={`https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20tracking%20update%20for%20order%20${currentOrder.id}%20(Status:%20${currentOrder.status})`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>WhatsApp Updates</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Order Items & Cost Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ordered Items ({currentOrder.items.length})
                  </h2>
                  <span className="text-xs text-gray-400">Quality Checked</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center gap-3.5">
                      <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.specs && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.specs}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="font-bold text-gray-900">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-gray-400">Qty: {item.quantity}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-semibold text-gray-600">
                            Total: ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mt-5 pt-4 border-t border-gray-100 text-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Delivery Address
                  </span>
                  <p className="font-semibold text-gray-900">{currentOrder.customerName}</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">{currentOrder.deliveryAddress}</p>
                  {currentOrder.phone && (
                    <p className="text-gray-500 mt-0.5">Phone: {currentOrder.phone}</p>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Payment Summary
                  </h2>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{currentOrder.subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount</span>
                        <span>-₹{currentOrder.discount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery</span>
                      {currentOrder.deliveryFee > 0 ? (
                        <span className="text-gray-900 font-semibold">+₹{currentOrder.deliveryFee.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      )}
                    </div>
                    <div className="pt-2.5 border-t border-gray-100 flex justify-between items-baseline font-bold">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-base font-extrabold text-gray-900">
                        ₹{currentOrder.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">
                      Payment Mode
                    </span>
                    <span className="font-semibold text-gray-800">{currentOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="w-full py-2 px-3 rounded-xl bg-[#0D1B2A] hover:bg-black text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Orders</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      <TrustBadges />
      <WhatsAppHelpStrip />
      <Footer />
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MyOrdersContent />
    </Suspense>
  );
}
