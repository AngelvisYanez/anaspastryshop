"use client";
import { useState } from "react";
import { Check, X, FileImage, Sparkles, BookOpen } from "lucide-react";
import { ReceiptPreviewDialog } from "@/components/ReceiptPreviewDialog";

import { DataPaginator, DataToolbar } from "../data-view/DataView";
import { useDataQuery } from "../data-view/use-data-query";
import type { DateRange, ViewMode } from "../data-view/filters";
import { getPaymentReport } from "./report-action";

type HistoryInscription = {
  id: string;
  status: string;
  method: string;
  reference: string | null;
  receiptImage: string | null;
  amountPaid: number;
  cursoId: string | null;
  updatedAt: string | Date;
  user: { name: string | null; email: string };
  curso: { title: string; price: number } | null;
};

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Transferencia",
  ZELLE: "Zelle",
  PAGO_MOVIL: "Pago Móvil",
  BINANCE: "Binance Pay",
  USDT: "USDT",
  TRANSFERENCIA: "Transferencia",
  STRIPE: "Stripe",
};

export default function PaymentHistoryTable({
  inscriptions,
  total,
  page,
  size,
  range,
  mode,
}: {
  inscriptions: HistoryInscription[];
  total: number;
  page: number;
  size: number;
  range: DateRange;
  mode: ViewMode;
}) {
  const { updateParams, isPending } = useDataQuery();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div>
      <DataToolbar title="Historial de pagos" dateLabel="Fecha de resolución" range={range} mode={mode} total={total} busy={isPending}
        onRange={(range) => updateParams({ ...range, page: "" })}
        onMode={(mode) => updateParams({ view: mode })}
        report={async () => (await getPaymentReport(range)).map((payment) => ({
          date: payment.updatedAt,
          values: [payment.user.name, payment.user.email, payment.curso?.title ?? "Servicio de pastelería",
            METHOD_LABELS[payment.method] ?? payment.method, `USD ${payment.amountPaid}`,
            payment.status === "APPROVED" ? "Aprobado" : "Rechazado"],
        }))}
      />
      {total ? (
      <div data-view-mode={mode} className="max-w-full overflow-x-auto rounded-xl border border-card-border bg-card">
        <table className="dashboard-data-table w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-card-border bg-section-alt">
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Usuario</th>
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Producto / Servicio</th>
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Método</th>
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Monto</th>
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Fecha</th>
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Estado</th>
              <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-muted whitespace-nowrap">Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((ins) => {
              const isPastry = !ins.cursoId;
              const itemTitle = isPastry
                ? "Servicio de Pastelería"
                : (ins.curso?.title ?? "Taller / Curso");
              const isApproved = ins.status === "APPROVED";

              return (
                <tr
                  key={ins.id}
                  className="border-b border-card-border last:border-0 hover:bg-card-hover transition-colors"
                >
                  <td data-label="Usuario" className="py-3.5 px-5">
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {ins.user.name || ins.user.email}
                    </p>
                    {ins.user.name && (
                      <p className="text-xs text-muted mt-0.5">{ins.user.email}</p>
                    )}
                  </td>
                  <td data-label="Producto o servicio" className="py-3.5 px-5">
                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      {isPastry ? (
                        <Sparkles size={13} className="text-pink-500 shrink-0" />
                      ) : (
                        <BookOpen size={13} className="text-accent shrink-0" />
                      )}
                      <span>{itemTitle}</span>
                    </span>
                    {ins.reference && ins.reference.startsWith("[Servicio:") && (
                      <p className="text-[11px] text-muted truncate max-w-xs mt-0.5">
                        {ins.reference.split("]")[0].replace("[Servicio:", "").trim()}
                      </p>
                    )}
                  </td>
                  <td data-label="Método" className="py-3.5 px-5">
                    <span className="text-sm font-bold text-muted whitespace-nowrap">
                      {METHOD_LABELS[ins.method] ?? ins.method}
                    </span>
                  </td>
                  <td data-label="Monto" className="py-3.5 px-5">
                    <span className="text-sm font-black text-foreground whitespace-nowrap">
                      ${ins.amountPaid} USD
                    </span>
                  </td>
                  <td data-label="Fecha" className="py-3.5 px-5">
                    <span suppressHydrationWarning className="text-sm text-muted font-medium whitespace-nowrap">
                      {new Date(ins.updatedAt).toLocaleDateString("es-US", {
                        timeZone: "America/Caracas",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td data-label="Estado" className="py-3.5 px-5">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black bg-green-50 dark:bg-green-950/20 text-green-600 whitespace-nowrap">
                        <Check size={11} /> Aprobado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black bg-red-50 dark:bg-red-950/20 text-red-500 whitespace-nowrap">
                        <X size={11} /> Rechazado
                      </span>
                    )}
                  </td>
                  <td data-label="Comprobante" className="py-3.5 px-5">
                    {ins.receiptImage ? (
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(ins.receiptImage)}
                        className="inline-flex items-center gap-1 text-accent text-xs font-bold hover:underline"
                      >
                        <FileImage size={13} /> Ver
                      </button>
                    ) : (
                      <span className="text-xs text-muted font-medium">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      ) : <p className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-muted">No hay pagos en el historial para los filtros seleccionados.</p>}

      <DataPaginator title="Historial de pagos" page={page} size={size} total={total} busy={isPending}
        onPage={(page) => updateParams({ page: String(page) })}
        onSize={(size) => updateParams({ size: String(size), page: "" })} />

      <ReceiptPreviewDialog
        url={previewUrl}
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
      />
    </div>
  );
}
