"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CategoryItem } from "../data/store-data";

interface CategorySectionProps {
  categories?: CategoryItem[];
  onSelectCategory: (categorySlug: string) => void;
}

export default function CategorySection({
  categories: initialCategories,
  onSelectCategory,
}: CategorySectionProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories || []);

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
      .catch((err) => console.error("Error fetching categories for CategorySection:", err));
  }, [initialCategories]);

  return (
    <section id="categories" className="py-10 sm:py-16 bg-[#FFFFFF] border-b border-gray-100" aria-label="Shop by Category">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight">
              Find their next favourite
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Top curated categories for endless smiles & adventures
            </p>
          </div>

          <button
            onClick={() => onSelectCategory("all")}
            type="button"
            className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FF9800] flex items-center gap-1 transition-colors group shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF9800]"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Category Cards Grid from DB */}
        {categories.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm font-bold text-gray-600">No categories added yet</p>
            <p className="text-xs text-gray-400 mt-1">Categories added in the Admin Dashboard will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className="group text-left w-full h-full cursor-pointer rounded-2xl overflow-hidden border border-gray-100/90 bg-[#FFFFFF] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-[#FF9800] focus-visible:outline-none"
                aria-label={`Shop ${cat.name}`}
              >
                {/* Category Image Container */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#F5F7FA] flex items-center justify-center p-3 sm:p-4">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-contain p-2.5 group-hover:scale-108 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Bottom Label Bar */}
                <div className="p-3 sm:p-4 flex items-center justify-between bg-white border-t border-gray-50/80 flex-1">
                  <h3 className="text-xs sm:text-sm md:text-[15px] font-bold text-[#0D1B2A] group-hover:text-[#FF9800] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#FF9800] group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
