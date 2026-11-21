import { createReport, reportLogoPath } from "./create-report";
import type { DateRange, ReportRow } from "./filters";

export function reportFilename(title: string, range: DateRange) {
  const slug = title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${slug}-${range.from || "inicio"}-${range.to || "actualidad"}.pdf`;
}

export async function downloadReport(title: string, range: DateRange, rows: ReportRow[]) {
  const logo = await fetch(reportLogoPath)
    .then((response) => response.ok ? response.arrayBuffer() : undefined)
    .catch(() => undefined);
  const bytes = await createReport(title, range, rows, undefined, logo);
  const url = URL.createObjectURL(new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }));
  const link = window.document.createElement("a");
  link.href = url;
  link.download = reportFilename(title, range);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
