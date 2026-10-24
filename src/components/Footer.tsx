"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Heart, ShieldCheck } from "lucide-react";

export default function Footer({
  onSelectCategory,
  categories: initialCategories,
}: {
  onSelectCategory?: (categorySlug: string) => void;
  categories?: { id?: string; _id?: string; name: string; slug: string }[];
}) {
  const [categories, setCategories] = useState<{ id?: string; _id?: string; name: string; slug: string }[]>(initialCategories || []);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      return;
    }
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Error fetching categories for footer:", err));
  }, [initialCategories]);

  const handleCatClick = (slug: string, e: React.MouseEvent) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(slug);
    }
  };

  return (
    <footer id="footer" className="bg-[#0D1B2A] text-white pt-14 pb-10 border-t border-[#1b2d42] scroll-mt-10" aria-label="Store Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link 
              href="/"
              className="inline-block select-none"
              aria-label="Playo Home"
            >
              <div className="relative h-12 w-auto flex items-center">
                <Image
                  src="/images/playo-logo.png"
                  alt="Playo Logo"
                  width={150}
                  height={62}
                  className="h-11 w-auto object-contain brightness-110 drop-shadow-md"
                />
              </div>
            </Link>

            <p className="text-xs text-gray-300 font-medium">
              Toys for a brighter tomorrow. Bringing smiles to children across Kerala.
            </p>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Playo Edappal is your trusted destination for kids&apos; electric ride-on cars, mini balance bikes, LED scooters, and collectible diecast models.
            </p>

            {/* Social Icons with Accessible SVGs */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Playo on Facebook"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF9800] hover:text-[#FF9800] flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Playo on Instagram"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF9800] hover:text-[#FF9800] flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Subscribe to Playo on YouTube"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF9800] hover:text-[#FF9800] flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Shop by Category (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4">
              Shop by Category
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              {categories.length > 0 ? (
                categories.slice(0, 8).map((cat) => (
                  <li key={cat.id || cat._id || cat.slug}>
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      onClick={(e) => handleCatClick(cat.slug, e)}
                      className="hover:text-[#FF9800] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/catalog"
                    className="hover:text-[#FF9800] transition-colors"
                  >
                    View All Categories
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Customer Care (2.5 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-3 sm:mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/my-orders" className="text-[#FF9800] hover:underline font-semibold transition-colors flex items-center gap-1">
                  <span>Track My Order</span>
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FF9800] transition-colors">
                  Contact &amp; Directions
                </Link>
              </li>
              <li>
                <Link href="/toy-shop-edappal" className="hover:text-[#FF9800] transition-colors">
                  Showroom Guide
                </Link>
              </li>
              <li>
                <a href="https://wa.me/919605973308?text=Hi%20Playo%20Edappal,%20I%20have%20an%20enquiry" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-[#FF9800] transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <a href="https://wa.me/919072345678" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Support
                </a>
              </li>
              <li>
                <span className="text-gray-400 block pt-1">Doorstep delivery across Kerala</span>
              </li>
              <li>
                <span className="text-gray-400 block">7-day replacement guarantee</span>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[11px] text-gray-400">
              <p>✓ Free doorstep delivery</p>
              <p>✓ 7-day replacement guarantee</p>
            </div>
          </div>

          {/* Col 4: Get in Touch & Showroom Details (3.5 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4">
              Visit or Contact Store
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF9800] shrink-0" />
                <a href="tel:+919605973308" className="hover:text-white transition-colors font-medium">
                  +91 96059 73308
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF9800] shrink-0" />
                <a href="mailto:playoedappal@gmail.com" className="hover:text-white transition-colors">
                  playoedappal@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  PLAYO Toys &amp; Ride-Ons Showroom <br />
                  Near Nesto Hypermarket, Edappal <br />
                  Malappuram District, Kerala — 679576
                </span>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-gray-400 space-y-1">
              <p className="text-gray-300 font-semibold">Store Timings:</p>
              <p>Mon – Sun: 9:30 AM – 10:30 PM</p>
              <p className="text-emerald-400 font-medium">Open all 7 days (No weekly holiday)</p>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Verified Local Toy Dealer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© 2026 PlayoToys Edappal. All rights reserved.</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <Link href="/privacy-policy" className="hover:text-gray-200 transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms-and-conditions" className="hover:text-gray-200 transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <p className="flex items-center gap-1.5">
            <span>Play • Learn • Grow with</span>
            <Heart className="w-3.5 h-3.5 text-[#FF9800] fill-current inline" />
            <span>in Kerala</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
