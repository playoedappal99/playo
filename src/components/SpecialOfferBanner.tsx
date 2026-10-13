"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function SpecialOfferBanner({ onShopNow }: { onShopNow: () => void }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 26,
    seconds: 37,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 2, hours: 14, minutes: 26, seconds: 37 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#0d1722] text-white shadow-xl min-h-[280px] sm:min-h-[320px] flex items-center">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80"
              alt="Electric Jeeps & Trail Bikes Offer"
              fill
              className="object-cover object-right sm:object-center brightness-[0.45]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1722] via-[#0d1722]/85 to-transparent w-full sm:w-3/4" />
          </div>

          <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left Texts */}
            <div className="space-y-3 sm:space-y-4 max-w-lg">
              <span className="text-[11px] sm:text-xs font-black tracking-wider text-orange-500 uppercase">
                ELECTRIC JEEPS & TRAIL BIKES
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Up to <span className="text-orange-500">35% off</span> <br />
                electric rides
              </h2>

              <p className="text-xs sm:text-sm text-gray-300">
                Big power. Bigger smiles.
              </p>

              <div className="pt-2">
                <button
                  onClick={onShopNow}
                  className="px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Shop now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Countdown Box */}
            <div className="flex flex-col items-start lg:items-end gap-3 self-stretch lg:self-center">
              {/* Limited time offer tag */}
              <span className="px-3 py-1 rounded-full text-[11px] font-bold text-orange-400 bg-orange-950/70 border border-orange-800/60">
                Limited time offer
              </span>

              {/* 4 Timer Boxes */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Days */}
                <div className="flex flex-col items-center bg-[#07101a]/90 border border-white/10 rounded-xl p-2 sm:p-2.5 min-w-[52px] sm:min-w-[58px]">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">Days</span>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center bg-[#07101a]/90 border border-white/10 rounded-xl p-2 sm:p-2.5 min-w-[52px] sm:min-w-[58px]">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">Hours</span>
                </div>

                {/* Mins */}
                <div className="flex flex-col items-center bg-[#07101a]/90 border border-white/10 rounded-xl p-2 sm:p-2.5 min-w-[52px] sm:min-w-[58px]">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">Mins</span>
                </div>

                {/* Secs */}
                <div className="flex flex-col items-center bg-[#07101a]/90 border border-white/10 rounded-xl p-2 sm:p-2.5 min-w-[52px] sm:min-w-[58px]">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
