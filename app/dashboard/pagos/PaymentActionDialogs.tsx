"use client";

import { Check, X, AlertTriangle } from "lucide-react";

export function PaymentApproveDialog({
  userLabel,
  itemTitle,
  amountPaid,
  expectedPrice,
  amountMismatch,
  onCancel,
  onConfirm,
}: {
  userLabel: string;
  itemTitle: string;
  amountPaid: number;
  expectedPrice: number;
  amountMismatch: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-foreground mb-1">Confirmar aprobación</h3>
        <p className="text-sm text-muted mb-4">
          ¿Estás seguro de aprobar el pago de{" "}
          <strong className="text-foreground">{userLabel}</strong> por{" "}
          <strong className="text-foreground">{itemTitle}</strong>?
        </p>
        {amountMismatch && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              El monto reportado (${amountPaid}) no coincide con el precio esperado (${expectedPrice}).
              Verifica la captura antes de aprobar.
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition"
          >
            <Check size={16} /> Confirmar aprobación
          </button>
        </div>
      </div>
    </div>
  );
}

export function PaymentRejectDialog({
  userLabel,
  inscriptionId,
  rejectionReason,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  userLabel: string;
  inscriptionId: string;
  rejectionReason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-foreground mb-1">Rechazar pago</h3>
        <p className="text-sm text-muted mb-4">
          ¿Estás seguro de rechazar el pago de{" "}
          <strong className="text-foreground">{userLabel}</strong>?
        </p>
        <div className="mb-4">
          <label
            htmlFor={`rejection-reason-${inscriptionId}`}
            className="text-xs font-bold text-muted block mb-1"
          >
            Motivo del rechazo (opcional, se enviará por email al usuario)
          </label>
          <textarea
            id={`rejection-reason-${inscriptionId}`}
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ej. El número de referencia no coincide, comprobante ilegible..."
            rows={3}
            className="w-full bg-section-alt border border-card-border rounded-lg p-3 text-sm text-foreground outline-none focus:border-accent resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition"
          >
            <X size={16} /> Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}
