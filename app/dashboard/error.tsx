"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-md">
        <p className="text-accent font-bold text-xs uppercase tracking-widest mb-3 sm:mb-4">Error del panel</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-3 sm:mb-4">Algo salió mal</h2>
        <p className="text-sm sm:text-base text-muted mb-6 sm:mb-8">No pudimos cargar esta sección del panel. Intenta de nuevo.</p>
        <button
          onClick={reset}
          className="bg-foreground text-background w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
