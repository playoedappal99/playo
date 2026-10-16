"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  PhoneCall, 
  ChevronRight, 
  Printer, 
  AlertCircle, 
  Calendar, 
  ShoppingBag
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import WhatsAppHelpStrip from "@/components/WhatsAppHelpStrip";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/data/cart-store";

interface OrderDetail {
  id: string;
  orderDate: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  status: "Order Placed" | "Packed" | "In Transit" | "Out for Delivery" | "Delivered";
  statusStep: number;
  estimatedDelivery: string;
  courier: string;
  trackingNumber: string;
  carrierLocation: string;
  paymentMethod: string;
  items: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    price: number;
    quantity: number;
    specs: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

const DEMO_ORDERS: Record<string, OrderDetail> = {
  "TM-84920": {
    id: "TM-84920",
    orderDate: "14 Oct 2026",
    customerName: "Arun Varma",
    phone: "+91 98471 23456",
    deliveryAddress: "Near Municipal Bus Stand, Main Road, Edappal, Malappuram - 679576",
    status: "Out for Delivery",
    statusStep: 4,
    estimatedDelivery: "Today by 5:30 PM",
    courier: "BlueDart Express",
    trackingNumber: "BD-EDP-84920X",
    carrierLocation: "Out with Delivery Rider (Sreejith K.)",
    paymentMethod: "Cash on Delivery",
    items: [
      {
        id: "prod-porsche-rc",
        name: "PORSCHE DRIFT RC",
        category: "RC Cars",
        imageUrl: "/images/catalog/porsche-drift-rc.jpg",
        price: 1990,
        quantity: 1,
        specs: "Scale: 1:24 | Black Edition | Remote & Gift Box",
      },
    ],
    subtotal: 2990,
    discount: 1000,
    deliveryFee: 0,
    total: 1990,
  },
  "TM-61402": {
    id: "TM-61402",
    orderDate: "13 Oct 2026",
    customerName: "Reshma Mohammed",
    phone: "+91 94470 87654",
    deliveryAddress: "Kallarmangalam Road, Near Town Masjid, Edappal - 679576",
    status: "In Transit",
    statusStep: 3,
    estimatedDelivery: "Tomorrow by 2:00 PM",
    courier: "Delhivery Surface",
    trackingNumber: "DLV-90827361",
    carrierLocation: "En route to Edappal Distribution Center",
    paymentMethod: "UPI Prepaid (GPay)",
    items: [
      {
        id: "prod-cca-mclaren",
        name: "Metal CCA McLaren 765LT Diecast Model Car",
        category: "Diecast Cars",
        imageUrl: "/images/catalog/cca-mclaren-box.jpg",
        price: 2699,
        quantity: 1,
        specs: "Scale: 1:24 | Papaya Orange | Acrylic Window Box",
      },
      {
        id: "prod-plush-bear",
        name: "Ultra Cuddle Plush Teddy Bear (Large)",
        category: "Soft Toys",
        imageUrl: "/images/carousel/kids-teddy.png",
        price: 1299,
        quantity: 1,
        specs: "Pink Edition | Soft Microfiber",
      },
    ],
    subtotal: 5798,
    discount: 1800,
    deliveryFee: 0,
    total: 3998,
  },
  "TM-93814": {
    id: "TM-93814",
    orderDate: "10 Oct 2026",
    customerName: "Vinod Kumar",
    phone: "+91 97455 11223",
    deliveryAddress: "Kuttippuram Road, Edappal - 679576",
    status: "Delivered",
    statusStep: 5,
    estimatedDelivery: "Delivered on 12 Oct 2026",
    courier: "Playo Local Fleet",
    trackingNumber: "PL-LOCAL-10294",
    carrierLocation: "Delivered to Customer (Signed)",
    paymentMethod: "Credit Card",
    items: [
      {
        id: "prod-scooter-glow",
        name: "Glow Rider 3-Wheel LED Kick Scooter",
        category: "Small Scooters",
        imageUrl: "/images/carousel/kids-scooter.png",
        price: 1899,
        quantity: 1,
        specs: "Color: Blue | Kinetic Light-Up Wheels",
      },
    ],
    subtotal: 2999,
    discount: 1100,
    deliveryFee: 0,
    total: 1899,
  },
};

const STEPS = [
  { title: "Placed", desc: "Order confirmed" },
  { title: "Packed", desc: "Quality checked" },
  { title: "In Transit", desc: "On the way" },
  { title: "Out for Delivery", desc: "With rider" },
  { title: "Delivered", desc: "Delivered" },
];

function MyOrdersContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") || "TM-84920";

