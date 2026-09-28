/**
 * Formats a BCV rate date without timezone drift. The upstream APIs mix
 * `YYYY-MM-DD` and full ISO timestamps; `new Date(value)` would parse the
 * date-only form as UTC midnight and render the previous day in Venezuela
 * (UTC-4), so the components are read and formatted as UTC instead.
 */
export function formatBcvDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-");
  if (!y || !m || !d) return value;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).toLocaleDateString("es-VE", {
    timeZone: "UTC",
  });
}
