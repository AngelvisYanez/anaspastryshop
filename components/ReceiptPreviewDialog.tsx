"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";

export function ReceiptPreviewDialog({
  url,
  open,
  onClose,
}: {
  url: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setZoom(1);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open || !url) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Cerrar vista del comprobante"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full sm:w-[min(100%-2rem,56rem)] h-[100dvh] sm:h-auto sm:max-h-[min(92dvh,56rem)] flex-col bg-card sm:rounded-2xl rounded-t-2xl border-0 sm:border border-card-border shadow-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-card-border shrink-0 bg-card">
          <div className="min-w-0">
            <p
              id={titleId}
              className="text-sm font-black text-foreground uppercase tracking-wider truncate"
            >
              Comprobante de pago
            </p>
            <p className="text-[11px] text-muted font-medium mt-0.5 hidden sm:block">
              Revisa la captura antes de aprobar o rechazar el pago
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
              disabled={zoom <= 0.75}
              className="min-h-10 min-w-10 grid place-items-center rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-colors disabled:opacity-40"
              aria-label="Alejar"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-[11px] font-bold text-muted w-10 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
              disabled={zoom >= 2.5}
              className="min-h-10 min-w-10 grid place-items-center rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-colors disabled:opacity-40"
              aria-label="Acercar"
              title="Acercar"
            >
              <ZoomIn size={18} />
            </button>
            <a
              href={url}
              download="comprobante"
              className="min-h-10 min-w-10 grid place-items-center rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-colors"
              aria-label="Descargar comprobante"
              title="Descargar"
            >
              <Download size={18} />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="min-h-10 min-w-10 grid place-items-center rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-auto overscroll-contain bg-section-alt touch-pan-x touch-pan-y">
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Comprobante de pago"
              className="max-w-none origin-center transition-transform duration-150 select-none rounded-lg shadow-md"
              style={{
                width: `${zoom * 100}%`,
                maxWidth: zoom === 1 ? "100%" : "none",
                height: "auto",
              }}
              draggable={false}
            />
          </div>
        </div>

        <footer className="sm:hidden flex items-center justify-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-card-border shrink-0 bg-card">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-11 rounded-xl bg-accent-solid text-white text-xs font-black uppercase tracking-wider hover:bg-accent-solid-hover transition-colors"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
