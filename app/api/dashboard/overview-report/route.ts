import { auth } from "@/lib/auth";
import { getOverview } from "@/app/dashboard/admin-overview/get-overview";
import { parseOverviewFilter, paymentMethods, paymentStatuses } from "@/app/dashboard/admin-overview/overview";
import { createReport, reportFilename } from "@/app/dashboard/data-view/download-report";
import type { ReportRow } from "@/app/dashboard/data-view/filters";

const title = "Rendimiento del negocio";
const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", currencyDisplay: "code" });
const percent = new Intl.NumberFormat("es-VE", { style: "percent", maximumFractionDigits: 1 });

export async function GET(request: Request) {
  if ((await auth())?.user?.role !== "ADMIN") {
    return new Response(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const filter = parseOverviewFilter(Object.fromEntries(new URL(request.url).searchParams));
  const stats = await getOverview(filter, "all");
  const rows: ReportRow[] = [
    { heading: true, values: ["Resumen"] },
    { values: ["Ingresos confirmados", money.format(stats.revenue)] },
    { values: ["Nuevos alumnos", stats.registrations] },
    ...Object.entries(paymentStatuses).map(([status, label]) => ({
      values: [label, stats.statuses[status as keyof typeof paymentStatuses]],
    })),
    { values: ["Pago promedio", stats.average === null ? "Sin datos" : money.format(stats.average)] },
    { values: ["Tasa de aprobación", stats.approvalRate === null ? "Sin datos" : percent.format(stats.approvalRate)] },
    { heading: true, values: ["Ingresos por método"] },
    ...stats.methods.map(({ name, value }) => ({ values: [name, money.format(value)] })),
    { heading: true, values: ["Formaciones más vendidas"] },
    ...stats.topCourses.map(({ name, value }) => ({ values: [name, `${value} pagos aprobados`] })),
    { heading: true, values: [{ day: "Evolución diaria", week: "Evolución semanal", month: "Evolución mensual" }[filter.bucket]] },
    ...stats.timeline.map(({ day, revenue, approvals, students }) => ({
      values: [day, money.format(revenue), `${approvals} pagos aprobados`, `${students} nuevos alumnos`],
    })),
    { heading: true, values: [`Detalle de pagos (${stats.activity.length})`] },
    ...stats.activity.map((payment) => ({
      date: payment.at,
      values: [payment.name, payment.email, payment.title ?? "Servicio de pastelería",
        paymentMethods[payment.method], paymentStatuses[payment.status], money.format(payment.amount)],
    })),
  ];
  const method = filter.method ? paymentMethods[filter.method] : "Todos los métodos";
  const pdf = await createReport(title, filter.range, rows, `${method} · Caracas`);
  return new Response(Uint8Array.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportFilename(title, filter.range)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
