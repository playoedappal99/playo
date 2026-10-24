"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  Phone,
  ArrowRight,
  Sparkles,
  Tag,
} from "lucide-react";
import { ProductItem } from "@/data/store-data";
import { useCart } from "@/data/cart-store";

export interface CheckoutSectionProps {
  product?: ProductItem | null;
  onClose?: () => void;
  isModal?: boolean;
}

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function CheckoutSection({
  product: customProduct,
  onClose,
  isModal = true,
}: CheckoutSectionProps) {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();

  // Determine items to checkout: if customProduct is passed use it, otherwise use all cart items
  const checkoutItems = useMemo(() => {
    if (customProduct) {
      return [
        {
          id: customProduct.id,
          name: customProduct.name,
          category: customProduct.category || customProduct.categorySlug,
          imageUrl: customProduct.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
          price: customProduct.price || 0,
          quantity: 1,
          specs: customProduct.scale ? `Scale: ${customProduct.scale}` : "Standard",
          deliveryFee: typeof customProduct.deliveryFee === "number" ? customProduct.deliveryFee : 0,
        },
      ];
    }
    if (cartItems.length > 0) {
      return cartItems.map((ci) => ({
        id: ci.product.id,
        name: ci.product.name,
        category: ci.product.category || ci.product.categorySlug,
        imageUrl: ci.product.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
        price: ci.product.price || 0,
        quantity: ci.quantity || 1,
        specs: ci.product.scale ? `Scale: ${ci.product.scale}` : "Standard",
        deliveryFee: typeof ci.product.deliveryFee === "number" ? ci.product.deliveryFee : 0,
      }));
    }
    return [
      {
        id: "prod-porsche-rc",
        name: "PORSCHE DRIFT RC",
        category: "RC Cars",
        imageUrl: "/images/catalog/porsche-drift-rc.jpg",
        price: 1990,
        quantity: 1,
        specs: "Scale: 1:24 • Color: VIOLET",
        deliveryFee: 0,
      },
    ];
  }, [customProduct, cartItems]);

  const product = checkoutItems[0];

  // Form states
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [roadName, setRoadName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [shippingOption, setShippingOption] = useState<
    "indian_post" | "speed_and_safe"
  >("indian_post");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Order summary expansion toggle
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Active offers from database
  const [activeOffer, setActiveOffer] = useState<{ minAmount: number; discountPercentage: number } | null>(null);

  useEffect(() => {
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
            active.sort((a, b) => b.discountPercentage - a.discountPercentage);
            setActiveOffer(active[0]);
          }
        }
      })
      .catch((err) => console.error("Error loading offers:", err));
  }, []);

  // Razorpay payment simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [checkoutItems]);

  const discountAmount = useMemo(() => {
    if (activeOffer && subtotal >= activeOffer.minAmount) {
      return Math.round((subtotal * activeOffer.discountPercentage) / 100);
    }
    return 0;
  }, [activeOffer, subtotal]);

  const totalDeliveryFee = useMemo(() => {
    return checkoutItems.reduce((sum, it) => sum + (it.deliveryFee || 0) * it.quantity, 0);
  }, [checkoutItems]);

  const totalAmount = Math.max(0, subtotal - discountAmount + totalDeliveryFee);
  const totalItemCount = useMemo(() => {
    return checkoutItems.reduce((sum, it) => sum + it.quantity, 0);
  }, [checkoutItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validations
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!houseNo.trim()) {
      setErrorMsg("Please enter your house number or building name.");
      return;
    }
    if (!roadName.trim()) {
      setErrorMsg("Please enter your road name, area or colony.");
      return;
    }
    if (!pinCode.trim() || pinCode.replace(/\D/g, "").length !== 6) {
      setErrorMsg("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (!city.trim()) {
      setErrorMsg("Please enter your city.");
      return;
    }
    if (!state.trim()) {
      setErrorMsg("Please select your state.");
      return;
    }

    setIsProcessing(true);

    try {
      const fullAddress = `${houseNo.trim()}, ${roadName.trim()}${
        landmark.trim() ? `, Near ${landmark.trim()}` : ""
      }, ${city.trim()}, ${state.trim()} - ${pinCode.trim()}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName.trim(),
          phone: mobileNumber.trim(),
          email: emailAddress.trim(),
          deliveryAddress: fullAddress,
          shippingOption:
            shippingOption === "indian_post"
              ? "Indian Post (Door-to-Door Delivery)"
              : "Speed & Safe Courier Service",
          deliveryInstructions: deliveryInstructions.trim(),
          paymentMethod: "Razorpay (UPI / NetBanking)",
          items: checkoutItems.map((it) => ({
            id: it.id,
            name: it.name,
            category: it.category,
            imageUrl: it.imageUrl,
            price: it.price,
            quantity: it.quantity,
            specs: it.specs,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to process order. Please try again.");
        setIsProcessing(false);
        return;
      }

      const placedId = data.order.id;
      setPlacedOrderId(placedId);

      // Save order ID to this device's localStorage for isolated tracking
      try {
        const stored = localStorage.getItem("playo_placed_order_ids");
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (!list.includes(placedId)) {
          list.unshift(placedId);
          localStorage.setItem("playo_placed_order_ids", JSON.stringify(list));
        }
      } catch (e) {
        console.warn("Could not save order ID to device storage:", e);
      }

      setIsProcessing(false);
      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error("Order submit error:", err);
      setErrorMsg(err.message || "Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleTrackInOrders = () => {
    if (onClose) onClose();
    router.push(`/my-orders?id=${placedOrderId}`);
  };

  return (
    <div
      className={`w-full bg-white text-gray-900 ${
        isModal
          ? "max-w-xl mx-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/90 overflow-hidden flex flex-col max-h-[92vh]"
          : "max-w-xl mx-auto rounded-3xl shadow-lg border border-gray-100"
      }`}
    >
      {/* 1. HEADER */}
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Checkout (1 Item)
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              router.push("/catalog");
            }
          }}
          aria-label="Close checkout"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-2xl font-light leading-none cursor-pointer"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
        {orderSuccess ? (
          /* ORDER SUCCESS CONFIRMATION */
          <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Payment
                Successful via Razorpay
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Thank you,{" "}
                <span className="font-bold text-gray-900">{fullName}</span>.
                Your order ID is{" "}
                <span className="font-mono font-bold text-orange-600">
                  #{placedOrderId}
                </span>
                .
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200/80">
                <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="56px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {checkoutItems.length > 1
                      ? `${product.name} + ${checkoutItems.length - 1} more item(s)`
                      : product.name}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Total Items: {totalItemCount}
                  </p>
                  <p className="text-xs font-extrabold text-gray-900 mt-0.5">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Shipping Partner:</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {shippingOption === "indian_post"
                      ? "Indian Post (Door-to-Door Delivery)"
                      : "Speed & Safe Courier Service"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-xs truncate">
                    {houseNo}, {city}, {state} - {pinCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-semibold text-emerald-700">
                    Razorpay Secure (Paid)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleTrackInOrders}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#0D1B2A] hover:bg-[#16283C] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:-translate-y-0.5"
              >
                <span>Track Order in My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/919605973308?text=${encodeURIComponent(
                  `Hi Playo Edappal! I just placed order #${placedOrderId} for ${product.name} (₹${totalAmount.toLocaleString(
                    "en-IN"
                  )}) via Razorpay. Please share dispatch updates!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Confirmation</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 2. ORDER SUMMARY */}
            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/70 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  Order Summary (1 item)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-gray-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                  {isSummaryExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {isSummaryExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-200/70 bg-white space-y-3">
                  <div className="space-y-3 divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                    {checkoutItems.map((item, idx) => (
                      <div key={item.id + idx} className="flex items-start gap-3.5 pt-2">
                        <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200/80 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-0.5"
                            sizes="56px"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight uppercase truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] font-medium text-gray-600 mt-0.5">
                            Qty: {item.quantity} • {item.specs}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {discountAmount > 0 && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Special Offer Discount ({activeOffer?.discountPercentage}%)</span>
                      </span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-medium">
                    <span>Doorstep Delivery (Kerala)</span>
                    {totalDeliveryFee > 0 ? (
                      <span className="font-bold text-gray-900">+₹{totalDeliveryFee.toLocaleString("en-IN")}</span>
                    ) : (
                      <span className="font-bold text-emerald-600">FREE</span>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-sm sm:text-base font-black text-gray-950">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message display */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {/* 3. CONTACT & ADDRESS FIELDS */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  House No. / Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="House number, building name, apartment"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Road Name / Area / Colony <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  placeholder="Road name, area, colony"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="E.g. Near Apollo Hospital"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="6-digit PIN code"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select your state
                    </option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 4. SHIPPING OPTIONS */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-gray-900">
                Shipping Options & Delivery Partners{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2">
                <label
                  onClick={() => setShippingOption("indian_post")}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    shippingOption === "indian_post"
                      ? "border-[#FF9800] bg-orange-50/40 ring-1 ring-[#FF9800]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping_partner"
                    checked={shippingOption === "indian_post"}
                    onChange={() => setShippingOption("indian_post")}
                    className="mt-0.5 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      Indian Post (Door-to-Door Delivery)
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 leading-relaxed">
                      Ideal for home delivery to all locations, including remote
                      areas across India.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setShippingOption("speed_and_safe")}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    shippingOption === "speed_and_safe"
                      ? "border-[#FF9800] bg-orange-50/40 ring-1 ring-[#FF9800]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping_partner"
                    checked={shippingOption === "speed_and_safe"}
                    onChange={() => setShippingOption("speed_and_safe")}
                    className="mt-0.5 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      Speed & Safe Courier Service
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 leading-relaxed">
                      Available for fast and secure standard deliveries.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 5. DELIVERY INSTRUCTIONS */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Any special instructions for delivery?"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:border-[#FF9800] focus:ring-2 focus:ring-orange-100 outline-none resize-none transition-all"
              />
            </div>

            {/* 6. PAYMENT VIA RAZORPAY */}
            <div className="pt-1">
              <div className="p-3.5 sm:p-4 rounded-xl border border-sky-200/90 bg-[#F0F8FF] flex items-center gap-3.5 shadow-2xs">
                <div className="shrink-0 flex items-center justify-center">
                  <svg
                    className="w-8 h-6 sm:w-9 sm:h-6.5 drop-shadow-xs"
                    viewBox="0 0 36 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="36" height="26" rx="4" fill="#38BDF8" />
                    <rect y="4.5" width="36" height="5" fill="#0F172A" />
                    <rect x="25" y="16" width="6.5" height="5" rx="1" fill="#FACC15" />
                    <rect x="4" y="17.5" width="8" height="2" rx="0.5" fill="#BAE6FD" opacity="0.8" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0284c7] leading-tight">
                    Payment via Razorpay Secure Gateway
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                    Supports UPI (GPay, PhonePe, Paytm), Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 py-3.5 sm:py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm sm:text-base shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group focus-visible:outline-2 focus-visible:outline-sky-500"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Verifying stock & connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
                    <span>
                      Pay ₹{totalAmount.toLocaleString("en-IN")} via Razorpay
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-gray-400 mt-2.5">
                ⚡ Orders are verified & processed directly at Playo Edappal
                Showroom
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
