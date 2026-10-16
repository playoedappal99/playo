"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 font-sans">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 max-w-md mb-6">
            A critical error occurred while loading the application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#132c4a] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
