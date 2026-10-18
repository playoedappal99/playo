"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Layers,
  Tag,
  Ruler,
  Bell,
  Sparkles,
  Percent,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ExternalLink,
  Phone,
  MapPin,
  Truck,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";
import { PRODUCTS_DATA, CATEGORIES_DATA, ProductItem } from "@/data/store-data";
import Navbar from "@/components/Navbar";

export type OrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";

export interface AdminOrderItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  quantity: number;
  specs?: string;
}

export interface AdminOrder {
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
  items: AdminOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  cancelReason?: string;
}

// Initial demo orders matching store records
const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "PLY-91820",
    orderDate: "18 Oct 2026",
    customerName: "Arun Varma",
    phone: "+91 98471 23456",
    deliveryAddress: "Near Municipal Bus Stand, Main Road, Edappal, Malappuram - 679576",
    status: "Pending",
    estimatedDelivery: "2-3 Business Days",
    courier: "Playo Local Fleet",
    trackingNumber: "PL-EDP-91820P",
    carrierLocation: "Order received - awaiting store verification",
    paymentMethod: "Cash on Delivery",
    items: [
      {
        id: "prod-jeep-4x4",
        name: "Kids 4x4 Off-Road Electric Jeep",
        category: "Ride-ons",
        imageUrl: "/images/carousel/kids-jeep.png",
        price: 6499,
        quantity: 1,
        specs: "12V Dual Motor | Red Edition | Remote Control & MP3",
      },
    ],
    subtotal: 7499,
    discount: 1000,
    deliveryFee: 0,
    total: 6499,
  },
  {
    id: "PLY-84920",
    orderDate: "16 Oct 2026",
    customerName: "Faheem Rahman",
    phone: "+91 94470 55432",
    deliveryAddress: "Kuttippuram Road, Near Town Square, Edappal - 679576",
    status: "Confirmed",
    estimatedDelivery: "Tomorrow by 4:00 PM",
    courier: "BlueDart Express",
    trackingNumber: "BD-EDP-84920X",
    carrierLocation: "Packed & verified at Edappal Distribution Center",
    paymentMethod: "UPI Prepaid (GPay)",
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
  {
    id: "PLY-61402",
    orderDate: "13 Oct 2026",
    customerName: "Reshma Mohammed",
    phone: "+91 94470 87654",
    deliveryAddress: "Kallarmangalam Road, Near Town Masjid, Edappal - 679576",
    status: "Delivered",
    estimatedDelivery: "Delivered on 15 Oct 2026",
    courier: "Delhivery Surface",
    trackingNumber: "DLV-90827361",
    carrierLocation: "Delivered to customer & signed",
    paymentMethod: "UPI Prepaid",
    items: [
      {
        id: "prod-cca-mclaren",
        name: "Metal CCA McLaren 765LT Diecast Model",
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
  {
    id: "PLY-30192",
    orderDate: "10 Oct 2026",
    customerName: "Vinod Kumar",
    phone: "+91 97455 11223",
    deliveryAddress: "Main Bazaar, Edappal - 679576",
    status: "Cancelled",
    estimatedDelivery: "Cancelled on 10 Oct 2026",
    courier: "Playo Local Fleet",
    trackingNumber: "PL-CAN-30192",
    carrierLocation: "Order cancelled by customer",
    paymentMethod: "Cash on Delivery",
    cancelReason: "Cancelled upon customer request (duplicate order)",
    items: [
      {
        id: "prod-scooter-glow",
        name: "Glow Rider 3-Wheel LED Kick Scooter",
        category: "Scooters",
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
];

export type AdminTab =
  | "Inventory"
  | "Orders"
  | "Brand"
  | "Category"
  | "Scale"
  | "Notifications"
  | "Best selling"
  | "Offer";

const TABS: AdminTab[] = [
  "Inventory",
  "Orders",
  "Brand",
  "Category",
  "Scale",
  "Notifications",
  "Best selling",
  "Offer",
];

const INITIAL_BRANDS = [
  { id: "b-porsche", name: "Porsche", origin: "Germany", count: 4, status: "Active" },
  { id: "b-mclaren", name: "McLaren", origin: "UK", count: 3, status: "Active" },
  { id: "b-ferrari", name: "Ferrari", origin: "Italy", count: 5, status: "Active" },
  { id: "b-bmw", name: "BMW", origin: "Germany", count: 3, status: "Active" },
  { id: "b-playo", name: "Playo In-House", origin: "India", count: 12, status: "Active" },
  { id: "b-jeep", name: "Jeep 4x4", origin: "USA", count: 2, status: "Active" },
];

const INITIAL_SCALES = [
  { id: "sc-112", scale: "1:12", desc: "Large Detailed RC & Collector Bikes", count: 2 },
  { id: "sc-118", scale: "1:18", desc: "Premium Metal Diecast Supercars", count: 5 },
  { id: "sc-124", scale: "1:24", desc: "Drift RC & Display Diecast Box", count: 8 },
  { id: "sc-132", scale: "1:32", desc: "Pull-back Diecast Cars & Mini Racers", count: 6 },
  { id: "sc-164", scale: "1:64", desc: "Pocket Scale Track Racers", count: 14 },
];

const INITIAL_NOTIFICATIONS = [
  { id: "notif-1", type: "order", title: "New Order Placed", desc: "Order #PLY-91820 placed by Arun Varma for Kids 4x4 Jeep.", time: "10 mins ago", read: false },
  { id: "notif-2", type: "stock", title: "Low Stock Alert", desc: "Porsche Drift RC has only 2 units remaining in Edappal showroom.", time: "1 hour ago", read: false },
  { id: "notif-3", type: "order", title: "Order Delivered", desc: "Order #PLY-61402 marked Delivered to Reshma Mohammed.", time: "Yesterday", read: true },
  { id: "notif-4", type: "system", title: "Store Sync Completed", desc: "Product catalog and prices successfully synced with local showroom.", time: "2 days ago", read: true },
];

const INITIAL_OFFERS = [
  { id: "off-1", code: "PLAYO10", title: "Flat 10% Discount", discount: "10% OFF", type: "Percentage", active: true, usageCount: 42 },
  { id: "off-2", code: "EDAPPAL500", title: "Special Ride-on Discount", discount: "₹500 OFF", type: "Fixed Amount", active: true, usageCount: 18 },
  { id: "off-3", code: "FREESHIP", title: "100% Free Doorstep Delivery", discount: "FREE Delivery", type: "Shipping", active: true, usageCount: 125 },
];

function AdminContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>("Orders");

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);
  const [orderFilter, setOrderFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Products State
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [inventorySearch, setInventorySearch] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "RC Cars",
    categorySlug: "rc-cars",
    price: "",
    originalPrice: "",
    brand: "Playo",
    scale: "1:24",
    imageUrl: "/images/catalog/porsche-drift-rc.jpg",
  });

  // Brands State
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [newBrandName, setNewBrandName] = useState("");

  // Categories State
  const [categories, setCategories] = useState(CATEGORIES_DATA);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Scales State
  const [scales, setScales] = useState(INITIAL_SCALES);
  const [newScaleRatio, setNewScaleRatio] = useState("");
  const [newScaleDesc, setNewScaleDesc] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Offers State
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [newOfferCode, setNewOfferCode] = useState("");
  const [newOfferDiscount, setNewOfferDiscount] = useState("");

  // Load orders from localStorage and merge with defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem("playo_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map: Record<string, AdminOrder> = {};
          INITIAL_ADMIN_ORDERS.forEach((o) => {
            map[o.id] = o;
          });
          parsed.forEach((raw: any) => {
            if (!raw || !raw.id) return;
            const validStatus: OrderStatus = raw.status === "Cancelled"
              ? "Cancelled"
              : raw.status === "Delivered"
              ? "Delivered"
              : raw.status === "Confirmed"
              ? "Confirmed"
              : "Pending";

            const items: AdminOrderItem[] = Array.isArray(raw.items)
              ? raw.items.map((it: any, idx: number) => ({
                  id: it.id || `item-${idx}`,
                  name: it.name || "Playo Toy",
                  category: it.category || "Toy Item",
                  imageUrl: it.image || it.imageUrl || "/images/carousel/kids-jeep.png",
                  price: Number(it.price) || 0,
                  quantity: Number(it.qty || it.quantity) || 1,
                  specs: it.specs || "Standard Edition",
                }))
              : [];

            const total = Number(raw.totalAmount || raw.total) || 0;
            map[raw.id] = {
              id: raw.id,
              orderDate: raw.orderDate || "Recently",
              customerName: raw.customerName || "Customer",
              phone: raw.phone || "",
              deliveryAddress: raw.deliveryAddress || "Edappal, Malappuram",
              status: validStatus,
              estimatedDelivery: raw.estimatedDelivery || "2-3 Business Days",
              courier: raw.courier || "Playo Express Delivery",
              trackingNumber: raw.trackingNumber || `TRK-${raw.id}`,
              carrierLocation: raw.carrierLocation || "Edappal Fulfillment Hub",
              paymentMethod: raw.paymentMethod || "Cash on Delivery",
              items: items.length > 0 ? items : [
                {
                  id: "item-def",
                  name: "Toy Product",
                  category: "Playo Toy",
                  imageUrl: "/images/carousel/kids-jeep.png",
                  price: total,
                  quantity: 1,
                },
              ],
              subtotal: total,
              deliveryFee: 0,
              discount: 0,
              total: total,
              cancelReason: raw.cancelReason,
            };
          });
          setOrders(Object.values(map));
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Sync orders change to localStorage
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedList = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: newStatus,
          estimatedDelivery:
            newStatus === "Delivered"
              ? "Delivered Today"
              : newStatus === "Cancelled"
              ? "Cancelled by admin"
              : newStatus === "Confirmed"
              ? "Tomorrow by 4:00 PM"
              : "2-3 Business Days",
        };
      }
      return ord;
    });

    setOrders(updatedList);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedList.find((o) => o.id === orderId) || null);
    }

    try {
      localStorage.setItem("playo_orders", JSON.stringify(updatedList));
    } catch {
      // safe fallback
    }
  };

  // Delete Order
  const deleteOrder = (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
    try {
      localStorage.setItem("playo_orders", JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter !== "ALL" && o.status !== orderFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesCust = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.phone.toLowerCase().includes(q);
        const matchesItem = o.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchesId && !matchesCust && !matchesPhone && !matchesItem) return false;
      }
      return true;
    });
  }, [orders, orderFilter, orderSearch]);

  // Inventory Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!inventorySearch.trim()) return true;
      const q = inventorySearch.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });
  }, [products, inventorySearch]);

  // Toggle inStock
  const toggleInStock = (prodId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Toggle Bestseller tag
  const toggleBestseller = (prodId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === prodId) {
          const isCurrently = p.tag === "Bestseller";
          return { ...p, tag: isCurrently ? undefined : "Bestseller" };
        }
        return p;
      })
    );
  };

  // Delete Product
  const deleteProduct = (prodId: string) => {
    if (!confirm("Are you sure you want to remove this product from inventory?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
  };

  // Add Product Form
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const pr = Number(newProduct.price) || 0;
    const orig = Number(newProduct.originalPrice) || pr * 1.3;
    const item: ProductItem = {
      id: `prod-custom-${Date.now().toString().slice(-5)}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      categorySlug: newProduct.categorySlug,
      brand: newProduct.brand,
      scale: newProduct.scale,
      price: pr,
      originalPrice: Math.round(orig),
      discount: `${Math.round(((orig - pr) / orig) * 100)}% OFF`,
      rating: 5,
      reviewsCount: 1,
      imageUrl: newProduct.imageUrl || "/images/carousel/kids-jeep.png",
      inStock: true,
      tag: "New Arrival",
    };

    setProducts([item, ...products]);
    setIsAddProductOpen(false);
    setNewProduct({
      name: "",
      category: "RC Cars",
      categorySlug: "rc-cars",
      price: "",
      originalPrice: "",
      brand: "Playo",
      scale: "1:24",
      imageUrl: "/images/catalog/porsche-drift-rc.jpg",
    });
  };

  // Quick stats
  const totalRevenue = orders.reduce((sum, o) => (o.status !== "Cancelled" ? sum + o.total : sum), 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const confirmedCount = orders.filter((o) => o.status === "Confirmed").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans">
      {/* Website Navbar */}
      <Navbar activePage="admin" />

      {/* Admin Tab Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar -mb-px">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedOrder(null);
                  }}
                  className={`py-3.5 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer relative ${
                    isActive
                      ? "text-[#0D1B2A] font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {tab}
                    {tab === "Orders" && pendingCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                    {tab === "Notifications" && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0D1B2A] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: ORDERS MANAGEMENT (Core Requirement)                         */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Orders" && (
          <div className="space-y-4">
            {/* Orders Header & Search / Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(["ALL", "Pending", "Confirmed", "Delivered", "Cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === st
                        ? "bg-[#0D1B2A] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{st === "ALL" ? "All Orders" : st}</span>
                    <span className="ml-1.5 text-[10px] opacity-75">
                      {st === "ALL"
                        ? orders.length
                        : orders.filter((o) => o.status === st).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Order ID, customer, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer & Address</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Update Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-gray-700">No orders found</p>
                          <p className="text-xs text-gray-400 mt-0.5">Orders placed by customers will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-gray-900 block text-xs sm:text-sm">
                              #{ord.id}
                            </span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              {ord.orderDate}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-gray-900 block truncate">
                              {ord.customerName}
                            </span>
                            <span className="text-[11px] text-gray-500 block truncate">
                              {ord.phone}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                              {ord.deliveryAddress}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {ord.items.slice(0, 2).map((it) => (
                                <div
                                  key={it.id}
                                  className="relative w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 p-0.5 shrink-0 overflow-hidden"
                                  title={`${it.name} (Qty: ${it.quantity})`}
                                >
                                  <Image
                                    src={it.imageUrl}
                                    alt={it.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ))}
                              {ord.items.length > 2 && (
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-1 rounded">
                                  +{ord.items.length - 2}
                                </span>
                              )}
                              <span className="text-[11px] text-gray-700 font-medium truncate max-w-[120px]">
                                {ord.items[0]?.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            ₹{ord.total.toLocaleString("en-IN")}
                            <span className="block text-[10px] font-normal text-gray-400">
                              {ord.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                ord.status === "Pending"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : ord.status === "Confirmed"
                                  ? "bg-sky-50 text-sky-800 border border-sky-200"
                                  : ord.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {ord.status === "Pending" && <Clock className="w-3 h-3 text-amber-600" />}
                              {ord.status === "Confirmed" && <ShieldCheck className="w-3 h-3 text-sky-600" />}
                              {ord.status === "Delivered" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {ord.status === "Cancelled" && <XCircle className="w-3 h-3 text-rose-600" />}
                              <span>{ord.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Direct Status Selector */}
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="px-2 py-1 text-[11px] font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF9800] cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              {/* Customer WhatsApp Contact */}
                              <a
                                href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(ord.customerName)},%20update%20regarding%20your%20Playo%20Edappal%20order%20${ord.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Chat with customer on WhatsApp"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* Delete Order */}
                              <button
                                type="button"
                                onClick={() => deleteOrder(ord.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: INVENTORY MANAGEMENT                                         */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Inventory" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search toys by name, brand, or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Toy Product</span>
              </button>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider block">
                        {p.category || p.categorySlug}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Brand: {p.brand || "Playo"} • Scale: {p.scale || "Standard"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        <span className="font-extrabold text-gray-900">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="line-through text-gray-400 text-[10px]">
                          ₹{p.originalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => toggleInStock(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        p.inStock !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {p.inStock !== false ? "✓ In Stock" : "✕ Out of Stock"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleBestseller(p.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          p.tag === "Bestseller"
                            ? "bg-amber-100 text-amber-900"
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                        title="Toggle Bestseller Badge"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: BRAND MANAGEMENT                                             */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Brand" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Toy Brands ({brands.length})
                </h2>
                <p className="text-xs text-gray-400">Manage diecast and toy brand licensors</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New brand name (e.g. Lamborghini)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBrandName.trim()) return;
                    setBrands([
                      ...brands,
                      {
                        id: `b-${Date.now()}`,
                        name: newBrandName.trim(),
                        origin: "International",
                        count: 0,
                        status: "Active",
                      },
                    ]);
                    setNewBrandName("");
                  }}
                  className="px-3.5 py-1.5 bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Add Brand
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-sm text-gray-700">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900">{b.name}</h3>
                      <p className="text-[11px] text-gray-400">{b.origin} • {b.count} Products</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: CATEGORY MANAGEMENT                                          */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Category" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Store Categories ({categories.length})
                </h2>
                <p className="text-xs text-gray-400">Browse and organize all toy collections</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCategoryName.trim()) return;
                    setCategories([
                      ...categories,
                      {
                        id: `cat-${Date.now()}`,
                        name: newCategoryName.trim(),
                        slug: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
                        imageUrl: "/images/carousel/kids-jeep.png",
                        href: `/catalog?category=${newCategoryName.toLowerCase().replace(/\s+/g, "-")}`,
                      },
                    ]);
                    setNewCategoryName("");
                  }}
                  className="px-3.5 py-1.5 bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Add Category
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex items-center gap-3"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    <Image src={c.imageUrl} alt={c.name} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{c.name}</h3>
                    <p className="text-[11px] text-gray-400">/{c.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 5: SCALE MANAGEMENT                                             */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Scale" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Diecast & Model Scales ({scales.length})
                </h2>
                <p className="text-xs text-gray-400">Ratios used for model collectors and RC cars</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ratio (e.g. 1:10)"
                  value={newScaleRatio}
                  onChange={(e) => setNewScaleRatio(e.target.value)}
                  className="w-24 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
                <input
                  type="text"
                  placeholder="Description..."
                  value={newScaleDesc}
                  onChange={(e) => setNewScaleDesc(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newScaleRatio.trim()) return;
                    setScales([
                      ...scales,
                      {
                        id: `sc-${Date.now()}`,
                        scale: newScaleRatio.trim(),
                        desc: newScaleDesc.trim() || "Model scale",
                        count: 0,
                      },
                    ]);
                    setNewScaleRatio("");
                    setNewScaleDesc("");
                  }}
                  className="px-3.5 py-1.5 bg-[#0D1B2A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Add Scale
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {scales.map((sc) => (
                <div
                  key={sc.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-800 flex items-center justify-center font-black text-sm">
                      {sc.scale}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900">Scale {sc.scale}</h3>
                      <p className="text-[11px] text-gray-400">{sc.desc}</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-gray-500">
                    {sc.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 6: NOTIFICATIONS                                                */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Notifications" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Store Notifications & Activity
                </h2>
                <p className="text-xs text-gray-400">Order updates, inventory alerts, and customer messages</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNotifications(notifications.map((n) => ({ ...n, read: true })));
                }}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              >
                Mark All Read
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start gap-3.5 transition-colors ${
                    notif.read ? "bg-white" : "bg-orange-50/30"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === "order"
                        ? "bg-sky-100 text-sky-600"
                        : notif.type === "stock"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {notif.type === "order" && <Package className="w-4 h-4" />}
                    {notif.type === "stock" && <AlertTriangle className="w-4 h-4" />}
                    {notif.type === "system" && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 7: BEST SELLING                                                 */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Best selling" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Best Selling & Trending Toys
                </h2>
                <p className="text-xs text-gray-400">
                  Toggle which products get prioritized in the "Trending in Edappal" showcase
                </p>
              </div>

              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl self-start sm:self-auto">
                {products.filter((p) => p.tag === "Bestseller").length} Featured Bestsellers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => {
                const isBestseller = p.tag === "Bestseller";
                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                      isBestseller
                        ? "border-amber-300 ring-2 ring-amber-100"
                        : "border-gray-200/90 opacity-80"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        <Image src={p.imageUrl} alt={p.name} fill className="object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{p.name}</h3>
                        <p className="text-[11px] text-gray-400">₹{p.price.toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-gray-400 mt-1">★ {p.rating} ({p.reviewsCount} reviews)</p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Bestseller Status:</span>
                      <button
                        type="button"
                        onClick={() => toggleBestseller(p.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isBestseller
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {isBestseller ? "★ Bestseller ON" : "Mark as Bestseller"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 8: OFFER MANAGEMENT                                             */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Offer" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Offers & Coupon Codes ({offers.length})
                </h2>
                <p className="text-xs text-gray-400">Create promotional codes and discount incentives</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. TOY20)"
                  value={newOfferCode}
                  onChange={(e) => setNewOfferCode(e.target.value.toUpperCase())}
                  className="w-28 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800] uppercase font-mono font-bold"
                />
                <input
                  type="text"
                  placeholder="Discount (e.g. 20% OFF)"
                  value={newOfferDiscount}
                  onChange={(e) => setNewOfferDiscount(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newOfferCode.trim()) return;
                    setOffers([
                      ...offers,
                      {
                        id: `off-${Date.now()}`,
                        code: newOfferCode.trim(),
                        title: `${newOfferDiscount || "Discount"} Promo`,
                        discount: newOfferDiscount.trim() || "Special Offer",
                        type: "Discount",
                        active: true,
                        usageCount: 0,
                      },
                    ]);
                    setNewOfferCode("");
                    setNewOfferDiscount("");
                  }}
                  className="px-3.5 py-1.5 bg-[#FF9800] hover:bg-[#F57C00] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  Create Offer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {offers.map((off) => (
                <div
                  key={off.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF9800] border border-orange-200">
                        {off.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOffers(
                            offers.map((o) => (o.id === off.id ? { ...o, active: !o.active } : o))
                          );
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          off.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {off.active ? "Active" : "Inactive"}
                      </button>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 mt-3">{off.title}</h3>
                    <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{off.discount}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Redeemed: {off.usageCount} times</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Valid in Edappal & Online</span>
                    <button
                      type="button"
                      onClick={() => setOffers(offers.filter((o) => o.id !== off.id))}
                      className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">Add New Toy Product</h3>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BMW M4 Diecast Model Car"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.name === e.target.value);
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                        categorySlug: sel?.slug || "rc-cars",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand</label>
                  <select
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2499"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3499"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Image</label>
                <select
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
                >
                  <option value="/images/catalog/porsche-drift-rc.jpg">Porsche Drift RC</option>
                  <option value="/images/catalog/cca-mclaren-box.jpg">McLaren 765LT Box</option>
                  <option value="/images/carousel/kids-jeep.png">Kids 4x4 Jeep</option>
                  <option value="/images/carousel/kids-scooter.png">Glow LED Scooter</option>
                  <option value="/images/carousel/kids-teddy.png">Ultra Cuddle Plush Teddy</option>
                  <option value="/images/carousel/kids-balance-bike.png">Kids Balance Bike</option>
                  <option value="/images/carousel/kids-blocks.png">Wooden Learning Blocks</option>
                  <option value="/images/carousel/kids-mini-dirt-bike.png">Mini Dirt Bike</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold shadow-xs"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
