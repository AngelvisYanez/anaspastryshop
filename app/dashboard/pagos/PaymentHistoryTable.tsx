"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, X, FileImage, ChevronLeft, ChevronRight, History, Sparkles, BookOpen } from "lucide-react";

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
  PAGO_MOVIL: "Pago Móvil (BCV)",
  BINANCE: "Binance Pay",
  USDT: "USDT",
  TRANSFERENCIA: "Transferencia",
  STRIPE: "Stripe",
};

export default function PaymentHistoryTable({
  inscriptions,
  total,
  page,
  pages,
  pageSize,
}: {
  inscriptions: HistoryInscription[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}) {
  const pathname = usePathname();

  function pageHref(p: number) {
    return `${pathname}?page=${p}`;
  }

  if (total === 0) {
    return (
      <div className="bg-card rounded-xl p-12 text-center border border-card-border shadow-sm flex flex-col items-center">
        <div className="w-14 h-14 bg-section-alt rounded-xl flex items-center justify-center mb-4">
          <History className="text-muted" size={26} />
        </div>
        <p className="text-foreground font-bold">Sin historial aún</p>
        <p className="text-muted text-sm mt-1">Los pagos aprobados y rechazados aparecerán aquí.</p>
      </div>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
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
                  <td className="py-3.5 px-5">
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {ins.user.name || ins.user.email}
                    </p>
                    {ins.user.name && (
                      <p className="text-xs text-muted mt-0.5">{ins.user.email}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
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
                  <td className="py-3.5 px-5">
                    <span className="text-sm font-bold text-muted whitespace-nowrap">
                      {METHOD_LABELS[ins.method] ?? ins.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-sm font-black text-foreground whitespace-nowrap">
                      ${ins.amountPaid} USD
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span suppressHydrationWarning className="text-sm text-muted font-medium whitespace-nowrap">
                      {new Date(ins.updatedAt).toLocaleDateString("es-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
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
                  <td className="py-3.5 px-5">
                    {ins.receiptImage ? (
                      <a
                        href={ins.receiptImage}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-accent text-xs font-bold hover:underline"
                      >
                        <FileImage size={13} /> Ver
                      </a>
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

      {pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-card-border bg-section-alt">
          <p className="text-xs text-muted font-medium">
            Mostrando <strong className="text-foreground">{from}</strong> a{" "}
            <strong className="text-foreground">{to}</strong> de{" "}
            <strong className="text-foreground">{total}</strong> pagos
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="p-2 rounded-lg border border-card-border hover:bg-card-hover transition-colors text-muted hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <span className="p-2 rounded-lg border border-card-border opacity-40 cursor-not-allowed text-muted">
                <ChevronLeft size={16} />
              </span>
            )}

            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-1 text-xs text-muted">
                  ...
                </span>
              ) : (
                <Link
                  key={p}
                  href={pageHref(p as number)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    p === page
                      ? "bg-accent text-white"
                      : "border border-card-border hover:bg-card-hover text-muted hover:text-foreground"
                  }`}
                >
                  {p}
                </Link>
              )
            )}

            {page < pages ? (
              <Link
                href={pageHref(page + 1)}
                className="p-2 rounded-lg border border-card-border hover:bg-card-hover transition-colors text-muted hover:text-foreground"
              >
                <ChevronRight size={16} />
              </Link>
            ) : (
              <span className="p-2 rounded-lg border border-card-border opacity-40 cursor-not-allowed text-muted">
                <ChevronRight size={16} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
