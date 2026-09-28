"use client";

import { useEffect } from "react";
import { Button } from "@nextui-org/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center text-danger">
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
      <h2 className="text-xl font-bold text-foreground mb-2">
        Terjadi Kesalahan
      </h2>
      <p className="text-sm text-default-500 mb-6 max-w-md">
        {error?.message || "Terjadi kendala saat memuat halaman."}
      </p>
      <Button
        color="primary"
        variant="flat"
        onPress={() => reset()}
      >
        Coba Lagi
      </Button>
    </div>
  );
}
