import { getPendingPayments } from "@/lib/actions/payments";
import PaymentCard from "./PaymentCard";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

export default async function PagosPage() {
  const result = await getPendingPayments();

  if (result.error) {
    return <div className="p-8 text-red-500 font-bold">{result.error}</div>;
  }

  const inscriptions = result.inscriptions || [];

  return (
    <div className="p-8">
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C9A84C] transition-colors mb-6 text-xs font-black uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={14} /> Volver al Dashboard
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-amber-50 text-[#C9A84C] rounded-2xl">
            <Wallet size={28} />
          </div>
          <h1 className="text-3xl font-black text-[#0B1F3A]">
            Validación de Pagos
          </h1>
        </div>
        <p className="text-gray-400 font-medium">
          Revisa las transferencias y pagos móviles reportados por los alumnos.
        </p>
      </div>

      {inscriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 font-bold text-lg">No hay pagos pendientes por validar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {inscriptions.map((inscription) => (
            <PaymentCard key={inscription.id} inscription={inscription} />
          ))}
        </div>
      )}
    </div>
  );
}
