"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Lock,
  ChevronDown,
  Phone,
  Package,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { PRODUCTS_DATA, CATEGORIES_DATA, ProductItem, CategoryItem } from "@/data/store-data";
import Navbar from "@/components/Navbar";
import { useCart } from "@/data/cart-store";

export type AdminTab =
  | "Inventory"
  | "Orders"
  | "Category"
  | "Notifications"
  | "Best selling"
  | "Offer";

const TABS: AdminTab[] = [
  "Inventory",
  "Orders",
  "Category",
  "Notifications",
  "Best selling",
  "Offer",
];

export interface ColorMapping {
  id: string;
  color: string;
  images: string[];
}

export interface AdminProduct extends ProductItem {
  stockCount: number;
  availableColors?: string;
  colorMappings?: ColorMapping[];
  material?: string;
  description?: string;
  images?: string[];
}

export interface FormProductState {
  name: string;
  availableColors: string;
  colorMappings: ColorMapping[];
  tag: string;
  brand: string;
  scale: string;
  category: string;
  price: string;
  stockCount: string;
  material: string;
  description: string;
  images: string[];
}

export interface StoreOffer {
  id: string;
  minAmount: number;
  discountPercentage: number;
  description: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

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
        id: "prod-porsche-rc",
        name: "PORSCHE DRIFT RC",
        category: "RC Cars",
        imageUrl: "/images/catalog/porsche-drift-rc.jpg",
        price: 1990,
        quantity: 1,
        specs: "1:24 Scale | Color: VIOLET",
      },
    ],
    subtotal: 1990,
    discount: 0,
    deliveryFee: 0,
    total: 1990,
  },
  {
    id: "PLY-84920",
    orderDate: "16 Oct 2026",
    customerName: "Fathima Noor",
    phone: "+91 94460 78901",
    deliveryAddress: "Kuttippuram Road, Near Apollo Pharmacy, Edappal - 679576",
    status: "Confirmed",
    estimatedDelivery: "Tomorrow by 4:00 PM",
    courier: "India Post Doorstep Express",
    trackingNumber: "IP849204918IN",
    carrierLocation: "Out for delivery from Edappal Sub-Post",
    paymentMethod: "Razorpay (UPI / GPay)",
    items: [
      {
        id: "prod-cca-mclaren",
        name: "Metal CCA McLaren 765LT Diecast Model Car",
        category: "Diecast Cars",
        imageUrl: "/images/catalog/cca-mclaren-box.jpg",
        price: 2699,
        quantity: 1,
        specs: "1:24 Scale | Edition: Speed Yellow",
      },
    ],
    subtotal: 2699,
    discount: 0,
    deliveryFee: 0,
    total: 2699,
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: "notif-1", type: "order", title: "New Order Placed", desc: "Order #PLY-91820 placed for PORSCHE DRIFT RC.", time: "10 mins ago", read: false },
  { id: "notif-2", type: "stock", title: "Low Stock Alert", desc: "Metal CCA McLaren 765LT has only 1 unit remaining in showroom.", time: "1 hour ago", read: false },
  { id: "notif-3", type: "stock", title: "Out of Stock", desc: "DRIFT RC CAR WITH GIFT BOX is currently out of stock (0 units).", time: "2 hours ago", read: false },
];

const INITIAL_OFFERS = [
  { id: "off-1", code: "PLAYO10", title: "Flat 10% Discount", discount: "10% OFF", type: "Percentage", active: true, usageCount: 42 },
  { id: "off-2", code: "EDAPPAL500", title: "Special Ride-on Discount", discount: "₹500 OFF", type: "Fixed Amount", active: true, usageCount: 18 },
  { id: "off-3", code: "FREESHIP", title: "100% Free Doorstep Delivery", discount: "FREE Delivery", type: "Shipping", active: true, usageCount: 125 },
];

