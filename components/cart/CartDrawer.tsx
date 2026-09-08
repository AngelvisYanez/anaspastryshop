"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { items, isOpen, total, closeCart, removeItem, clearBag } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const itemsQuery = items.map((i) => i.id).join(",");

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer (slides from the right) */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md bg-card border-l border-card-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Bolsa de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="font-display font-black text-foreground leading-tight">Tu Bolsa</p>
              <p className="text-[11px] text-muted font-medium">
                {items.length === 0
                  ? "Aún vacía"
                  : `${items.length} ${items.length === 1 ? "formación" : "formaciones"}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-colors"
            aria-label="Cerrar bolsa"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
            <div className="w-16 h-16 rounded-3xl bg-section-alt flex items-center justify-center">
              <ShoppingBag size={28} className="text-muted" />
            </div>
            <p className="font-display font-bold text-foreground">
              Tu bolsa está vacía
            </p>
            <p className="text-xs text-muted font-medium max-w-[240px]">
              Añade cursos online o workshops presenciales desde el catálogo de formaciones.
            </p>
            <Link
              href="/cursos"
              onClick={closeCart}
              className="mt-2 bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-pink-600/20"
            >
              Explorar Formaciones
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl border border-card-border bg-background/50 p-3"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted/20 shrink-0">
                  <Image
                    src={item.image || "/foto-1.webp"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent block mb-0.5">
                    {item.isWorkshop ? "Workshop Presencial" : "Curso Online"}
                  </span>
                  <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-sm font-black text-foreground font-mono mt-1">
                    ${item.price} USD
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-center p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label={`Quitar ${item.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-card-border space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-muted block">
                  Total a Pagar
                </span>
                <p className="text-2xl font-black text-accent tracking-tight font-mono">
                  ${total} USD
                </p>
              </div>
              <button
                onClick={clearBag}
                className="text-[11px] font-bold text-muted hover:text-red-500 transition-colors"
              >
                Vaciar Bolsa
              </button>
            </div>

            <Link
              href={`/pagar/bolsa?items=${encodeURIComponent(itemsQuery)}`}
              onClick={closeCart}
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition-all hover:shadow-pink-600/40"
            >
              Finalizar Compra <ArrowRight size={16} />
            </Link>

            <button
              onClick={closeCart}
              className="w-full bg-card border border-card-border text-foreground hover:bg-card-hover py-3 rounded-xl text-xs font-bold transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}