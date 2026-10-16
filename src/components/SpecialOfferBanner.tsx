"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";

export default function SpecialOfferBanner({ onShopNow }: { onShopNow: () => void }) {
  return (
    <section className="py-8 sm:py-12 bg-white" aria-label="Special Promotional Offer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#0D1B2A] text-white shadow-xl min-h-[290px] sm:min-h-[330px] flex items-center">
          
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80"
              alt="Electric Jeeps & Trail Bikes Promotional Offer"
              fill
              className="object-cover object-right sm:object-center brightness-[0.35]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent w-full sm:w-4/5" />
          </div>

          <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Column: Offer Headline, Supporting sentence, and Shop Now CTA */}
            <div className="space-y-3 sm:space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9800]/20 border border-[#FF9800]/40 text-[#FF9800] text-[11px] sm:text-xs font-bold tracking-wider uppercase">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Electric Jeeps & Trail Bikes</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight leading-tight">
                Up to <span className="text-[#FF9800]">35% off</span> <br />
                electric rides
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                Big power. Bigger smiles. Equipped with parent remote controls, rechargeable 12V dual motors, and certified safety.
              </p>

              <div className="pt-2">
                <button
                  onClick={onShopNow}
                  type="button"
                  className="px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-[#FF9800] hover:bg-[#F57C00] shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Shop Electric Rides</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Genuine Showroom Guarantee & Perks Card (No fake countdown) */}
            <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-3 self-stretch lg:self-center">
              <div className="w-full sm:w-auto bg-[#071320]/85 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-200 border-b border-white/10 pb-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Edappal Showroom Direct Offer</span>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#FF9800] shrink-0" />
                    <span>Free Doorstep Delivery in Kerala</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>1-Year Official Motor & Battery Warranty</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#FFE600] shrink-0" />
                    <span>Free Pre-Assembly & Safety Check</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
