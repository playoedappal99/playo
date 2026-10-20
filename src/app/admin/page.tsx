"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Lock,
  ChevronDown,
  Phone,
  Package,
  Bell,
  ExternalLink,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Flame,
} from "lucide-react";
import { ProductItem, CategoryItem } from "@/data/store-data";
import Navbar from "@/components/Navbar";
import { useCart } from "@/data/cart-store";
import AdminAuthScreen from "@/components/AdminAuthScreen";

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
  soldCount?: number;
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

export interface AdminNotification {
  id: string;
  type: "order" | "stock" | "general";
  title: string;
  desc: string;
  time: string;
  read: boolean;
  priority?: number;
}

const ADMIN_API_KEY =
  process.env.NEXT_PUBLIC_ADMIN_API_KEY || "playo_secure_admin_key_2026_edappal";

function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-admin-key": ADMIN_API_KEY,
    ...extra,
  };
}

function AdminContent() {
  const router = useRouter();
  const { cartItems, wishlistIds, setIsCartOpen } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check admin session on mount
  useEffect(() => {
    setIsMounted(true);
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>("Inventory");

  // Top header alerts toggle states
  const [soundAlert, setSoundAlert] = useState(true);
  const [deviceAlerts, setDeviceAlerts] = useState(true);

  // Products state (from MongoDB)
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStockStatus, setSelectedStockStatus] = useState("ALL");
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Orders State (from MongoDB)
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Categories (from MongoDB)
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [formCategory, setFormCategory] = useState({ name: "", imageUrl: "" });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);

  // Notifications (from MongoDB)
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Bestsellers (from MongoDB)
  const [bestsellers, setBestsellers] = useState<AdminProduct[]>([]);
  const [isBestsellersLoading, setIsBestsellersLoading] = useState(false);

  // Special Purchase Offers (from MongoDB)
  const [offerPurchaseAmount, setOfferPurchaseAmount] = useState<number>(2000);
  const [offerPercentage, setOfferPercentage] = useState<number>(10);
  const [storeOffers, setStoreOffers] = useState<StoreOffer[]>([]);
  const [isOffersLoading, setIsOffersLoading] = useState(false);

  // Modal states for Product Add / Edit
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);

  const DEFAULT_FORM_PRODUCT: FormProductState = {
    name: "",
    availableColors: "",
    colorMappings: [],
    tag: "",
    brand: "",
    scale: "",
    category: "",
    price: "",
    stockCount: "5",
    material: "Diecast Metal with Plastic Parts",
    description: "",
    images: [],
  };

  const [formProduct, setFormProduct] = useState<FormProductState>(DEFAULT_FORM_PRODUCT);

  // 1. Fetch Products from MongoDB
  const fetchProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true);
      const res = await fetch(`/api/products?nocache=true&t=${Date.now()}`, {
        cache: "no-store",
        headers: adminHeaders({
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // 2. Fetch Categories from MongoDB
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  // 3. Fetch Orders from MongoDB
  const fetchOrders = useCallback(async () => {
    try {
      setIsOrdersLoading(true);
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // 4. Fetch Notifications from MongoDB
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadNotifCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }, []);

  // 5. Fetch Offers from MongoDB
  const fetchOffers = useCallback(async () => {
    try {
      setIsOffersLoading(true);
      const res = await fetch("/api/offers", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.offers)) {
        setStoreOffers(data.offers);
      }
    } catch (err) {
      console.error("Error loading offers:", err);
    } finally {
      setIsOffersLoading(false);
    }
  }, []);

  // 6. Fetch Bestsellers from MongoDB
  const fetchBestsellers = useCallback(async () => {
    try {
      setIsBestsellersLoading(true);
      const res = await fetch("/api/best-selling", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.bestsellers)) {
        setBestsellers(data.bestsellers);
      }
    } catch (err) {
      console.error("Error loading bestsellers:", err);
    } finally {
      setIsBestsellersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchCategories();
      fetchOrders();
      fetchNotifications();
      fetchOffers();
      fetchBestsellers();
    }
  }, [isAuthenticated, fetchProducts, fetchCategories, fetchOrders, fetchNotifications, fetchOffers, fetchBestsellers]);

  // Re-fetch when switching tabs
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "Inventory") fetchProducts();
    if (activeTab === "Orders") fetchOrders();
    if (activeTab === "Category") fetchCategories();
    if (activeTab === "Notifications") fetchNotifications();
    if (activeTab === "Best selling") fetchBestsellers();
    if (activeTab === "Offer") fetchOffers();
  }, [isAuthenticated, activeTab, fetchProducts, fetchOrders, fetchCategories, fetchNotifications, fetchBestsellers, fetchOffers]);

  // Handle Category Add & Upload
  const handleOpenAddCategory = () => {
    setFormCategory({ name: "", imageUrl: "" });
    setCategoryImageFile(null);
    setIsAddCategoryOpen(true);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormCategory((prev) => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory.name.trim()) return;

    try {
      setIsUploadingCatImage(true);
      let finalImageUrl = formCategory.imageUrl;

      // Upload to Cloudinary if file was selected
      if (categoryImageFile) {
        const formData = new FormData();
        formData.append("files", categoryImageFile);
        formData.append("file", categoryImageFile);
        formData.append("folder", "playoedappal/categories");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: adminHeaders(),
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && (uploadData.url || uploadData.urls?.[0])) {
          finalImageUrl = uploadData.url || uploadData.urls[0];
        } else {
          alert("Category image upload error: " + (uploadData.error || "Upload failed"));
          return;
        }
      }

      // Never save temporary blob URLs to database
      if (finalImageUrl.startsWith("blob:") || !finalImageUrl) {
        finalImageUrl = "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80";
      }

      // Save category to MongoDB
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: formCategory.name.trim(),
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddCategoryOpen(false);
        fetchCategories();
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch (err: any) {
      console.error("Error creating category:", err);
      alert(err.message || "Network error");
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(catId)}`, {
          method: "DELETE",
          headers: adminHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          fetchCategories();
        } else {
          alert(data.error || "Failed to delete category");
        }
      } catch (err: any) {
        console.error("Error deleting category:", err);
      }
    }
  };

  // Handle Offer Add & Toggle
  const handleAddStoreOffer = async () => {
    if (!offerPurchaseAmount || !offerPercentage || offerPurchaseAmount <= 0 || offerPercentage <= 0) {
      alert("Please provide valid purchase amount (> ₹0) and discount percentage (1-100%).");
      return;
    }
    if (offerPercentage > 100) {
      alert("Discount percentage cannot exceed 100%.");
      return;
    }

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          minAmount: offerPurchaseAmount,
          discountPercentage: offerPercentage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOffers();
      } else {
        alert(data.error || "Failed to create offer");
      }
    } catch (err: any) {
      console.error("Error adding offer:", err);
    }
  };

  const handleDeleteStoreOffer = async (id: string) => {
    if (confirm("Are you sure you want to delete this offer rule?")) {
      try {
        const res = await fetch(`/api/offers/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: adminHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          fetchOffers();
        }
      } catch (err) {
        console.error("Error deleting offer:", err);
      }
    }
  };

  const handleToggleStoreOfferStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/offers/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        fetchOffers();
      }
    } catch (err) {
      console.error("Error toggling offer:", err);
    }
  };

  // Filter products by search, category, and stock
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "ALL") {
        if (p.categorySlug !== selectedCategory && p.category !== selectedCategory) {
          return false;
        }
      }

      if (selectedStockStatus === "IN_STOCK" && p.stockCount <= 0) return false;
      if (selectedStockStatus === "OUT_OF_STOCK" && p.stockCount > 0) return false;

      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = (p.category || "").toLowerCase().includes(q);
        const matchesBrand = (p.brand || "").toLowerCase().includes(q);
        const matchesTag = (p.tag || "").toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesBrand || matchesTag;
      }
      return true;
    });
  }, [products, inventorySearch, selectedCategory, selectedStockStatus]);

  // Handle Delete Product
  const handleDeleteProduct = async (productId: string, productName: string, mongoId?: string) => {
    if (confirm(`Are you sure you want to delete "${productName}" from inventory database?`)) {
      // Optimistically remove from state immediately
      const prevProducts = [...products];
      setProducts((current) =>
        current.filter(
          (p) =>
            p.id !== productId &&
            (p as any)._id !== productId &&
            (!mongoId || (p as any)._id !== mongoId)
        )
      );

      try {
        const queryParam = mongoId ? `?mongoId=${encodeURIComponent(mongoId)}` : "";
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}${queryParam}`, {
          method: "DELETE",
          headers: adminHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          fetchProducts();
          fetchNotifications();
        } else {
          // Revert on server error
          setProducts(prevProducts);
          alert(data.error || "Failed to delete product");
        }
      } catch (err: any) {
        setProducts(prevProducts);
        console.error("Error deleting product:", err);
        alert(err.message || "Network error while deleting product");
      }
    }
  };

  // Upload product images to Cloudinary via backend API
  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadingProductImages(true);
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("folder", "playoedappal/products");

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: adminHeaders(),
          body: formData,
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.urls)) {
          setFormProduct((prev) => ({
            ...prev,
            images: [...prev.images, ...data.urls],
          }));
        } else {
          alert("Image upload error: " + (data.error || "Upload failed"));
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        alert("Upload error: " + err.message);
      } finally {
        setUploadingProductImages(false);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Color Mapping helpers
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

  const handleColorImagesUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("folder", "playoedappal/colors");

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: adminHeaders(),
          body: formData,
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.urls)) {
          setFormProduct((prev) => ({
            ...prev,
            colorMappings: prev.colorMappings.map((m) =>
              m.id === id ? { ...m, images: [...m.images, ...data.urls] } : m
            ),
          }));
        }
      } catch (err) {
        console.error("Color image upload error:", err);
      }
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
      brand: p.brand || (p.specs?.brand || ""),
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

  // Save Add / Edit to MongoDB
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name.trim()) {
      alert("Product name is required.");
      return;
    }

    const pr = Number(formProduct.price);
    if (isNaN(pr) || pr < 0) {
      alert("Please provide a valid price (>= 0).");
      return;
    }

    const st = Number(formProduct.stockCount);
    if (isNaN(st) || st < 0) {
      alert("Please provide a valid stock quantity (>= 0).");
      return;
    }

    setIsSubmittingProduct(true);
    try {
      // Collect all images from main upload and color mappings so none are dropped
      const allCollectedImgs = [...formProduct.images];
      formProduct.colorMappings.forEach((cm) => {
        if (Array.isArray(cm.images)) {
          cm.images.forEach((img) => {
            if (img && !allCollectedImgs.includes(img)) {
              allCollectedImgs.push(img);
            }
          });
        }
      });

      const payload = {
        name: formProduct.name.trim(),
        brand: formProduct.brand.trim() || undefined,
        category: formProduct.category.trim() || "General",
        price: pr,
        stockCount: st,
        scale: formProduct.scale.trim() || undefined,
        material: formProduct.material.trim() || "Diecast Metal with Plastic Parts",
        description: formProduct.description.trim() || undefined,
        tag: formProduct.tag.trim() || undefined,
        availableColors: formProduct.availableColors.trim() || undefined,
        colorMappings: formProduct.colorMappings,
        images: allCollectedImgs.length > 0 ? allCollectedImgs : formProduct.images,
        imageUrl: allCollectedImgs[0] || formProduct.images[0] || "/images/catalog/porsche-drift-rc.jpg",
      };

      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/products/${encodeURIComponent(editingProduct.id)}`, {
          method: "PUT",
          headers: adminHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setEditingProduct(null);
          fetchProducts();
          fetchNotifications();
        } else {
          alert(data.error || "Failed to update product");
        }
      } else {
        // POST create
        const res = await fetch("/api/products", {
          method: "POST",
          headers: adminHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsAddProductOpen(false);
          fetchProducts();
          fetchNotifications();
        } else {
          alert(data.error || "Failed to create product");
        }
      }
    } catch (err: any) {
      console.error("Error saving product:", err);
      alert(err.message || "Failed to save product");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Order status update in MongoDB
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        fetchNotifications();
        fetchBestsellers();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Delete Order in MongoDB
  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Are you sure you want to delete order #${orderId}?`)) {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: "DELETE",
          headers: adminHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          fetchOrders();
          fetchNotifications();
          fetchBestsellers();
        }
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ markAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadNotifCount(0);
      }
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  // Admin Logout Handler
  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out from Playo Admin?")) {
      try {
        await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout" }),
        });
      } catch (e) {
        console.error("Logout error:", e);
      }
      setIsAuthenticated(false);
      router.push("/admin");
    }
  };

  // 1. Session verification loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF9800]/30 border-t-[#FF9800] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Guard - Only verified admin credentials can view dashboard
  if (!isAuthenticated) {
    return <AdminAuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F9FD] text-slate-800 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      {/* 1. MAIN STORE NAVBAR */}
      <Navbar
        activePage="admin"
        cartCount={isMounted ? cartItems.reduce((acc, i) => acc + i.quantity, 0) : 0}
        wishlistCount={isMounted ? wishlistIds.length : 0}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 2. ADMIN DASHBOARD HEADER */}
      <div className="w-full bg-white border-b border-slate-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Admin Dashboard
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 ml-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Live MongoDB Atlas</span>
              </div>

              <button
                type="button"
                onClick={() => setSoundAlert(!soundAlert)}
                className="bg-[#EDFBF4] hover:bg-[#E2F7EB] text-[#16A34A] border border-[#B9F0D2] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Toggle Alert Sounds"
              >
                <span>{soundAlert ? "🔊" : "🔇"}</span>
                <span>Sound: {soundAlert ? "ON" : "OFF"}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceAlerts(!deviceAlerts)}
                className="bg-[#EDFBF4] hover:bg-[#E2F7EB] text-[#16A34A] border border-[#B9F0D2] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Toggle Device Push Alerts"
              >
                <span>🔔</span>
                <span>Alerts: {deviceAlerts ? "ACTIVE" : "PAUSED"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                type="button"
                onClick={handleLogout}
                className="bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <Lock className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Log Out</span>
              </button>

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

          {/* 3. HORIZONTAL TABS */}
          <div className="flex items-center gap-6 sm:gap-8 mt-5 overflow-x-auto no-scrollbar -mb-px">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const hasBadge = tab === "Notifications" && unreadNotifCount > 0;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer relative flex items-center gap-1.5 ${
                    isActive
                      ? "text-[#0284C7]"
                      : "text-slate-500 hover:text-slate-800 font-semibold"
                  }`}
                >
                  <span>{tab}</span>
                  {hasBadge && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                      {unreadNotifCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0284C7] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ========================================================
            TAB 1: INVENTORY (DATABASE BACKED)
           ======================================================== */}
        {activeTab === "Inventory" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-[0_2px_12px_rgba(2,132,199,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#0284C7] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name, category, or brand..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Category Dropdown (dynamically populated from DB categories) */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2 pr-8 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
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

              <div className="self-end md:self-auto">
                <span className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-sky-100/70 shadow-[0_2px_14px_rgba(2,132,199,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#EBF5FB] border-b border-sky-100/90 text-slate-800 font-extrabold">
                    <tr>
                      <th className="py-3.5 px-5 font-bold">Product Name</th>
                      <th className="py-3.5 px-5 font-bold">Brand</th>
                      <th className="py-3.5 px-5 font-bold">Category</th>
                      <th className="py-3.5 px-5 font-bold">Price (₹)</th>
                      <th className="py-3.5 px-5 font-bold">Stock</th>
                      <th className="py-3.5 px-5 font-bold">Tag / Status</th>
                      <th className="py-3.5 px-5 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {isProductsLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="font-bold text-slate-700">Loading products from database...</p>
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#0284C7]" />
                          <p className="font-bold text-slate-700">No products found in database</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Click &quot;+ Add Product&quot; to add your first toy to the database.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-sky-50/20 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                <Image
                                  src={p.imageUrl || "/images/catalog/porsche-drift-rc.jpg"}
                                  alt={p.name}
                                  fill
                                  className="object-contain p-0.5"
                                />
                              </div>
                              <span className="font-bold text-slate-900 block truncate max-w-xs">
                                {p.name}
                              </span>
                            </div>
                          </td>

                          {/* Brand Name (Typed in Admin) */}
                          <td className="py-4 px-5 text-slate-700 font-semibold">
                            {p.brand ? (
                              <span className="text-sky-700 font-bold uppercase text-[11px]">
                                {p.brand}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="py-4 px-5 text-slate-600 font-medium">
                            {p.category || p.categorySlug}
                          </td>

                          <td className="py-4 px-5 font-bold text-slate-900">
                            ₹{p.price.toLocaleString("en-IN")}
                          </td>

                          <td className="py-4 px-5">
                            <span
                              className={`font-black ${
                                p.stockCount > 0
                                  ? p.stockCount < 3
                                    ? "text-amber-600"
                                    : "text-[#16A34A]"
                                  : "text-[#EF4444]"
                              }`}
                            >
                              {p.stockCount} {p.stockCount < 3 && p.stockCount > 0 ? " (Low)" : ""}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-slate-400">
                            {p.tag ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded border border-amber-200">
                                {p.tag}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="px-3 py-1 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] rounded-md font-bold text-xs transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id || String((p as any)._id), p.name, (p as any)._id)}
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
            TAB 2: ORDERS MANAGEMENT (DATABASE BACKED)
           ======================================================== */}
        {activeTab === "Orders" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filters */}
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
                    {isOrdersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="font-bold text-slate-700">Loading orders from database...</p>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No orders placed in database yet.
                        </td>
                      </tr>
                    ) : (
                      orders
                        .filter((o) => {
                          if (orderFilter !== "ALL" && o.status !== orderFilter) return false;
                          if (orderSearch.trim()) {
                            const q = orderSearch.toLowerCase();
                            return (
                              o.id.toLowerCase().includes(q) ||
                              o.customerName.toLowerCase().includes(q) ||
                              o.phone.includes(q)
                            );
                          }
                          return true;
                        })
                        .map((ord) => (
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
                              {ord.items.map((it, i) => (
                                <div key={i} className="text-xs">
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
            TAB 3: CATEGORY MANAGEMENT (DATABASE BACKED)
           ======================================================== */}
        {activeTab === "Category" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  Store Categories ({categories.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Manage categories stored in MongoDB Atlas and populated in the Add Product section
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
                        src={c.imageUrl && !c.imageUrl.startsWith("blob:") ? c.imageUrl : "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80"}
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
                      href={c.href || `/catalog?category=${c.slug}`}
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
            TAB 4: NOTIFICATIONS (LIVE LOW STOCK, OUT OF STOCK & ORDERS)
           ======================================================== */}
        {activeTab === "Notifications" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  Alerts & Activity Stream ({notifications.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Live alerts for low stock (&lt; 3), out of stock (0), and new orders received
                </p>
              </div>
              <button
                type="button"
                onClick={handleMarkAllNotificationsRead}
                className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#0284C7]" />
                  <p className="font-bold text-slate-700">No active alerts</p>
                  <p className="text-xs text-slate-400 mt-0.5">All stock counts are healthy and no pending alerts.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white rounded-2xl border p-4 shadow-2xs flex items-start gap-3.5 transition-all ${
                      n.read ? "border-slate-100 opacity-75" : "border-sky-100/90 ring-1 ring-sky-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        n.title.includes("Out of Stock")
                          ? "bg-rose-50 text-rose-600"
                          : n.type === "order"
                          ? "bg-emerald-50 text-emerald-600"
                          : n.type === "stock"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      {n.title.includes("Out of Stock") ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : n.type === "order" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</h4>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: BEST SELLING (ACTUAL SOLD COUNTS FROM ORDERS)
           ======================================================== */}
        {activeTab === "Best selling" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100/60 shadow-2xs">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Top Selling Toys (Real-World Sales Leaderboard)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated directly from placed customer orders and units sold
              </p>
            </div>

            {isBestsellersLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="font-bold text-slate-700">Calculating top seller sales counts...</p>
              </div>
            ) : bestsellers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#0284C7]" />
                <p className="font-bold text-slate-700">No sales recorded yet</p>
                <p className="text-xs text-slate-400 mt-0.5">When customers order products, they will appear ranked by sold count.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {bestsellers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-sky-100/70 p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-md transition-all"
                  >
                    <span
                      className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? "bg-amber-400 text-slate-900 shadow-sm"
                          : idx === 1
                          ? "bg-slate-200 text-slate-800"
                          : idx === 2
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="relative w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1">
                      <Image
                        src={p.imageUrl || "/images/catalog/porsche-drift-rc.jpg"}
                        alt={p.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {p.category || p.categorySlug}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                          Sold: {p.soldCount || 0} unit(s)
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 6: SPECIAL PURCHASE OFFERS (LOGICAL & DATABASE BACKED)
           ======================================================== */}
        {activeTab === "Offer" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Create Offer Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-500 text-lg shrink-0 mt-0.5">
                  🏷️
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Create Special Purchase Offer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Specify a minimum purchase amount and an offer percentage. When a user buys products of this amount or more, that percentage discount is automatically applied in cart and checkout.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Amount */}
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
                      onChange={(e) => setOfferPurchaseAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {[500, 1000, 1500, 2000, 3000, 5000].map((amt) => {
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

                {/* Offer Percentage */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Offer Percentage (%) *
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Discount percentage (1 - 100%)
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={offerPercentage || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOfferPercentage(Math.min(100, Math.max(1, val)));
                      }}
                      className="w-full pl-4 pr-9 py-2.5 text-xs sm:text-sm font-bold text-slate-800 rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                    <span className="absolute right-3.5 text-xs sm:text-sm font-bold text-slate-400">
                      %
                    </span>
                  </div>
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

              {/* Logical Preview */}
              <div className="p-4 bg-[#F0F9FF] border border-dashed border-[#7DD3FC] rounded-2xl flex items-center gap-3.5">
                <div className="text-2xl shrink-0">🎁</div>
                <div className="text-xs leading-relaxed">
                  <h4 className="font-extrabold text-[#0284C7] text-xs sm:text-sm mb-0.5">
                    Customer Discount Rule Preview (Zero Loophole Math)
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
                    (saving ₹
                    {Math.round(
                      ((offerPurchaseAmount || 0) * (offerPercentage || 0)) / 100
                    ).toLocaleString("en-IN")}{" "}
                    on a ₹{(offerPurchaseAmount || 0).toLocaleString("en-IN")} purchase).
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddStoreOffer}
                  className="bg-[#38BDF8] hover:bg-[#0EA5E9] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>✓</span>
                  <span>Add Offer to Database</span>
                </button>
              </div>
            </div>

            {/* Active Store Offers Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                    Active Store Offers in MongoDB
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stored in database and applied automatically at checkout and cart drawer.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0284C7]">
                  {storeOffers.length} Offers Configured
                </span>
              </div>

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
                    {isOffersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 px-4 text-center text-slate-400">
                          Loading offers from database...
                        </td>
                      </tr>
                    ) : storeOffers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 px-4 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-3xl">🏷️</div>
                            <h4 className="font-bold text-sm text-slate-800">
                              No offers created yet
                            </h4>
                            <p className="text-xs text-slate-400">
                              Use the form above to add an offer rule.
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
          ADD / EDIT PRODUCT MODAL (CLOUDINARY & MONGO BACKED)
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
                {/* 1. Product Images Upload to Cloudinary */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>Product Images (Upload to Cloudinary)</span>
                    {uploadingProductImages && (
                      <span className="text-xs text-sky-600 font-bold flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
                        Uploading to Cloudinary...
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFilesChange}
                      disabled={uploadingProductImages}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1.5 bg-slate-50/60"
                    />
                    <p className="text-xs text-slate-500 font-medium">
                      {formProduct.images.length} image(s) hosted on Cloudinary. First image will be used as the product card thumbnail.
                    </p>

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
                    Product Name *
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

                {/* 3. Brand Name - FIELD TO TYPE BRAND NAME (DROPDOWN REMOVED AS REQUESTED) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Brand Name (Type brand name to show on product) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formProduct.brand}
                    onChange={(e) => setFormProduct({ ...formProduct, brand: e.target.value })}
                    placeholder="e.g. Porsche, Ferrari, CCA, DriftPro, Playo"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This brand name will be displayed above the product title in cards and details.
                  </p>
                </div>

                {/* 4. Category Selection - POPULATED FROM ADMIN CATEGORY SECTION AS REQUESTED */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Category (Select from Category adding section) *
                  </label>
                  <select
                    required
                    value={formProduct.category}
                    onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Category (from Category section)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">
                      No categories yet. Go to the Category tab above to add categories first!
                    </p>
                  )}
                </div>

                {/* 5. Scale & Badge/Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Scale (Optional)
                    </label>
                    <input
                      type="text"
                      value={formProduct.scale}
                      onChange={(e) => setFormProduct({ ...formProduct, scale: e.target.value })}
                      placeholder="e.g. 1:24, 1:18, 1:16"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                  </div>

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
                </div>

                {/* 6. Price (₹) & Stock Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formProduct.price}
                      onChange={(e) => setFormProduct({ ...formProduct, price: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Stock Quantity (Backend Validated) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formProduct.stockCount}
                      onChange={(e) => setFormProduct({ ...formProduct, stockCount: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Stock &lt; 3 triggers automatic showroom low stock alert.
                    </p>
                  </div>
                </div>

                {/* 7. Available Colors */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Available Colors (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formProduct.availableColors}
                    onChange={(e) => setFormProduct({ ...formProduct, availableColors: e.target.value })}
                    placeholder="e.g. Red, Blue, Matte Black, Violet"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>

                {/* 8. Color Images Mapping */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Color Images Mapping (Optional Cloudinary uploads)
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
                              onChange={(e) => handleUpdateColorName(mapping.id, e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-sky-100 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Upload Color Images (Cloudinary)
                            </label>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleColorImagesUpload(mapping.id, e)}
                              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-bold file:bg-white file:text-[#0284C7] hover:file:bg-sky-50 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1 bg-white"
                            />
                            {mapping.images.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap pt-2">
                                {mapping.images.map((imgUrl, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className="relative w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs group"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt="Color preview"
                                      className="w-full h-full object-contain"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColorImage(mapping.id, imgIdx)}
                                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] leading-none opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
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

                {/* 9. Material */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formProduct.material}
                    onChange={(e) => setFormProduct({ ...formProduct, material: e.target.value })}
                    placeholder="Diecast Metal with Plastic Parts"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>

                {/* 10. Product Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Product Description (Shown in Product Details Page)
                  </label>
                  <textarea
                    rows={4}
                    value={formProduct.description}
                    onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                    placeholder="Enter detailed custom description for this product..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-y"
                  />
                </div>
              </div>

              {/* Footer */}
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
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmittingProduct
                    ? "Saving to Database..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD CATEGORY MODAL (CLOUDINARY & MONGO BACKED)
         ======================================================== */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
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

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formCategory.name}
                  onChange={(e) => setFormCategory({ ...formCategory, name: e.target.value })}
                  placeholder="e.g. Electric Ride-ons, RC Cars, Scooters"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Upload Category Image (Cloudinary)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1.5 bg-slate-50/60"
                />
                {formCategory.imageUrl && (
                  <div className="mt-3 relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                    <img
                      src={formCategory.imageUrl}
                      alt="Category Preview"
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormCategory((prev) => ({ ...prev, imageUrl: "" }));
                        setCategoryImageFile(null);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

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
                  disabled={isUploadingCatImage}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isUploadingCatImage ? "Uploading..." : "Add Category"}
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