const INITIAL_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: "prod-porsche-rc",
    name: "PORSCHE DRIFT RC",
    categorySlug: "rc-cars",
    category: "RC Cars",
    price: 1990,
    originalPrice: 2990,
    discount: "33% OFF",
    rating: 5,
    reviewsCount: 128,
    imageUrl: "/images/catalog/porsche-drift-rc.jpg",
    tag: "",
    stockCount: 5,
    inStock: true,
  },
  {
    id: "prod-drift-giftbox",
    name: "DRIFT RC CAR WITH GIFT BOX",
    categorySlug: "rc-cars",
    category: "RC Cars",
    price: 1990,
    originalPrice: 2890,
    discount: "31% OFF",
    rating: 5,
    reviewsCount: 64,
    imageUrl: "/images/catalog/drift-rc-gift-box.jpg",
    tag: "",
    stockCount: 0,
    inStock: false,
  },
  {
    id: "prod-cca-mclaren",
    name: "Metal CCA McLaren 765LT Diecast Model Car",
    categorySlug: "rc-cars",
    category: "Diecast Cars",
    price: 2699,
    originalPrice: 3499,
    discount: "23% OFF",
    rating: 5,
    reviewsCount: 42,
    imageUrl: "/images/catalog/cca-mclaren-box.jpg",
    tag: "",
    stockCount: 1,
    inStock: true,
  },
];

