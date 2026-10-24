"use client";

import React from "react";
import { ShieldCheck, Truck, Shield, RotateCcw, Headphones } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheck,
      title: "100% Original",
      desc: "Trusted brands & quality",
    },
    {
      icon: Truck,
      title: "Doorstep Delivery",
      desc: "Fast & safe across Kerala",
    },
    {
      icon: Shield,
      title: "Safe Payments",
      desc: "Multiple payment options",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      desc: "Within 7 Days",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      desc: "We're here to help",
    },
  ];

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Store Guarantees and Trust Badges">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pill Container */}
        <div className="w-full bg-white rounded-2xl lg:rounded-full border border-gray-200/90 shadow-xs px-6 sm:px-8 lg:px-10 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:items-center lg:justify-between gap-5 sm:gap-6 lg:gap-4">
            {badges.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3 select-none">
                  <div className="shrink-0 text-slate-800">
                    <IconComp className="w-5 h-5 text-slate-800 stroke-[1.8]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-bold text-gray-900 leading-snug">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-gray-500 leading-snug">
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
