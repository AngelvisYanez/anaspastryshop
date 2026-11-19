import { calendarDay, dateBounds, parseRange, recentDays, type DateRange } from "../data-view/filters";

export const periods = [
  { id: "1", label: "Hoy" }, { id: "7", label: "7 días" }, { id: "30", label: "30 días" },
  { id: "90", label: "90 días" }, { id: "all", label: "Todos" },
] as const;

export const paymentMethods = {
  PAGO_MOVIL: "Pago móvil",
  BANK_TRANSFER: "Transferencia",
  ZELLE: "Zelle",
  BINANCE: "Binance Pay",
  USDT: "USDT",
  STRIPE: "Stripe",
  OTHER: "Otros",
} as const;

export const paymentStatuses = {
  APPROVED: "Aprobados",
  PENDING: "Pendientes",
  REJECTED: "Rechazados",
} as const;

type Method = keyof typeof paymentMethods;
export type PaymentStatus = keyof typeof paymentStatuses;
type Bucket = "day" | "week" | "month";
type Query = Record<string, string | string[] | undefined>;
export type OverviewFilter = { range: DateRange; period: string; method: Method | ""; bucket: Bucket };
export type PaymentBucket = { day: string; method: Method; status: PaymentStatus; count: number; amount: number };
export type StudentBucket = { day: string; count: number };
export type ChartItem = { name: string; value: number };
export type ActivityItem = {
  id: string; at: Date; title: string | null; name: string | null; email: string;
  method: Method; status: PaymentStatus; amount: number;
};

export function parseOverviewFilter(params: Query): OverviewFilter {
  const period = periods.find(({ id }) => id === params.period)?.id ?? "30";
  const custom = parseRange(params.from, params.to);
  const range = custom.from || custom.to ? custom : period === "all" ? { from: "", to: "" } : recentDays(Number(period));
  const method = typeof params.method === "string" && Object.hasOwn(paymentMethods, params.method) ? params.method as Method : "";
  const { gte, lte } = dateBounds(range);
  const days = gte ? Math.ceil(((lte ?? new Date()).getTime() - gte.getTime()) / 86_400_000) : Infinity;
  const bucket = days <= 45 ? "day" : days <= 180 ? "week" : "month";
  return { range, period: custom.from || custom.to ? "custom" : period, method, bucket };
}

export function summarizeOverview(payments: PaymentBucket[], students: StudentBucket[], filter: OverviewFilter) {
  const statuses = { APPROVED: 0, PENDING: 0, REJECTED: 0 };
  const methods = new Map<Method, number>();
  const timeline = new Map<string, { day: string; revenue: number; students: number; approvals: number }>();
  function getDay(day: string) {
    const value = timeline.get(day) ?? { day, revenue: 0, students: 0, approvals: 0 };
    timeline.set(day, value);
    return value;
  }

  let revenue = 0;
  for (const payment of payments) {
    statuses[payment.status] += payment.count;
    const point = getDay(payment.day);
    if (payment.status === "APPROVED") {
      revenue += payment.amount;
      point.revenue += payment.amount;
      point.approvals += payment.count;
      methods.set(payment.method, (methods.get(payment.method) ?? 0) + payment.amount);
    }
  }
  let registrations = 0;
  for (const student of students) {
    registrations += student.count;
    getDay(student.day).students += student.count;
  }

  const existing = [...timeline.keys()].sort();
  const start = filter.range.from || existing[0];
  const end = filter.range.to || calendarDay(new Date());
  // Fill bounded gaps so charts show zero-activity periods with evenly spaced axes.
  if (start) {
    const cursor = new Date(`${start}T00:00:00Z`);
    if (filter.bucket === "month") cursor.setUTCDate(1);
    if (filter.bucket === "week") cursor.setUTCDate(cursor.getUTCDate() - (cursor.getUTCDay() + 6) % 7);
    const limit = new Date(`${end}T00:00:00Z`);
    for (let i = 0; i < 600 && cursor <= limit; i++) {
      getDay(cursor.toISOString().slice(0, 10));
      if (filter.bucket === "month") cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      else cursor.setUTCDate(cursor.getUTCDate() + (filter.bucket === "week" ? 7 : 1));
    }
  }

  const resolved = statuses.APPROVED + statuses.REJECTED;
  return {
    revenue, registrations, statuses,
    average: statuses.APPROVED ? revenue / statuses.APPROVED : null,
    approvalRate: resolved ? statuses.APPROVED / resolved : null,
    methods: [...methods.entries()]
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([method, value]) => ({ name: paymentMethods[method], value })),
    timeline: [...timeline.values()].sort((a, b) => a.day.localeCompare(b.day)),
  };
}

export type OverviewStats = ReturnType<typeof summarizeOverview> & { topCourses: ChartItem[]; activity: ActivityItem[] };
