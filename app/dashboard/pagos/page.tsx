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
    <div>
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6 text-xs font-black uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={14} /> Volver al Dashboard
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2.5 bg-accent-subtle text-accent rounded-lg">
            <Wallet size={24} />
          </div>
          <h1 className="text-3xl font-black text-foreground">
            Validación de Pagos
          </h1>
        </div>
        <p className="text-muted font-medium">
          Revisa las transferencias y pagos móviles reportados por los alumnos.
        </p>
      </div>

      {inscriptions.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center border border-card-border shadow-sm">
          <p className="text-muted font-bold text-lg">No hay pagos pendientes por validar.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {inscriptions.map((inscription) => (
            <PaymentCard key={inscription.id} inscription={inscription} />
          ))}
        </div>
      )}
    </div>
  );
}
