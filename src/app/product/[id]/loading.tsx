import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans animate-pulse">
      {/* Top Navbar Skeleton Placeholder */}
      <div className="h-16 w-full border-b border-gray-100 bg-white/80 sticky top-0 z-30" />

      {/* Main Product Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-12 bg-slate-200 rounded-sm" />
          <div className="h-3 w-3 bg-slate-200 rounded-sm" />
          <div className="h-3 w-16 bg-slate-200 rounded-sm" />
          <div className="h-3 w-3 bg-slate-200 rounded-sm" />
          <div className="h-3 w-28 bg-slate-200 rounded-sm" />
        </div>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2.5 order-2 sm:order-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-100 shrink-0 border border-slate-200/80"
                />
              ))}
            </div>

            {/* Main Hero Image */}
            <div className="flex-1 aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-3xl bg-slate-100 border border-slate-200/80 order-1 sm:order-2 flex items-center justify-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-slate-200/70" />
            </div>
          </div>

          {/* Right Column: Product Meta, Price & Actions Skeleton */}
          <div className="lg:col-span-5 space-y-5">
            {/* Tag & Category */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-sky-100 rounded-md" />
              <div className="h-5 w-24 bg-slate-100 rounded-md" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="h-7 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-7 w-1/2 bg-slate-200 rounded-lg" />
            </div>

            {/* Rating / Stock Badge */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-24 bg-slate-200 rounded-md" />
              <div className="h-4 w-20 bg-emerald-100 rounded-md" />
            </div>

            {/* Price Row */}
            <div className="pt-2 pb-3 border-y border-gray-100 flex items-baseline gap-3">
              <div className="h-9 w-28 bg-slate-200 rounded-lg" />
              <div className="h-5 w-20 bg-slate-100 rounded-md" />
              <div className="h-5 w-16 bg-emerald-100 rounded-md" />
            </div>

            {/* Color variants skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-16 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Delivery fee info */}
            <div className="h-10 w-full bg-slate-50 border border-slate-100 rounded-xl" />

            {/* Action Buttons Skeleton */}
            <div className="pt-3 space-y-3">
              <div className="h-12 w-full bg-slate-900/10 rounded-2xl" />
              <div className="h-12 w-full bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
