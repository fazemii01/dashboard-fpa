"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-gray-50 text-gray-900 font-sans">
        <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan Fatal</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-md">
          {error?.message || "Terjadi kendala pada sistem."}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Muat Ulang
        </button>
      </body>
    </html>
  );
}
