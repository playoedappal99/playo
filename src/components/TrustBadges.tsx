"use client";

import React from "react";
import { Store, ShieldCheck, Truck, Smile } from "lucide-react";

export default function TrustBadges() {
  const features = [
    {
      icon: Store,
      title: "Edappal Physical Showroom",
      desc: "Visit our grand store in Edappal. Let your kids test-drive and pick their favorite ride-on!",
      accent: "from-amber-500 to-orange-500",
    },
    {
      icon: ShieldCheck,
      title: "6-Month Battery Warranty",
      desc: "Every electric bike, scooter, and jeep includes a store warranty with authentic replacement parts.",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      icon: Truck,
      title: "Fast Kerala Delivery",
      desc: "Doorstep delivery across Malappuram, Thrissur, Palakkad and all Kerala locations with safe packaging.",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      icon: Smile,
      title: "100% Non-Toxic & BIS Safe",
      desc: "All toys, plush teddy bears, and diecasts undergo strict safety checks with zero sharp plastic edges.",
      accent: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div 
                key={idx} 
                className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50/70 hover:bg-amber-50/50 transition-colors border border-gray-100"
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${feat.accent} text-white shadow-md shrink-0`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
