"use client";
import Link from "next/link";
import { m } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Navbar />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/[0.07] blur-[130px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-foreground/[0.04] blur-[110px] rounded-full" />

      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-xl"
      >
        <p className="font-display text-[10rem] md:text-[14rem] font-black leading-none tracking-tight text-foreground/[0.04] select-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -z-10 pointer-events-none">
          404
        </p>

        <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-6 block">
          Página no encontrada
        </span>

        <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-[0.9]">
          Esta ruta no{" "}
          <span className="text-accent italic">existe.</span>
        </h2>

        <p className="text-lg text-muted mb-12 leading-relaxed max-w-md mx-auto">
          El enlace que buscas no está disponible. Vuelve al inicio o explora
          nuestro catálogo de talleres.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <button className="bg-foreground text-background px-10 py-5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg">
              <Home size={18} /> Volver al Inicio
            </button>
          </Link>

          <Link href="/cursos">
            <button className="bg-card text-foreground px-10 py-5 rounded-xl font-bold border border-card-border hover:bg-card-hover transition-all flex items-center gap-2">
              Ver Talleres <ArrowRight size={18} className="text-accent" />
            </button>
          </Link>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-24 flex items-center justify-center gap-3 text-muted text-xs font-bold uppercase tracking-[0.25em] z-10"
      >
        <div className="w-8 h-px bg-card-border" />
        Error 404 · Ana&apos;s Pastry Shop
        <div className="w-8 h-px bg-card-border" />
      </m.div>
    </main>
  );
}
