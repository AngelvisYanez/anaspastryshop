"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approvePayment, rejectPayment } from "@/lib/actions/payments";
import { Check, X, Loader2 } from "lucide-react";
import { PaymentApproveDialog, PaymentRejectDialog } from "./PaymentActionDialogs";
import { PaymentCardDetails, type PaymentInscription } from "./PaymentCardDetails";

export default function PaymentCard({ inscription }: { inscription: PaymentInscription }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isPastryService = !inscription.cursoId;
  const itemTitle = isPastryService
    ? "Servicio de Pastelería / Pedido Especial"
    : (inscription.curso?.title ?? "Taller / Curso");
  const expectedPrice = isPastryService ? inscription.amountPaid : (inscription.curso?.price ?? 0);
  const amountMismatch = !isPastryService && inscription.amountPaid < expectedPrice;

  async function handleApprove() {
    setLoading("approve");
    setShowApproveConfirm(false);
    setError(null);
    try {
      const result = await approvePayment(inscription.id);
      if (result.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("No se pudo aprobar el pago.");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    setShowRejectDialog(false);
    setError(null);
    try {
      const result = await rejectPayment(inscription.id, rejectionReason.trim() || undefined);
      if (result.error) setError(result.error);
      else {
        setRejectionReason("");
        router.refresh();
      }
    } catch {
      setError("No se pudo rechazar el pago.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
      <div className="bg-card rounded-xl p-4 sm:p-6 border border-card-border shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6">
        <PaymentCardDetails
          inscription={inscription}
          isPastryService={isPastryService}
          itemTitle={itemTitle}
          expectedPrice={expectedPrice}
          amountMismatch={amountMismatch}
        />

        <div className="flex w-full lg:w-auto flex-row lg:flex-col gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowApproveConfirm(true)}
            disabled={loading !== null}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-5 rounded-lg transition shadow-sm disabled:opacity-50 min-h-11"
          >
            {loading === "approve" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Aprobar
          </button>
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={loading !== null}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 font-bold py-2.5 px-5 rounded-lg transition border border-red-200 dark:border-red-800 disabled:opacity-50 min-h-11"
          >
            {loading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Rechazar
          </button>
        </div>
      </div>

      {showApproveConfirm && (
        <PaymentApproveDialog
          userLabel={inscription.user.name || inscription.user.email}
          itemTitle={itemTitle}
          amountPaid={inscription.amountPaid}
          expectedPrice={expectedPrice}
          amountMismatch={amountMismatch}
          onCancel={() => setShowApproveConfirm(false)}
          onConfirm={handleApprove}
        />
      )}

      {showRejectDialog && (
        <PaymentRejectDialog
          userLabel={inscription.user.name || inscription.user.email}
          inscriptionId={inscription.id}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onCancel={() => setShowRejectDialog(false)}
          onConfirm={handleReject}
        />
      )}
    </>
  );
}
