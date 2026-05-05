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
    <div className="min-h-[50vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-accent font-bold text-xs uppercase tracking-widest mb-4">Error del panel</p>
        <h2 className="font-display text-3xl font-black text-foreground mb-4">Algo salió mal</h2>
        <p className="text-muted mb-8">No pudimos cargar esta sección del panel. Intenta de nuevo.</p>
        <button
          onClick={reset}
          className="bg-foreground text-background px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
