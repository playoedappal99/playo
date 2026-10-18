"use client";

import React from "react";
import { ProductItem } from "@/data/store-data";
import CheckoutSection from "./CheckoutSection";

interface BuyNowModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export default function BuyNowModal({ product, onClose }: BuyNowModalProps) {
  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckoutSection 
          product={product} 
          onClose={onClose} 
          isModal={true} 
        />
      </div>
    </div>
  );
}
