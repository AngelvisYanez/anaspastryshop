"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { approvePayment, rejectPayment } from "@/lib/actions/payments";
import { Check, X, Loader2, FileImage, BadgeCheck, AlertTriangle, Phone } from "lucide-react";

type Inscription = {
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
  PAGO_MOVIL: "Pago Móvil",
  USDT: "USDT",
  TRANSFERENCIA: "Transferencia",
  STRIPE: "Stripe",
};

export default function PaymentCard({ inscription }: { inscription: Inscription }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();

  const isSubscription = !inscription.cursoId;
  const itemTitle = isSubscription ? "Membresía Academia" : (inscription.curso?.title ?? "Curso desconocido");
  const expectedPrice = isSubscription ? inscription.amountPaid : (inscription.curso?.price ?? 0);
  const amountMismatch = !isSubscription && inscription.amountPaid < expectedPrice;

  async function handleApprove() {
    setLoading("approve");
    setShowApproveConfirm(false);
    await approvePayment(inscription.id);
    setLoading(null);
    router.refresh();
  }

  async function handleReject() {
    setLoading("reject");
    setShowRejectDialog(false);
    await rejectPayment(inscription.id, rejectionReason.trim() || undefined);
    setLoading(null);
    setRejectionReason("");
    router.refresh();
  }

  return (
    <>
      <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-xs font-black uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 text-orange-500 px-3 py-1 rounded-md">
              Pendiente
            </span>
            {isSubscription && (
              <span className="text-xs font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-950/20 text-amber-600 px-3 py-1 rounded-md flex items-center gap-1">
                <BadgeCheck size={12} /> Membresía
              </span>
            )}
            {amountMismatch && (
              <span className="text-xs font-black uppercase tracking-widest bg-red-50 dark:bg-red-950/20 text-red-500 px-3 py-1 rounded-md flex items-center gap-1">
                <AlertTriangle size={12} /> Monto incorrecto
              </span>
            )}
            <span className="text-xs text-muted font-bold">
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
            {isSubscription ? "Solicita activar:" : "Quiere acceder a:"}{" "}
            <span className="text-accent font-bold">{itemTitle}</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-section-alt p-4 rounded-lg">
            <div>
              <p className="text-[10px] font-black uppercase text-muted mb-0.5">Método</p>
              <p className="text-sm font-bold text-foreground">
                {METHOD_LABELS[inscription.method] ?? inscription.method}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted mb-0.5">
                {inscription.phoneNumber ? "Teléfono" : "Referencia"}
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
                <p className="text-xs text-muted mt-0.5">Ref: {inscription.reference}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted mb-0.5">Monto Reportado</p>
              <p className={`text-sm font-bold ${amountMismatch ? "text-red-500" : "text-foreground"}`}>
                ${inscription.amountPaid} / ${expectedPrice}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted mb-0.5">Captura</p>
              {inscription.receiptImage ? (
                <a
                  href={inscription.receiptImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  <FileImage size={14} /> Ver imagen
                </a>
              ) : (
                <p className="text-sm font-bold text-muted">Sin imagen</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full md:w-auto flex-row md:flex-col gap-3">
          <button
            onClick={() => setShowApproveConfirm(true)}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            {loading === "approve" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Aprobar
          </button>
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 font-bold py-2.5 px-5 rounded-lg transition-all border border-red-200 dark:border-red-800 disabled:opacity-50"
          >
            {loading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Rechazar
          </button>
        </div>
      </div>

      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-foreground mb-1">Confirmar aprobación</h3>
            <p className="text-sm text-muted mb-4">
              ¿Estás seguro de aprobar el pago de{" "}
              <strong className="text-foreground">{inscription.user.name || inscription.user.email}</strong> por{" "}
              <strong className="text-foreground">{itemTitle}</strong>?
            </p>
            {amountMismatch && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  El monto reportado (${inscription.amountPaid}) no coincide con el precio esperado (${expectedPrice}).
                  Verifica la captura antes de aprobar.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-all"
              >
                <Check size={16} /> Confirmar aprobación
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-foreground mb-1">Rechazar pago</h3>
            <p className="text-sm text-muted mb-4">
              Ingresa el motivo del rechazo. El usuario recibirá un correo con esta información.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: La referencia no coincide con nuestros registros..."
              className="w-full border border-card-border rounded-lg p-3 text-sm bg-section-alt text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent mb-4"
              rows={3}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectDialog(false); setRejectionReason(""); }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition-all"
              >
                <X size={16} /> Rechazar pago
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
