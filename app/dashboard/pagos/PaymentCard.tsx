"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { approvePayment, rejectPayment } from "@/lib/actions/payments";
import { Check, X, Loader2, FileImage, BadgeCheck } from "lucide-react";

type InscriptionProps = any;

export default function PaymentCard({ inscription }: { inscription: InscriptionProps }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function handleApprove() {
    setLoading("approve");
    await approvePayment(inscription.id);
    setLoading(null);
    router.refresh();
  }

  async function handleReject() {
    setLoading("reject");
    await rejectPayment(inscription.id);
    setLoading(null);
    router.refresh();
  }

  const isSubscription = !inscription.cursoId;
  const itemTitle = isSubscription ? "Membresía Academia" : (inscription.curso?.title ?? "Curso desconocido");
  const expectedPrice = isSubscription ? inscription.amountPaid : (inscription.curso?.price ?? 0);

  return (
    <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-black uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 text-orange-500 px-3 py-1 rounded-md">
            Pendiente
          </span>
          {isSubscription && (
            <span className="text-xs font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-950/20 text-amber-600 px-3 py-1 rounded-md flex items-center gap-1">
              <BadgeCheck size={12} /> Membresía
            </span>
          )}
          <span className="text-xs text-muted font-bold">
            {new Date(inscription.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">{inscription.user.name || inscription.user.email}</h3>
        <p className="text-sm text-muted font-medium mb-4">
          {isSubscription ? "Solicita activar:" : "Quiere acceder a:"}{" "}
          <span className="text-accent font-bold">{itemTitle}</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-section-alt p-4 rounded-lg">
          <div>
            <p className="text-[10px] font-black uppercase text-muted mb-0.5">Método</p>
            <p className="text-sm font-bold text-foreground">{inscription.method}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted mb-0.5">Referencia</p>
            <p className="text-sm font-bold text-foreground">{inscription.reference || "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted mb-0.5">Monto Reportado</p>
            <p className="text-sm font-bold text-foreground">${inscription.amountPaid} / ${expectedPrice}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted mb-0.5">Captura</p>
            {inscription.receiptImage ? (
              <a href={inscription.receiptImage} target="_blank" rel="noreferrer" className="text-accent text-sm font-bold flex items-center gap-1 hover:underline">
                <FileImage size={14} /> Ver
              </a>
            ) : (
              <p className="text-sm font-bold text-muted">Sin imagen</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-auto flex-row md:flex-col gap-3">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          {loading === "approve" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Aprobar
        </button>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 font-bold py-2.5 px-5 rounded-lg transition-all border border-red-200 dark:border-red-800 disabled:opacity-50"
        >
          {loading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} Rechazar
        </button>
      </div>
    </div>
  );
}