function AdminContent() {
  const router = useRouter();
  const { cartItems, wishlistIds, setIsCartOpen } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Active Tab - defaults to Inventory
  const [activeTab, setActiveTab] = useState<AdminTab>("Inventory");

  // Top header alerts toggle states
  const [soundAlert, setSoundAlert] = useState(true);
  const [deviceAlerts, setDeviceAlerts] = useState(true);

  // Products state
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_ADMIN_PRODUCTS);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStockStatus, setSelectedStockStatus] = useState("ALL");

  // Modal states for Product Add / Edit
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const DEFAULT_FORM_PRODUCT: FormProductState = {
    name: "",
    availableColors: "",
    colorMappings: [],
    tag: "",
    brand: "",
    scale: "",
    category: "",
    price: "0",
    stockCount: "0",
    material: "Diecast Metal with Plastic Parts",
    description: "",
    images: [],
  };

  const [formProduct, setFormProduct] = useState<FormProductState>(DEFAULT_FORM_PRODUCT);

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"ALL" | OrderStatus>("ALL");

  // Categories, Notifications, Offers
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES_DATA);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [formCategory, setFormCategory] = useState({
    name: "",
    imageUrl: "",
  });

  const handleOpenAddCategory = () => {
    setFormCategory({ name: "", imageUrl: "" });
    setIsAddCategoryOpen(true);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormCategory((prev) => ({ ...prev, imageUrl: url }));
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory.name.trim()) return;

    const slug = formCategory.name.trim().toLowerCase().replace(/\s+/g, "-");
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: formCategory.name.trim(),
      slug,
      imageUrl: formCategory.imageUrl || "/images/catalog/porsche-drift-rc.jpg",
      href: `/catalog?category=${slug}`,
    };

    setCategories((prev) => [...prev, newCat]);
    setIsAddCategoryOpen(false);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
    }
  };

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Special Purchase Offers (as shown in image)
  const [offerPurchaseAmount, setOfferPurchaseAmount] = useState<number>(2000);
  const [offerPercentage, setOfferPercentage] = useState<number>(10);
  const [storeOffers, setStoreOffers] = useState<StoreOffer[]>([]);

  const handleAddStoreOffer = () => {
    if (!offerPurchaseAmount || !offerPercentage || offerPurchaseAmount <= 0 || offerPercentage <= 0) return;
    const newOffer: StoreOffer = {
      id: `off-${Date.now()}`,
      minAmount: offerPurchaseAmount,
      discountPercentage: offerPercentage,
      description: `When a customer orders ₹${offerPurchaseAmount.toLocaleString("en-IN")} or more, they automatically receive a ${offerPercentage}% discount.`,
      status: "Active",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    setStoreOffers((prev) => [newOffer, ...prev]);
  };

  const handleDeleteStoreOffer = (id: string) => {
    if (confirm("Are you sure you want to delete this offer rule?")) {
      setStoreOffers((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleToggleStoreOfferStatus = (id: string) => {
    setStoreOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "Active" ? "Inactive" : "Active" }
          : o
      )
    );
  };

  // Load orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("playo_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: AdminOrder[] = parsed.map((raw: any) => ({
            id: raw.id,
            orderDate: raw.orderDate || "Recently",
            customerName: raw.customerName || "Customer",
            phone: raw.phone || "",
            deliveryAddress: raw.deliveryAddress || "Edappal, Malappuram",
            status: raw.status || "Pending",
            estimatedDelivery: raw.estimatedDelivery || "2-3 Business Days",
            courier: raw.courier || "India Post Doorstep Express",
            trackingNumber: raw.trackingNumber || `TRK-${raw.id}`,
            carrierLocation: raw.carrierLocation || "Edappal Fulfillment Hub",
            paymentMethod: raw.paymentMethod || "Razorpay (UPI / NetBanking)",
            items: Array.isArray(raw.items)
              ? raw.items.map((it: any, i: number) => ({
                  id: it.id || `it-${i}`,
                  name: it.name || "Playo Item",
                  category: "RC Cars",
                  imageUrl: it.image || "/images/catalog/porsche-drift-rc.jpg",
                  price: Number(it.price) || 1990,
                  quantity: Number(it.qty) || 1,
                  specs: `Scale: ${it.scale || "1:24"} • Color: ${it.color || "VIOLET"}`,
                }))
              : [],
            subtotal: Number(raw.totalAmount) || 1990,
            deliveryFee: 0,
            discount: 0,
            total: Number(raw.totalAmount) || 1990,
          }));
          setOrders(mapped);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Filter products by search, category, and stock
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== "ALL" && p.categorySlug !== selectedCategory) return false;

      // Stock status filter
      if (selectedStockStatus === "IN_STOCK" && p.stockCount <= 0) return false;
      if (selectedStockStatus === "OUT_OF_STOCK" && p.stockCount > 0) return false;

      // Search filter
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = (p.category || "").toLowerCase().includes(q);
        const matchesTag = (p.tag || "").toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesTag;
      }
      return true;
    });
  }, [products, inventorySearch, selectedCategory, selectedStockStatus]);

  // Unique categories count
  const availableCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category || p.categorySlug).filter(Boolean)));
  }, [products]);

  // Handle Delete Product
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}" from inventory?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Handle Image Uploads
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setFormProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Handle Color Mappings
  const handleAddColorMapping = () => {
    setFormProduct((prev) => ({
      ...prev,
      colorMappings: [
        ...prev.colorMappings,
        {
          id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          color: "",
          images: [],
        },
      ],
    }));
  };

  const handleUpdateColorName = (id: string, color: string) => {
    setFormProduct((prev) => ({
      ...prev,
      colorMappings: prev.colorMappings.map((m) =>
        m.id === id ? { ...m, color } : m
      ),
    }));
  };

  const handleColorImagesUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newUrls = files.map((f) => URL.createObjectURL(f));
      setFormProduct((prev) => ({
        ...prev,
        colorMappings: prev.colorMappings.map((m) =>
          m.id === id ? { ...m, images: [...m.images, ...newUrls] } : m
        ),
      }));
    }
  };

  const handleRemoveColorImage = (mappingId: string, imageIdx: number) => {
    setFormProduct((prev) => ({
      ...prev,
      colorMappings: prev.colorMappings.map((m) =>
        m.id === mappingId
          ? { ...m, images: m.images.filter((_, idx) => idx !== imageIdx) }
          : m
      ),
    }));
  };

  const handleRemoveColorMapping = (id: string) => {
    setFormProduct((prev) => ({
      ...prev,
      colorMappings: prev.colorMappings.filter((m) => m.id !== id),
    }));
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p: AdminProduct) => {
    setEditingProduct(p);
    setFormProduct({
      name: p.name,
      availableColors: p.availableColors || (p.color ? p.color : ""),
      colorMappings: p.colorMappings || [],
      tag: p.tag || "",
      brand: p.brand || "",
      scale: p.scale || (p.specs?.scale || ""),
      category: p.category || "",
      price: p.price.toString(),
      stockCount: p.stockCount.toString(),
      material: p.material || p.specs?.material || "Diecast Metal with Plastic Parts",
      description: p.description || "",
      images: p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
    });
    setIsAddProductOpen(false);
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormProduct(DEFAULT_FORM_PRODUCT);
    setIsAddProductOpen(true);
  };

  // Save Add / Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name.trim()) return;

    const pr = Number(formProduct.price) || 0;
    const st = Number(formProduct.stockCount) || 0;
    const mat = formProduct.material.trim() || "Diecast Metal with Plastic Parts";
    const primaryImg =
      formProduct.images[0] ||
      editingProduct?.imageUrl ||
      "/images/catalog/porsche-drift-rc.jpg";

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: formProduct.name.trim(),
                price: pr,
                stockCount: st,
                inStock: st > 0,
                tag: formProduct.tag.trim() || undefined,
                brand: formProduct.brand.trim() || undefined,
                scale: formProduct.scale.trim() || undefined,
                category: formProduct.category.trim() || item.category,
                material: mat,
                description: formProduct.description.trim() || undefined,
                availableColors: formProduct.availableColors.trim() || undefined,
                colorMappings: formProduct.colorMappings,
                images: formProduct.images.length > 0 ? formProduct.images : item.images,
                imageUrl: primaryImg,
              }
            : item
        )
      );
      setEditingProduct(null);
    } else {
      const newProd: AdminProduct = {
        id: `prod-${Date.now().toString().slice(-6)}`,
        name: formProduct.name.trim(),
        price: pr,
        originalPrice: Math.round(pr * 1.3),
        discount: "20% OFF",
        rating: 5,
        reviewsCount: 1,
        categorySlug: formProduct.category
          ? formProduct.category.toLowerCase().replace(/\s+/g, "-")
          : "rc-cars",
        category: formProduct.category || "RC Cars",
        brand: formProduct.brand.trim() || undefined,
        scale: formProduct.scale.trim() || undefined,
        material: mat,
        description: formProduct.description.trim() || undefined,
        availableColors: formProduct.availableColors.trim() || undefined,
        colorMappings: formProduct.colorMappings,
        images: formProduct.images,
        imageUrl: primaryImg,
        stockCount: st,
        inStock: st > 0,
        tag: formProduct.tag.trim() || undefined,
      };
      setProducts((prev) => [newProd, ...prev]);
      setIsAddProductOpen(false);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    try {
      localStorage.setItem("playo_orders", JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Are you sure you want to delete order #${orderId}?`)) {
      const updated = orders.filter((o) => o.id !== orderId);
      setOrders(updated);
      try {
        localStorage.setItem("playo_orders", JSON.stringify(updated));
      } catch {
        // safe fallback
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FD] text-slate-800 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      {/* ========================================================
          1. MAIN STORE NAVBAR AT TOP
         ======================================================== */}
      <Navbar
        activePage="admin"
        cartCount={isMounted ? cartItems.reduce((acc, i) => acc + i.quantity, 0) : 0}
        wishlistCount={isMounted ? wishlistIds.length : 0}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ========================================================
          2. ADMIN DASHBOARD HEADER
         ======================================================== */}
      <div className="w-full bg-white border-b border-slate-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Admin Dashboard + Live Alerts + Sound Toggle + Device Alerts */}
            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Admin Dashboard
              </h1>

              {/* Live Alerts Dot & Text */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 ml-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Live Alerts</span>
              </div>

              {/* Sound Toggle Pill */}
              <button
                type="button"
                onClick={() => setSoundAlert(!soundAlert)}
                className="bg-[#EDFBF4] hover:bg-[#E2F7EB] text-[#16A34A] border border-[#B9F0D2] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Toggle Alert Sounds"
              >
                <span>{soundAlert ? "🔊" : "🔇"}</span>
                <span>Sound: {soundAlert ? "ON" : "OFF"}</span>
              </button>

              {/* Device Alerts Active Pill */}
              <button
                type="button"
                onClick={() => setDeviceAlerts(!deviceAlerts)}
                className="bg-[#EDFBF4] hover:bg-[#E2F7EB] text-[#16A34A] border border-[#B9F0D2] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Toggle Device Push Alerts"
              >
                <span>🔔</span>
                <span>Device Alerts: {deviceAlerts ? "ACTIVE" : "PAUSED"}</span>
              </button>
            </div>

            {/* Right: Log Out & Add Product Button */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              {/* Log Out Button */}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to log out from Playo Admin?")) {
                    router.push("/");
                  }
                }}
                className="bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <Lock className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Log Out</span>
              </button>

              {/* + Add Product Button - ONLY in Inventory Tab */}
              {activeTab === "Inventory" && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all cursor-pointer active:scale-95"
                >
                  <span>+ Add Product</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================
              3. HORIZONTAL TABS (Brand, Scale & News Removed)
             ======================================================== */}
          <div className="flex items-center gap-6 sm:gap-8 mt-5 overflow-x-auto no-scrollbar -mb-px">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                    isActive
                      ? "text-[#0284C7]"
                      : "text-slate-500 hover:text-slate-800 font-semibold"
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0284C7] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN ADMIN CONTENT AREA
         ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ========================================================
            TAB 1: INVENTORY
           ======================================================== */}
        {activeTab === "Inventory" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Filter & Search Bar Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-[0_2px_12px_rgba(2,132,199,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              {/* Search input with icon */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#0284C7] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name, category, or tag..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              {/* Middle Dropdown Filters: All Categories & Stock Status */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2 pr-8 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="rc-cars">RC Cars</option>
                    <option value="diecast">Diecast Cars</option>
                    <option value="ride-ons">Ride-ons</option>
                    <option value="scooters">Scooters</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Stock Status Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="px-3.5 py-2 pr-8 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Stock Status</option>
                    <option value="IN_STOCK">In Stock (&gt; 0)</option>
                    <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Right: Showing X of Y products Pill */}
              <div className="self-end md:self-auto">
                <span className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              </div>
            </div>

            {/* Inventory Products Table */}
            <div className="bg-white rounded-2xl border border-sky-100/70 shadow-[0_2px_14px_rgba(2,132,199,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  {/* Table Header with light sky-blue background */}
                  <thead className="bg-[#EBF5FB] border-b border-sky-100/90 text-slate-800 font-extrabold">
                    <tr>
                      <th className="py-3.5 px-5 font-bold">Product Name</th>
                      <th className="py-3.5 px-5 font-bold">Category</th>
                      <th className="py-3.5 px-5 font-bold">Price (₹)</th>
                      <th className="py-3.5 px-5 font-bold">Stock</th>
                      <th className="py-3.5 px-5 font-bold">Tag / Status</th>
                      <th className="py-3.5 px-5 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#0284C7]" />
                          <p className="font-bold text-slate-700">No products found</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Try adjusting your search or category filters.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-sky-50/20 transition-colors"
                        >
                          {/* Product Name */}
                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                              {p.name}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-5 text-slate-600 font-medium">
                            {p.category || p.categorySlug}
                          </td>

                          {/* Price */}
                          <td className="py-4 px-5 font-bold text-slate-900">
                            {p.price.toLocaleString("en-IN")}
                          </td>

                          {/* Stock (Green if > 0, Red if 0) */}
                          <td className="py-4 px-5">
                            <span
                              className={`font-black ${
                                p.stockCount > 0
                                  ? "text-[#16A34A]"
                                  : "text-[#EF4444]"
                              }`}
                            >
                              {p.stockCount}
                            </span>
                          </td>

                          {/* Tag / Status */}
                          <td className="py-4 px-5 text-slate-400">
                            {p.tag ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded border border-amber-200">
                                {p.tag}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Actions: Edit & Delete buttons */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              {/* Edit Button - light blue */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="px-3 py-1 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] rounded-md font-bold text-xs transition-colors cursor-pointer"
                              >
                                Edit
                              </button>

                              {/* Delete Button - red */}
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="px-3 py-1 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-md font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                              >
                                Delete
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

        {/* ========================================================
            TAB 2: ORDERS MANAGEMENT
           ======================================================== */}
        {activeTab === "Orders" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter row */}
            <div className="bg-white rounded-2xl p-4 border border-sky-100/60 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(["ALL", "Pending", "Confirmed", "Delivered", "Cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === st
                        ? "bg-[#0284C7] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{st === "ALL" ? "All Orders" : st}</span>
                    <span className="ml-1.5 text-[10px] opacity-80">
                      {st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order ID, customer, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-sky-100/70 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#EBF5FB] border-b border-sky-100 text-slate-800 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Order ID & Date</th>
                      <th className="py-3.5 px-4">Customer & Address</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 block">
                              #{ord.id}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {ord.orderDate}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">
                              {ord.customerName}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {ord.phone}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {ord.deliveryAddress}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {ord.items.map((it) => (
                              <div key={it.id} className="text-xs">
                                <span className="font-semibold text-slate-900">{it.name}</span>
                                <span className="text-slate-500 text-[11px] ml-1">
                                  (Qty: {it.quantity})
                                </span>
                              </div>
                            ))}
                          </td>

                          <td className="py-3.5 px-4 font-black text-slate-900">
                            ₹{ord.total.toLocaleString("en-IN")}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer ${
                                ord.status === "Pending"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : ord.status === "Confirmed"
                                  ? "bg-sky-50 text-sky-800 border-sky-200"
                                  : ord.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ord.phone && (
                                <a
                                  href={`https://wa.me/${ord.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                    `Hi ${ord.customerName}! Update on your Playo Edappal order #${ord.id}.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        {/* ========================================================
            TAB 3: CATEGORY MANAGEMENT
           ======================================================== */}
        {activeTab === "Category" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  Store Categories ({categories.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Manage categories shown across store navigation and filters
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>+ Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-sky-100/70 p-4 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{c.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">Slug: /{c.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={c.href}
                      className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition-colors"
                      title="View in Store"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: NOTIFICATIONS
           ======================================================== */}
        {activeTab === "Notifications" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  Alerts & Activity Stream ({notifications.length})
                </h3>
                <p className="text-xs text-slate-400">Live order & inventory updates</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNotifications(notifications.map((n) => ({ ...n, read: true })))
                }
                className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs flex items-start gap-3.5 transition-all ${
                    n.read ? "border-slate-100 opacity-75" : "border-sky-100/90 ring-1 ring-sky-50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === "order"
                        ? "bg-emerald-50 text-emerald-600"
                        : n.type === "stock"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: BEST SELLING
           ======================================================== */}
        {activeTab === "Best selling" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-2xs">
              <h3 className="font-extrabold text-base text-slate-800">
                Top Bestselling Toys (Kerala Leaderboard)
              </h3>
              <p className="text-xs text-slate-400">
                Items featured on the store frontpage carousel & banners
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products
                .filter((p) => p.rating === 5 || p.tag === "Bestseller")
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-sky-100/70 p-4 shadow-2xs flex items-center gap-3.5"
                  >
                    <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="relative w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                        ₹{p.price.toLocaleString("en-IN")} • {p.stockCount} in stock
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: SPECIAL PURCHASE OFFERS (Exact match to screenshot)
           ======================================================== */}
        {activeTab === "Offer" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Card: Create Special Purchase Offer */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header with yellow tag icon */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-500 text-lg shrink-0 mt-0.5">
                  🏷️
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Create Special Purchase Offer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Specify a minimum purchase amount and an offer percentage. When a user buys products of this amount or more, that percentage discount is automatically applied.
                  </p>
                </div>
              </div>

              {/* Form Grid: Purchase Amount & Offer Percentage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Purchase Amount (₹) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Purchase Amount (₹) *
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Minimum cart/order total
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={offerPurchaseAmount || ""}
                      onChange={(e) => setOfferPurchaseAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                  </div>
                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {[500, 949, 1000, 1500, 2000, 3000, 5000].map((amt) => {
                      const isSelected = offerPurchaseAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setOfferPurchaseAmount(amt)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0369A1] text-white shadow-2xs"
                              : "bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-100/70"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Offer Percentage (%) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Offer Percentage (%) *
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Discount percentage
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={offerPercentage || ""}
                      onChange={(e) => setOfferPercentage(Number(e.target.value))}
                      className="w-full pl-4 pr-9 py-2.5 text-xs sm:text-sm font-bold text-slate-800 rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                    <span className="absolute right-3.5 text-xs sm:text-sm font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {[5, 10, 15, 20, 25, 30, 50].map((pct) => {
                      const isSelected = offerPercentage === pct;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setOfferPercentage(pct)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0369A1] text-white shadow-2xs"
                              : "bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-100/70"
                          }`}
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Instant Customer Discount Rule Preview */}
              <div className="p-4 bg-[#F0F9FF] border border-dashed border-[#7DD3FC] rounded-2xl flex items-center gap-3.5">
                <div className="text-2xl shrink-0">🎁</div>
                <div className="text-xs leading-relaxed">
                  <h4 className="font-extrabold text-[#0284C7] text-xs sm:text-sm mb-0.5">
                    Instant Customer Discount Rule Preview
                  </h4>
                  <p className="text-slate-600">
                    When a customer orders{" "}
                    <span className="font-black text-slate-900">
                      ₹{(offerPurchaseAmount || 0).toLocaleString("en-IN")}
                    </span>{" "}
                    or more, they will automatically receive a{" "}
                    <span className="font-black text-slate-900">
                      {offerPercentage || 0}% discount
                    </span>{" "}
                    (e.g. saving ₹
                    {Math.round(
                      ((offerPurchaseAmount || 0) * (offerPercentage || 0)) / 100
                    ).toLocaleString("en-IN")}{" "}
                    on a ₹{(offerPurchaseAmount || 0).toLocaleString("en-IN")} purchase).
                  </p>
                </div>
              </div>

              {/* Add Offer Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddStoreOffer}
                  className="bg-[#38BDF8] hover:bg-[#0EA5E9] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>✓</span>
                  <span>Add Offer</span>
                </button>
              </div>
            </div>

            {/* Bottom Card: Active Store Offers */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                    Active Store Offers
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Offers currently configured in the database and applied automatically at checkout.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0284C7]">
                  {storeOffers.length} Offers Configured
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F0F9FF] border-b border-sky-100 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Purchase Amount (₹)</th>
                      <th className="py-3.5 px-6">Offer Discount (%)</th>
                      <th className="py-3.5 px-6">Offer Description</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Created</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeOffers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 px-4 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-3xl">🏷️</div>
                            <h4 className="font-bold text-sm text-slate-800">
                              No offers created yet
                            </h4>
                            <p className="text-xs text-slate-400">
                              Use the form above to add your first offer (e.g. 10% OFF on ₹2000 purchase)
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      storeOffers.map((off) => (
                        <tr
                          key={off.id}
                          className="border-b border-slate-100/80 hover:bg-sky-50/30 transition-colors"
                        >
                          <td className="py-4 px-6 font-extrabold text-sm text-slate-900">
                            ₹{off.minAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black">
                              {off.discountPercentage}% OFF
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-600 max-w-sm">
                            {off.description}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              type="button"
                              onClick={() => handleToggleStoreOfferStatus(off.id)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                off.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {off.status}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-400">
                            {off.createdAt}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteStoreOffer(off.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Offer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      </main>

      {/* ========================================================
          ADD / EDIT PRODUCT MODAL
         ======================================================== */}
      {(isAddProductOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-white shrink-0">
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-2xl font-light leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* 1. Product Images (Upload Multiple) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Product Images (Upload Multiple)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFilesChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1.5 bg-slate-50/60"
                  />
                  <p className="text-xs text-slate-500 font-medium">
                    {formProduct.images.length} image(s) currently attached. First image will be used as the thumbnail.
                  </p>

                  {/* Previews if any */}
                  {formProduct.images.length > 0 && (
                    <div className="flex items-center gap-2.5 flex-wrap pt-1">
                      {formProduct.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group"
                        >
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-sky-600/90 text-white text-[9px] font-bold text-center py-0.5">
                              Thumbnail
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] leading-none opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formProduct.name}
                  onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                  placeholder="Product Name"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              {/* 3. Available Colors (Comma Separated) - Simple */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Available Colors (Comma Separated) - Simple
                </label>
                <input
                  type="text"
                  value={formProduct.availableColors}
                  onChange={(e) =>
                    setFormProduct({ ...formProduct, availableColors: e.target.value })
                  }
                  placeholder="e.g. Red, Blue, Matte Black"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              {/* 4. Color Images Mapping (Advanced) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Color Images Mapping (Advanced)
                </label>
                
                {formProduct.colorMappings.length > 0 && (
                  <div className="space-y-3 mb-3">
                    {formProduct.colorMappings.map((mapping, mIdx) => (
                      <div
                        key={mapping.id}
                        className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                          <span className="text-[11px] font-black text-[#0284C7] uppercase tracking-wider">
                            Color #{mIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColorMapping(mapping.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Color Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Red, Matte Black, Blue"
                            value={mapping.color}
                            onChange={(e) =>
                              handleUpdateColorName(mapping.id, e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-sky-100 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Upload Color Images (From Device)
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleColorImagesUpload(mapping.id, e)}
                            className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-bold file:bg-white file:text-[#0284C7] hover:file:bg-sky-50 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1 bg-white"
                          />
                          <p className="text-[10px] text-slate-500 font-medium mt-1">
                            {mapping.images.length} image(s) uploaded from device for this color
                          </p>

                          {/* Uploaded previews */}
                          {mapping.images.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-2">
                              {mapping.images.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs group"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`${mapping.color || "Color"} preview ${imgIdx + 1}`}
                                    className="w-full h-full object-contain"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveColorImage(mapping.id, imgIdx)
                                    }
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] leading-none opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                                    title="Remove this image"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddColorMapping}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sky-200 bg-sky-50 text-[#0284C7] hover:bg-sky-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  + Add Color Image Mapping
                </button>
              </div>

              {/* 5. Badge / Tag (Section Routing) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Badge / Tag (Section Routing)
                </label>
                <select
                  value={formProduct.tag}
                  onChange={(e) => setFormProduct({ ...formProduct, tag: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                >
                  <option value="">None (Regular Product)</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Special Offer">Special Offer</option>
                  <option value="Limited Edition">Limited Edition</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>

              {/* 6. Brand (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Brand (Optional)
                </label>
                <select
                  value={formProduct.brand}
                  onChange={(e) => setFormProduct({ ...formProduct, brand: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Brand (Optional)</option>
                  <option value="Playo Originals">Playo Originals</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Ferrari">Ferrari</option>
                  <option value="Lamborghini">Lamborghini</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Ford">Ford</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Hot Wheels">Hot Wheels</option>
                  <option value="Maisto">Maisto</option>
                  <option value="Bburago">Bburago</option>
                </select>
              </div>

              {/* 7. Scale (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Scale (Optional)
                </label>
                <select
                  value={formProduct.scale}
                  onChange={(e) => setFormProduct({ ...formProduct, scale: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Scale (Optional)</option>
                  <option value="1:12">1:12</option>
                  <option value="1:18">1:18</option>
                  <option value="1:24">1:24</option>
                  <option value="1:32">1:32</option>
                  <option value="1:36">1:36</option>
                  <option value="1:43">1:43</option>
                  <option value="1:64">1:64</option>
                  <option value="Non-Scale / Standard">Non-Scale / Standard</option>
                </select>
              </div>

              {/* 8. Category (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category (Optional)
                </label>
                <select
                  value={formProduct.category}
                  onChange={(e) =>
                    setFormProduct({ ...formProduct, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Category (Optional)</option>
                  <option value="RC Cars">RC Cars</option>
                  <option value="Diecast Cars">Diecast Cars</option>
                  <option value="Ride-ons">Ride-ons</option>
                  <option value="Scooters">Scooters</option>
                  <option value="Remote Control Jeeps">Remote Control Jeeps</option>
                  <option value="Motorcycles & Bikes">Motorcycles & Bikes</option>
                </select>
              </div>

              {/* 9. Price (₹) & 10. Stock Quantity in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formProduct.price}
                    onChange={(e) =>
                      setFormProduct({ ...formProduct, price: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formProduct.stockCount}
                    onChange={(e) =>
                      setFormProduct({ ...formProduct, stockCount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 11. Material */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Material
                </label>
                <input
                  type="text"
                  value={formProduct.material}
                  onChange={(e) =>
                    setFormProduct({ ...formProduct, material: e.target.value })
                  }
                  placeholder="Diecast Metal with Plastic Parts"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Default if left empty: Diecast Metal with Plastic Parts
                </p>
              </div>

              {/* 12. Product Description (Custom) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Product Description (Custom)
                </label>
                <textarea
                  rows={4}
                  value={formProduct.description}
                  onChange={(e) =>
                    setFormProduct({ ...formProduct, description: e.target.value })
                  }
                  placeholder="Enter detailed custom description for this product (or leave blank for standard template)..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-y"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-medium pb-2">
                  Shown on the product detail page. If left blank, the standard craftsmanship description will be displayed.
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-slate-100 px-6 py-3.5 flex items-center justify-end gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs cursor-pointer transition-all"
              >
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD CATEGORY MODAL / POPUP DIV
         ======================================================== */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                Add Category
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-2xl font-light leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formCategory.name}
                  onChange={(e) =>
                    setFormCategory({ ...formCategory, name: e.target.value })
                  }
                  placeholder="e.g. Electric Ride-ons, RC Cars, Scooters"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              {/* Upload Image (One Image) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Upload Image (One Image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1.5 bg-slate-50/60"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Select a single image from your device for this category
                </p>

                {/* Preview if uploaded */}
                {formCategory.imageUrl && (
                  <div className="mt-3 relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                    <img
                      src={formCategory.imageUrl}
                      alt="Category Preview"
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormCategory((prev) => ({ ...prev, imageUrl: "" }))
                      }
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs cursor-pointer transition-all"
                >
                  Add Category
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
        <div className="min-h-screen bg-[#F4F9FD] flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-[#0284C7]/30 border-t-[#0284C7] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