  const [orderInput, setOrderInput] = useState(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState<OrderDetail | null>(
    DEMO_ORDERS[initialOrderId] || DEMO_ORDERS["TM-84920"]
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    cartItems,
    wishlistIds,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalCartCount,
  } = useCart();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderInput.trim().toUpperCase();

    if (!cleanId) {
      setErrorMessage("Please enter an Order ID or mobile number.");
      return;
    }

    if (DEMO_ORDERS[cleanId]) {
      setCurrentOrder(DEMO_ORDERS[cleanId]);
      setErrorMessage(null);
    } else {
      const foundByPhone = Object.values(DEMO_ORDERS).find((o) =>
        o.phone.replace(/[^0-9]/g, "").includes(cleanId.replace(/[^0-9]/g, ""))
      );
      if (foundByPhone) {
        setCurrentOrder(foundByPhone);
        setErrorMessage(null);
      } else {
        setErrorMessage("Order not found. Try sample order TM-84920, TM-61402, or TM-93814.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <Navbar
        activePage="my-orders"
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">My orders & tracking</span>
          {currentOrder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sky-600 font-bold">#{currentOrder.id}</span>
            </>
          )}
        </nav>

        {/* Clean, Simple Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track package status, check live delivery times, and view order details.
          </p>
        </div>

        {/* Search & Order Lookup Box */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs mb-6">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. TM-84920) or Phone"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#13202e] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Package className="w-4 h-4 text-sky-400" />
              <span>Track</span>
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          {/* Clean Quick Sample Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-gray-100 text-xs">
            <span className="text-[11px] font-medium text-gray-400">Sample Orders:</span>
            {Object.keys(DEMO_ORDERS).map((key) => {
              const demo = DEMO_ORDERS[key];
              const isSelected = currentOrder?.id === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setOrderInput(key);
                    setCurrentOrder(demo);
                    setErrorMessage(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-50 text-sky-700 font-bold border border-sky-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  #{key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Details View */}
        {currentOrder ? (
          <div className="space-y-4">
            {/* 1. Main Status Card */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs">
              {/* Order ID & Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      Order #{currentOrder.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        currentOrder.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : currentOrder.status === "Out for Delivery"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-sky-50 text-sky-800 border border-sky-200"
                      }`}
                    >
                      {currentOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>Placed on {currentOrder.orderDate}</span>
                  </p>
                </div>

                <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
                  <span className="text-[10px] font-medium text-gray-400 block uppercase">
                    Estimated Delivery
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {currentOrder.estimatedDelivery}
                  </span>
                </div>
              </div>

              {/* Simple Step Progress Tracker */}
              <div className="py-6 sm:py-7">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${((currentOrder.statusStep - 1) / 4) * 100}%` }}
                    />
                  </div>

                  {/* Step Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
                    {STEPS.map((st, idx) => {
                      const stepNum = idx + 1;
                      const isCompleted = stepNum < currentOrder.statusStep;
                      const isCurrent = stepNum === currentOrder.statusStep;

                      return (
                        <div
                          key={idx}
                          className="flex sm:flex-col items-center gap-3 sm:gap-1.5 text-left sm:text-center"
                        >
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isCompleted
                                ? "bg-emerald-500 text-white shadow-xs"
                                : isCurrent
                                ? "bg-[#13202e] text-white shadow-xs ring-2 ring-sky-200"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : isCurrent ? (
                              <Truck className="w-4 h-4 text-sky-400" />
                            ) : (
                              <span>{stepNum}</span>
                            )}
                          </div>
                          <div>
                            <span
                              className={`text-xs font-semibold block ${
                                isCurrent
                                  ? "text-gray-900 font-bold"
                                  : isCompleted
                                  ? "text-emerald-700"
                                  : "text-gray-400"
                              }`}
                            >
                              {st.title}
                            </span>
                            <span className="text-[10px] text-gray-400 hidden sm:block">
                              {st.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Courier Information Strip */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <span>{currentOrder.courier}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{currentOrder.trackingNumber}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{currentOrder.carrierLocation}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20tracking%20update%20for%20order%20${currentOrder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>

            {/* 2. Items & Summary in 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ordered Items (2 cols on desktop) */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Items ({currentOrder.items.length})
                </h2>

                <div className="divide-y divide-gray-100">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 flex items-center justify-center">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-sky-600 uppercase">
                          {item.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 truncate">{item.specs}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="font-bold text-gray-900">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-gray-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Delivery Address
                  </span>
                  <p className="font-semibold text-gray-900">{currentOrder.customerName}</p>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">{currentOrder.deliveryAddress}</p>
                  <p className="text-gray-500 mt-0.5">Phone: {currentOrder.phone}</p>
                </div>
              </div>

              {/* Payment Summary (1 col on desktop) */}
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
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-₹{currentOrder.discount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery</span>
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    </div>
                    <div className="pt-2.5 border-t border-gray-100 flex justify-between items-baseline font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-base font-extrabold text-gray-900">
                        ₹{currentOrder.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">
                      Payment Method
                    </span>
                    <span className="font-semibold text-gray-800">{currentOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" />
                    <span>Print Invoice</span>
                  </button>
                  <Link
                    href="/catalog"
                    className="w-full py-2 px-3 rounded-xl bg-[#13202e] hover:bg-black text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Back to Catalog</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

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
