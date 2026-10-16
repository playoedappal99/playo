import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <span className="text-6xl font-black text-amber-500 mb-2">404</span>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        The page or resource you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#132c4a] hover:bg-[#1a385c] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all shadow-xs"
      >
        <Home className="w-4 h-4" />
        <span>Return to Store Home</span>
      </Link>
    </div>
  );
}
