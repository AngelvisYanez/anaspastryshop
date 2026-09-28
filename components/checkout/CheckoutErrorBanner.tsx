"use client";

import { AlertCircle } from "lucide-react";

export function CheckoutErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100 dark:border-red-800 flex items-center justify-center gap-2"
    >
      <AlertCircle size={16} className="shrink-0" />
      <span>{error}</span>
    </div>
  );
}
