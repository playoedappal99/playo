import React from "react";

export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans animate-pulse">
      {/* Top Navbar Placeholder */}
      <div className="h-16 w-full border-b border-gray-100 bg-white sticky top-0 z-30" />

      {/* Hero / Filter Bar Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 bg-slate-100 rounded-xl shrink-0" />
          ))}
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-2.5 sm:p-4 space-y-3"
            >
              <div className="aspect-[4/3] w-full bg-slate-100 rounded-lg" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-16 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
