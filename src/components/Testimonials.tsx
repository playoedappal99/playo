"use client";

import React from "react";
import Image from "next/image";
import { Star, ArrowRight, MapPin } from "lucide-react";
import { TESTIMONIALS_DATA } from "../data/store-data";

export default function Testimonials() {
  return (
    <section id="reviews" className="py-12 sm:py-16 bg-[#FFFFFF] border-b border-gray-100" aria-label="Customer Reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight">
              What our happy customers say
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Real experiences from families across Kerala
            </p>
          </div>

          <a
            href="#reviews"
            className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FF9800] flex items-center gap-1 transition-colors group shrink-0 focus-visible:outline-2 focus-visible:outline-[#FF9800]"
          >
            <span>View all reviews</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS_DATA.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F5F7FA] rounded-2xl p-6 border border-gray-200/70 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                {/* Avatar & Stars */}
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-white shadow-xs">
                    <Image
                      src={rev.avatarUrl}
                      alt={rev.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="flex text-[#FF9800]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author & Location */}
              <div className="mt-5 pt-3.5 border-t border-gray-200/80">
                <p className="text-xs font-bold text-[#0D1B2A]">— {rev.name}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>{rev.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
