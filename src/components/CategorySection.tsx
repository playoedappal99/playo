"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CATEGORIES_DATA } from "../data/store-data";

interface CategorySectionProps {
  onSelectCategory: (categorySlug: string) => void;
}

export default function CategorySection({ onSelectCategory }: CategorySectionProps) {
  return (
    <section id="categories" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0b1b2b] tracking-tight">
              Find their next favourite
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Top categories for endless smiles
            </p>
          </div>

          <button
            onClick={() => onSelectCategory("all")}
            className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1 transition-colors group shrink-0"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Category Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Bottom Label Bar */}
              <div className="p-4 sm:p-4.5 flex items-center justify-between bg-white border-t border-gray-50">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
