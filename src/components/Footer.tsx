"use client";

import React from "react";
import { Phone, Mail, MapPin, Heart } from "lucide-react";

export default function Footer({
  onSelectCategory,
}: {
  onSelectCategory: (categorySlug: string) => void;
}) {
  return (
    <footer className="bg-[#0b1b2b] text-white pt-14 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-gray-800/80">
          {/* Col 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col items-start select-none">
              <div className="flex items-center tracking-tight">
                <span className="text-2xl font-black text-white tracking-wider">
                  PLAYO
                </span>
                <span className="w-2 h-2 rounded-full bg-orange-500 ml-0.5 -mt-3 animate-pulse" />
              </div>
              <div className="flex items-center gap-1 w-28 justify-between">
                <span className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">
                  EDAPPAL
                </span>
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-orange-400" />
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Toys for a brighter tomorrow.
            </p>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Playo Edappal is your trusted toy shop in Kerala, bringing smiles, imagination and joy to every child.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-gray-700 hover:border-gray-500 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold">f</span>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-gray-700 hover:border-gray-500 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold">ig</span>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-gray-700 hover:border-gray-500 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold">yt</span>
              </a>
            </div>
          </div>

          {/* Col 2: Shop by Category (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4">
              Shop by Category
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onSelectCategory("ride-ons")}
                  className="hover:text-white transition-colors"
                >
                  Electric Ride-ons
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("rc-cars")}
                  className="hover:text-white transition-colors"
                >
                  RC Cars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("scooters")}
                  className="hover:text-white transition-colors"
                >
                  Scooters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("dolls")}
                  className="hover:text-white transition-colors"
                >
                  Dolls & Pretend Play
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("soft-toys")}
                  className="hover:text-white transition-colors"
                >
                  Soft Toys
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("learning")}
                  className="hover:text-white transition-colors"
                >
                  Creative & Learning
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("all")}
                  className="hover:text-white transition-colors"
                >
                  Outdoor & Sports
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("all")}
                  className="hover:text-white transition-colors"
                >
                  More
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care (2.5 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Shipping & Delivery</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Warranty</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Return & Refund</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Get in Touch (3.5 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <a href="tel:+919072345678" className="hover:text-white">
                  +91 9072 345 678
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <a href="mailto:playoedappal@gmail.com" className="hover:text-white">
                  playoedappal@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Edappal, Malappuram <br />
                  Kerala - 679541
                </span>
              </li>
            </ul>

            <div className="pt-3">
              <p className="text-sm italic font-serif text-gray-300 flex items-center gap-1.5 tracking-wide">
                <span>Play • Learn • Grow</span>
                <Heart className="w-3.5 h-3.5 text-orange-500 fill-current inline" />
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2025 Playo Edappal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> in Kerala
          </p>
        </div>
      </div>
    </footer>
  );
}
