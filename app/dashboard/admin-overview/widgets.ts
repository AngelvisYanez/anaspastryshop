export const widgets = {
  revenue: { label: "Ingresos confirmados", description: "Total de pagos aprobados en USD", kind: "metric" },
  approved: { label: "Pagos aprobados", description: "Transacciones confirmadas", kind: "metric" },
  pending: { label: "Por revisar", description: "Comprobantes que siguen pendientes", kind: "metric" },
  rejected: { label: "Pagos rechazados", description: "Comprobantes rechazados", kind: "metric" },
  students: { label: "Nuevos alumnos", description: "Cuentas de alumno registradas en el período", kind: "metric" },
  average: { label: "Pago promedio", description: "Ingresos divididos por pagos aprobados", kind: "metric" },
  approvalRate: { label: "Tasa de aprobación", description: "Pagos aprobados entre pagos resueltos", kind: "metric" },
  revenueTrend: { label: "Evolución de ingresos", description: "Pagos confirmados en USD", kind: "trend" },
  studentsTrend: { label: "Registro de alumnos", description: "Nuevas cuentas de alumno", kind: "trend" },
  approvalsTrend: { label: "Pagos aprobados en el tiempo", description: "Cantidad de pagos confirmados", kind: "trend" },
  methods: { label: "Ingresos por método", description: "Importe aprobado por medio de pago", kind: "breakdown" },
  statuses: { label: "Estado de los pagos", description: "Distribución por estado actual", kind: "breakdown" },
  topCourses: { label: "Formaciones más vendidas", description: "Hasta 5 formaciones por pagos aprobados", kind: "breakdown" },
} as const;

export type WidgetId = keyof typeof widgets;
export type ChartStyle = "line" | "area" | "bar" | "donut";
export type Widget = { id: WidgetId; wide: boolean; chart: ChartStyle };

export const chartLabels: Record<ChartStyle, string> = {
  line: "Línea", area: "Área", bar: "Barras", donut: "Anillo",
};

export function chartOptions(id: WidgetId): ChartStyle[] {
  const kind = widgets[id].kind;
  if (kind === "trend") return id === "revenueTrend" ? ["area", "line", "bar"] : ["line", "bar", "area"];
  if (kind === "breakdown") return id === "topCourses" ? ["bar", "donut"] : ["donut", "bar"];
  return [];
}

export function makeWidget(id: WidgetId): Widget {
  return { id, wide: id === "revenueTrend", chart: chartOptions(id)[0] ?? "bar" };
}

const defaults: WidgetId[] = [
  "revenue", "approved", "pending", "students", "average", "approvalRate",
  "revenueTrend", "studentsTrend", "methods", "statuses", "topCourses",
];

export const defaultWidgets = defaults.map(makeWidget);
export const defaultWidgetSnapshot = JSON.stringify(defaultWidgets);

export function readWidgets(snapshot: string): Widget[] {
  try {
    const input: unknown = JSON.parse(snapshot);
    if (!Array.isArray(input)) return defaultWidgets;
    const seen = new Set<WidgetId>();
    const result: Widget[] = [];
    for (const item of input) {
      if (!item || typeof item.id !== "string" || !Object.hasOwn(widgets, item.id)) continue;
      const id = item.id as WidgetId;
      if (seen.has(id)) continue;
      seen.add(id);
      const entry = makeWidget(id);
      result.push({
        id, wide: typeof item.wide === "boolean" ? item.wide : entry.wide,
        chart: chartOptions(id).includes(item.chart) ? item.chart : entry.chart,
      });
    }
    return result.length || input.length === 0 ? result : defaultWidgets;
  } catch {
    return defaultWidgets;
  }
}
