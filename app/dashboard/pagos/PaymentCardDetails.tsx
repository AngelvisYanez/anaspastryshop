"use client";

import { useState } from "react";
import { FileImage, AlertTriangle, Phone, Sparkles, BookOpen } from "lucide-react";
import { ReceiptPreviewDialog } from "@/components/ReceiptPreviewDialog";

export type PaymentInscription = {
  id: string;
  status: string;
  method: string;
  reference: string | null;
  phoneNumber: string | null;
  receiptImage: string | null;
  amountPaid: number;
  cursoId: string | null;
  createdAt: string | Date;
  user: { name: string | null; email: string };
  curso: { title: string; price: number } | null;
};

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Transferencia Bancaria",
  ZELLE: "Zelle",
  PAGO_MOVIL: "Pago Móvil (BCV)",
  BINANCE: "Binance Pay",
  USDT: "USDT",
  TRANSFERENCIA: "Transferencia",
  STRIPE: "Stripe",
};

export function PaymentCardDetails({
  inscription,
  isPastryService,
  itemTitle,
  expectedPrice,
  amountMismatch,
}: {
  inscription: PaymentInscription;
  isPastryService: boolean;
  itemTitle: string;
  expectedPrice: number;
  amountMismatch: boolean;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="text-xs font-black uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 text-orange-500 px-3 py-1 rounded-md">
          Pendiente
        </span>
        {isPastryService ? (
          <span className="text-xs font-black uppercase tracking-widest bg-pink-50 dark:bg-pink-950/20 text-pink-600 px-3 py-1 rounded-md flex items-center gap-1">
            <Sparkles size={12} /> Servicio de Pastelería
          </span>
        ) : (
          <span className="text-xs font-black uppercase tracking-widest bg-accent-subtle text-accent px-3 py-1 rounded-md flex items-center gap-1">
            <BookOpen size={12} /> Taller / Curso
          </span>
        )}
        {amountMismatch && (
          <span className="text-xs font-black uppercase tracking-widest bg-red-50 dark:bg-red-950/20 text-red-500 px-3 py-1 rounded-md flex items-center gap-1">
            <AlertTriangle size={12} /> Monto incorrecto
          </span>
        )}
        <span suppressHydrationWarning className="text-xs text-muted font-bold">
          {new Date(inscription.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-xl font-bold text-foreground leading-tight">
        {inscription.user.name || inscription.user.email}
      </h3>
      {inscription.user.name && (
        <p className="text-sm text-muted mb-1">{inscription.user.email}</p>
      )}
      <p className="text-sm text-muted font-medium mb-4">
        {isPastryService ? "Pago reportado para:" : "Compra de:"}{" "}
        <span className="text-accent font-bold">{itemTitle}</span>
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-section-alt p-3 sm:p-4 rounded-xl">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">Método</p>
          <p className="text-sm font-bold text-foreground truncate">
            {METHOD_LABELS[inscription.method] ?? inscription.method}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">
            {inscription.phoneNumber ? "Teléfono / Ref" : "Referencia"}
          </p>
          <p className="text-sm font-bold text-foreground flex items-center gap-1 min-w-0">
            {inscription.phoneNumber ? (
              <>
                <Phone size={12} className="text-muted shrink-0" />
                <span className="truncate">{inscription.phoneNumber}</span>
              </>
            ) : (
              <span className="truncate">{inscription.reference || "N/A"}</span>
            )}
          </p>
          {inscription.phoneNumber && inscription.reference && (
            <p className="text-xs text-muted mt-0.5 break-all">Ref: {inscription.reference}</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">Monto Reportado</p>
          <p className={`text-sm font-bold ${amountMismatch ? "text-red-500" : "text-foreground"}`}>
            ${inscription.amountPaid} {isPastryService ? "USD" : `/ $${expectedPrice}`}
          </p>
        </div>
        <div className="min-w-0 col-span-2 lg:col-span-1">
          <p className="text-[11px] font-black uppercase text-muted mb-1.5">Captura</p>
          {inscription.receiptImage ? (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="group flex items-center gap-3 w-full rounded-xl border border-card-border bg-card p-2 pr-3 text-left hover:border-accent/50 hover:bg-card-hover transition-colors"
            >
              <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-section-alt shrink-0 border border-card-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inscription.receiptImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-accent text-sm font-bold flex items-center gap-1.5 group-hover:underline">
                  <FileImage size={14} className="shrink-0" /> Ver comprobante
                </span>
                <span className="block text-[11px] text-muted font-medium mt-0.5">
                  Toca para ampliar
                </span>
              </span>
            </button>
          ) : (
            <p className="text-sm font-bold text-muted">Sin imagen</p>
          )}
        </div>
      </div>

      <ReceiptPreviewDialog
        url={inscription.receiptImage}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
