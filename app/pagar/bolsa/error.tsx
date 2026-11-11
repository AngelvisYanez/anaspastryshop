"use client";

import Link from "next/link";

export default function BolsaError({ retry }: { retry: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">No pudimos cargar tu bolsa</h1>
        <p className="mt-3 text-neutral-600">
          El servicio de cursos no está disponible en este momento. Intenta cargarla de nuevo en unos minutos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-lg bg-black px-5 py-3 font-medium text-white"
          >
            Intentar de nuevo
          </button>
          <Link href="/cursos" className="rounded-lg border border-neutral-300 px-5 py-3 font-medium">
            Ver cursos
          </Link>
        </div>
      </div>
    </main>
  );
}
