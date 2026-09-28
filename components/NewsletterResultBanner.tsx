"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export type NewsletterSendResult = {
  sent?: number;
  failed?: number;
  error?: string;
};

export function NewsletterResultBanner({ result }: { result: NewsletterSendResult | null }) {
  if (!result) return null;

  return (
    <div
      className={`mt-4 rounded-lg p-3 flex items-start gap-3 ${
        result.error
          ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
          : "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
      }`}
    >
      {result.error ? (
        <>
          <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400">{result.error}</p>
        </>
      ) : (
        <>
          <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm font-bold text-green-700 dark:text-green-400">
            Enviado: {result.sent} exitosos, {result.failed} fallidos.
          </p>
        </>
      )}
    </div>
  );
}