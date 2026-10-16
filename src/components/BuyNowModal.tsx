"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  X, 
  CheckCircle2, 
  Truck, 
  ArrowRight, 
  Phone, 
  User, 
  MapPin, 
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { ProductItem } from "@/data/store-data";

interface BuyNowModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export default function BuyNowModal({ product, onClose }: BuyNowModalProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  if (!product) return null;

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Please fill in your name, phone number, and delivery address.");
      return;
    }

    // Generate real unique order ID
    const newOrderId = `PLY-${Date.now().toString().slice(-6)}`;
    setPlacedOrderId(newOrderId);

    // Save order into localStorage for /my-orders tracking page
    try {
      const existingOrders = JSON.parse(localStorage.getItem("playo_orders") || "[]");
      const orderData = {
        id: newOrderId,
        orderDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        deliveryAddress: customerAddress.trim(),
        status: "Order Placed",
        statusStep: 1,
        estimatedDelivery: "2-3 Business Days",
        courier: "Delhivery Surface Express",
        trackingNumber: `DEL-${Date.now().toString().slice(-8)}`,
        carrierLocation: "Edappal Central Hub",
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "UPI / GPay / NetBanking",
        totalAmount: product.price,
        items: [
          {
            name: product.name,
            qty: 1,
            price: product.price,
            image: product.imageUrl,
          },
        ],
      };
      existingOrders.unshift(orderData);
      localStorage.setItem("playo_orders", JSON.stringify(existingOrders));
    } catch {
      // safe fallback
    }

    setOrderPlacedSuccess(true);
  };

  const handleTrackInOrders = () => {
    onClose();
    router.push("/my-orders");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-amber-50/40 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0D1B2A] leading-tight">Instant Buy Now</h3>
              <p className="text-[11px] font-semibold text-gray-500">Fast 1-Step Kerala Showroom Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1">
          {orderPlacedSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-gray-900">Order Confirmed!</h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Your order <span className="font-bold text-gray-900">#{placedOrderId}</span> for{" "}
                  <span className="font-bold text-gray-900">{product.name}</span> has been successfully placed.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center gap-2.5 text-left">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Free doorstep delivery to your location in 2-3 business days.</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleTrackInOrders}
                  type="button"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0D1B2A] hover:bg-[#16283C] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
                >
                  <span>Track Order in My Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20I%20just%20placed%20order%20%23${placedOrderId}%20for%20${encodeURIComponent(product.name)}%20(₹${product.price.toLocaleString("en-IN")}).%20Please%20confirm!`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp Confirmation</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              {/* Product Summary Row */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 p-1 border border-gray-200/60">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm font-black text-[#FF9800]">
                      ₹ {product.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹ {product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      FREE Delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Menon"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Mobile / WhatsApp Number *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9846012345"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Complete Delivery Address (with City & Pin) *
                  </label>
                  <div className="relative flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <textarea
                      required
                      rows={2}
                      placeholder="House name, street, locality, Edappal, Pincode"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800] outline-none resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-[#FF9800] bg-orange-50 text-[#0D1B2A] ring-1 ring-[#FF9800]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>Cash on Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === "upi"
                          ? "border-[#FF9800] bg-orange-50 text-[#0D1B2A] ring-1 ring-[#FF9800]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>UPI / GPay</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#FF9800] to-orange-500 hover:from-amber-600 hover:via-[#F57C00] hover:to-orange-600 text-white font-black text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Confirm Order • ₹ {product.price.toLocaleString("en-IN")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Verified Playo Edappal Showroom Guarantee</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
