"use client";

import React from "react";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function WhatsAppHelpStrip() {
  return (
    <section className="py-6 sm:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#e8f7ee] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#c3edd1]">
          {/* Left Info */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-[#25d366] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                Need help? Chat with us on WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Quick replies • Product guidance • Order support
              </p>
            </div>
          </div>

          {/* Right Button */}
          <a
            href="https://wa.me/919072345678?text=Hi%20Playo%20Edappal,%20I%20need%20help%20with%20toys%20and%20ride-ons"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#16a34a] hover:bg-[#15803d] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>Chat on WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
