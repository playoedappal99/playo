import React from "react";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans animate-pulse">
      <div className="h-20 w-full border-b border-gray-100 bg-white sticky top-0 z-50" />
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-slate-200 rounded-md" />
          <div className="h-6 w-48 bg-emerald-50 rounded-full" />
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="h-6 w-40 bg-slate-200 rounded-md" />
          <div className="h-24 w-full bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
          <div className="h-12 w-full bg-sky-200 rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
