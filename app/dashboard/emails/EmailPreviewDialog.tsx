"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Monitor, Smartphone, X } from "lucide-react";

type Viewport = "desktop" | "mobile";

export function EmailPreviewDialog({
  open,
  onClose,
  loading,
  subject,
  html,
  error,
  templateLabel,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  subject: string | null;
  html: string | null;
  error: string | null;
  templateLabel: string;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setViewport("desktop");
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

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Cerrar previsualización"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full sm:w-[min(100%-2rem,56rem)] h-[100dvh] sm:h-auto sm:max-h-[min(92dvh,52rem)] flex-col bg-card sm:rounded-2xl rounded-t-2xl border-0 sm:border border-card-border shadow-2xl overflow-hidden"
      >
        <header className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-card-border shrink-0 bg-card">
          <div className="min-w-0">
            <p
              id={titleId}
              className="text-sm font-black text-foreground uppercase tracking-wider truncate"
            >
              Previsualización
            </p>
            <p className="text-[11px] text-muted font-medium mt-0.5 truncate">
              {templateLabel}
              {subject ? ` · ${subject}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center rounded-xl border border-card-border bg-section-alt p-0.5">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`min-h-9 min-w-9 grid place-items-center rounded-lg transition-colors ${
                  viewport === "desktop"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                aria-label="Vista escritorio"
                title="Escritorio"
              >
                <Monitor size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`min-h-9 min-w-9 grid place-items-center rounded-lg transition-colors ${
                  viewport === "mobile"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                aria-label="Vista móvil"
                title="Móvil"
              >
                <Smartphone size={16} />
              </button>
            </div>
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

        <div className="flex-1 min-h-0 overflow-auto overscroll-contain bg-section-alt p-3 sm:p-5">
          {loading ? (
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 text-muted">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm font-bold">Generando previsualización…</p>
            </div>
          ) : error ? (
            <div className="h-full min-h-[240px] flex items-center justify-center">
              <p className="text-sm font-bold text-red-500 text-center px-4">{error}</p>
            </div>
          ) : html ? (
            <div className="flex justify-center">
              <div
                className={`w-full bg-white rounded-xl overflow-hidden border border-card-border shadow-md transition-[max-width] duration-200 ${
                  viewport === "mobile" ? "max-w-[390px]" : "max-w-[640px]"
                }`}
              >
                <iframe
                  title={`Vista previa: ${templateLabel}`}
                  srcDoc={html}
                  className="w-full border-0 bg-white"
                  style={{ height: "min(70dvh, 640px)" }}
                  sandbox=""
                />
              </div>
            </div>
          ) : null}
        </div>

        <footer className="sm:hidden flex items-center justify-center px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-card-border shrink-0 bg-card">
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
