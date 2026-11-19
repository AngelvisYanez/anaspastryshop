export type DateRange = { from: string; to: string };
export type ViewMode = "list" | "grid";
export type ReportRow = { date?: Date | string | null; values: (string | number | null | undefined)[]; heading?: boolean };

export const pageSizes = [10, 20, 50, 100];
export const emptyRange: DateRange = { from: "", to: "" };

const calendar = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Caracas", year: "numeric", month: "2-digit", day: "2-digit",
});

export function calendarDay(value: Date | string) {
  return calendar.format(new Date(value));
}

function shiftDay(day: string, offset: number) {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function recentDays(days: number): DateRange {
  const today = calendarDay(new Date());
  return { from: shiftDay(today, 1 - days), to: today };
}

function validDay(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

export function parseRange(from: unknown, to: unknown): DateRange {
  const range = { from: validDay(from), to: validDay(to) };
  return range.from && range.to && range.from > range.to ? emptyRange : range;
}

export function dateBounds({ from, to }: DateRange) {
  // Venezuela has used UTC−04:00 since 2016, before the first records on this site.
  return {
    ...(from ? { gte: new Date(from + "T00:00:00-04:00") } : {}),
    ...(to ? { lte: new Date(to + "T23:59:59.999-04:00") } : {}),
  };
}

export function matchesRange(date: ReportRow["date"], { from, to }: DateRange) {
  if (!from && !to) return true;
  if (!date) return false;
  const day = calendarDay(date);
  return (!from || day >= from) && (!to || day <= to);
}

export function parsePage(value: unknown) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function parsePageSize(value: unknown, fallback: number) {
  const size = Number(value);
  return pageSizes.includes(size) ? size : fallback;
}
