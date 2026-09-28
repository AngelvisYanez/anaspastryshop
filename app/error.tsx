"use client";

import { useEffect } from "react";
import Image from "next/image";
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
        <div className="relative h-12 w-40 mx-auto mb-8">
          <Image
            src="/logo-anas-pastry-shop.png"
            alt="Ana's Pastry Shop"
            fill
            sizes="160px"
            className="object-contain"
          />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
          Algo salió mal
        </h1>
        <p className="text-muted mb-8 text-sm sm:text-base leading-relaxed">
          Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-accent-solid text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-solid-hover transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="bg-card border border-card-border px-6 py-3 rounded-xl font-bold text-sm text-foreground hover:bg-card-hover transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
