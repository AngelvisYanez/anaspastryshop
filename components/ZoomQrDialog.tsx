"use client";

import { X } from "lucide-react";

export function ZoomQrDialog({
  dialogRef,
  url,
  onClose,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  url: string | null;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Código QR ampliado"
      className="m-auto bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {url && (
        <div className="relative bg-card rounded-3xl p-6 max-w-sm w-full border border-card-border shadow-2xl flex flex-col items-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 min-h-11 min-w-11 grid place-items-center rounded-full text-muted hover:text-foreground hover:bg-card-hover transition-colors"
          >
            <X size={20} />
          </button>
          <p className="text-sm font-black text-foreground uppercase tracking-wider mb-4">
            Escanea para pagar
          </p>
          <div className="bg-white p-4 rounded-2xl border border-card-border shadow-inner">
            <img src={url} alt="Código QR Ampliado" className="w-64 h-64 object-contain" />
          </div>
          <p className="text-xs text-muted font-medium mt-4 text-center">
            Abre la aplicación correspondiente en tu teléfono y escanea este código.
          </p>
        </div>
      )}
    </dialog>
  );
}