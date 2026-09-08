import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pago Confirmado | Ana's Pastry Shop",
  description: "Tu pago fue procesado exitosamente. Te damos la bienvenida a Ana's Pastry Shop.",
  robots: { index: false, follow: false },
};

async function ConfirmacionContent({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;

  return (
    <main id="main-content" className="min-h-screen bg-background flex items-center justify-center p-6 pt-28 pb-16">
      <div className="bg-card border border-card-border rounded-2xl p-12 max-w-lg w-full text-center shadow-[var(--shadow-card)]">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="text-green-500" size={40} />
        </div>

        <h1 className="font-display text-3xl font-black text-foreground mb-4 tracking-tight leading-tight">
          {type === "online" ? "¡Pago Exitoso!" : "¡Cupo Reservado!"}
        </h1>

        <p className="text-muted text-sm mb-10 leading-relaxed max-w-sm mx-auto">
          {type === "online"
            ? "Tu acceso al curso ya está activo. Disfruta de las clases en video paso a paso."
            : "Tu comprobante ha sido registrado. Recuerda revisar las condiciones del taller y llegar puntual a las 9:00 AM."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
          >
            Ir a mi Panel <ArrowRight size={16} />
          </Link>
          <Link
            href="/cursos"
            className="bg-card border border-card-border text-foreground px-8 py-4 rounded-xl font-bold hover:bg-card-hover transition-all inline-flex items-center justify-center gap-2"
          >
            <BookOpen size={16} /> Ver Talleres
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ConfirmacionContent searchParams={searchParams} />
    </Suspense>
  );
}
