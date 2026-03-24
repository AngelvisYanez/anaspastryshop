"use client";
import { useState } from "react";
import { approvePayment, rejectPayment } from "@/lib/actions/payments";
import { Check, X, Loader2, FileImage } from "lucide-react";

type InscriptionProps = any;

export default function PaymentCard({ inscription }: { inscription: InscriptionProps }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    await approvePayment(inscription.id);
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    await rejectPayment(inscription.id);
    setLoading(null);
  }

  const itemTitle = inscription.taller?.title || inscription.curso?.title || "Elemento Desconocido";
  const expectedPrice = inscription.taller?.price || inscription.curso?.price || 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-black uppercase tracking-widest bg-orange-50 text-orange-500 px-3 py-1 rounded-lg">
            Pendiente
          </span>
          <span className="text-xs text-gray-400 font-bold">
            {new Date(inscription.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-1">{inscription.user.name || inscription.user.email}</h3>
        <p className="text-sm text-gray-500 font-medium mb-4">
          Quiere acceder a: <span className="text-[#5A4FCF] font-bold">{itemTitle}</span>
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Método</p>
            <p className="text-sm font-bold text-[#1A1A2E]">{inscription.method}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Referencia</p>
            <p className="text-sm font-bold text-[#1A1A2E]">{inscription.reference || "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Monto Reportado</p>
            <p className="text-sm font-bold text-[#1A1A2E]">${inscription.amountPaid} / ${expectedPrice}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Captura</p>
            {inscription.receiptImage ? (
              <a href={inscription.receiptImage} target="_blank" rel="noreferrer" className="text-[#5A4FCF] text-sm font-bold flex items-center gap-1 hover:underline">
                <FileImage size={14} /> Ver
              </a>
            ) : (
              <p className="text-sm font-bold text-gray-400">Sin imagen</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-auto flex-row md:flex-col gap-3">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-green-100 disabled:opacity-50"
        >
          {loading === "approve" ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Aprobar
        </button>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 px-6 rounded-2xl transition-all disabled:opacity-50"
        >
          {loading === "reject" ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />} Rechazar
        </button>
      </div>
    </div>
  );
}
