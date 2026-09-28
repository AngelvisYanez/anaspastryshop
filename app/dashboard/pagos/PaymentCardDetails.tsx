"use client";

import { FileImage, AlertTriangle, Phone, Sparkles, BookOpen } from "lucide-react";

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-section-alt p-4 rounded-lg">
        <div>
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">Método</p>
          <p className="text-sm font-bold text-foreground">
            {METHOD_LABELS[inscription.method] ?? inscription.method}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">
            {inscription.phoneNumber ? "Teléfono / Ref" : "Referencia"}
          </p>
          <p className="text-sm font-bold text-foreground flex items-center gap-1">
            {inscription.phoneNumber ? (
              <>
                <Phone size={12} className="text-muted shrink-0" />
                {inscription.phoneNumber}
              </>
            ) : (
              inscription.reference || "N/A"
            )}
          </p>
          {inscription.phoneNumber && inscription.reference && (
            <p className="text-xs text-muted mt-0.5 break-all">Ref: {inscription.reference}</p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">Monto Reportado</p>
          <p className={`text-sm font-bold ${amountMismatch ? "text-red-500" : "text-foreground"}`}>
            ${inscription.amountPaid} {isPastryService ? "USD" : `/ $${expectedPrice}`}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase text-muted mb-0.5">Captura</p>
          {inscription.receiptImage ? (
            <a
              href={inscription.receiptImage}
              target="_blank"
              rel="noreferrer"
              className="text-accent text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <FileImage size={14} /> Ver comprobante
            </a>
          ) : (
            <p className="text-sm font-bold text-muted">Sin imagen</p>
          )}
        </div>
      </div>
    </div>
  );
}
