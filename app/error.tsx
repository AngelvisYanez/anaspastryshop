"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-accent font-bold text-xs uppercase tracking-widest mb-4">Error inesperado</p>
        <h1 className="font-display text-4xl font-black text-foreground mb-4">Algo salió mal</h1>
        <p className="text-muted mb-8">
          Ocurrió un error inesperado. Por favor intenta de nuevo o regresa al inicio.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-foreground text-background px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            Intentar de nuevo
          </button>
          <Link href="/" className="bg-card border border-card-border px-6 py-3 rounded-xl font-bold text-sm text-foreground hover:bg-card-hover transition-all">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
