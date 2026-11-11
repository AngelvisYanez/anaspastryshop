export interface WorkshopDetails {
  isWorkshop: boolean;
  slug?: string;
  spots?: number;
  location?: string;
  workshopDate?: string;
  workshopTime?: string;
  notes?: string;
}

/** Dirección canónica de la sede presencial (Coro, Falcón). */
export const WORKSHOP_LOCATION =
  "Av. Tirso Salavarria entre calle Iturbe y calle Las Margaritas, Frente al museo de la UNEFM. Coro, Falcón, Venezuela";

/** Etiqueta corta para nav, chips y encabezados. */
export const WORKSHOP_LOCATION_SHORT = "Coro, Falcón";

/** Texto público cuando el workshop aún no tiene fecha fijada. */
export const WORKSHOP_DATE_PENDING = "Programando Fecha";

/** Horario por defecto al fijar una fecha en el panel admin. */
export const WORKSHOP_TIME_DEFAULT = "09:00 AM — 05:00 PM";

const DEFAULT_WORKSHOP_LOCATION = WORKSHOP_LOCATION;

const LEGACY_WORKSHOP_LOCATIONS = [
  "Caracas, Las Mercedes — Sede Ana's Pastry Shop",
  "Caracas, Las Mercedes",
  "Las Mercedes, Caracas",
];

function resolveWorkshopLocation(
  location: string | undefined,
  isWorkshop: boolean
): string | undefined {
  const trimmed = location?.trim();
  if (
    !trimmed ||
    LEGACY_WORKSHOP_LOCATIONS.includes(trimmed) ||
    /Las Mercedes/i.test(trimmed)
  ) {
    return isWorkshop ? DEFAULT_WORKSHOP_LOCATION : undefined;
  }
  return trimmed;
}

/**
 * Extracts workshop information from the course's content field or isLive flag.
 */
export function parseWorkshopDetails(
  content: string | null | undefined,
  isLive: boolean = false,
  title?: string
): WorkshopDetails {
  const titleImpliesWorkshop = !!title && /workshop|taller|presencial/i.test(title);
  const isWorkshop = isLive || titleImpliesWorkshop;

  if (!content) {
    return {
      isWorkshop,
      location: resolveWorkshopLocation(undefined, isWorkshop),
      workshopDate: isWorkshop ? WORKSHOP_DATE_PENDING : undefined,
      workshopTime: undefined,
    };
  }

  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null) {
      const explicitIsWorkshop = parsed.isWorkshop !== undefined ? Boolean(parsed.isWorkshop) : isWorkshop;
      const storedDate = typeof parsed.workshopDate === "string" ? parsed.workshopDate.trim() : "";
      const storedTime = typeof parsed.workshopTime === "string" ? parsed.workshopTime.trim() : "";
      return {
        isWorkshop: explicitIsWorkshop,
        slug: parsed.slug,
        spots: parsed.spots,
        location: resolveWorkshopLocation(parsed.location, explicitIsWorkshop),
        workshopDate: storedDate || (explicitIsWorkshop ? WORKSHOP_DATE_PENDING : undefined),
        // Sin fecha/hora guardadas no inventamos horario público.
        workshopTime: storedTime || undefined,
        notes: parsed.notes,
      };
    }
  } catch {
    // If content is just plain text
    return {
      isWorkshop,
      location: resolveWorkshopLocation(content, isWorkshop),
      workshopDate: isWorkshop ? WORKSHOP_DATE_PENDING : undefined,
      workshopTime: undefined,
    };
  }

  return {
    isWorkshop,
    location: resolveWorkshopLocation(undefined, isWorkshop),
    workshopDate: isWorkshop ? WORKSHOP_DATE_PENDING : undefined,
    workshopTime: undefined,
  };
}

/**
 * Serializes workshop details to store in the content field.
 */
export function serializeWorkshopDetails(details: WorkshopDetails, existingContent?: string | null): string {
  let existing: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(existingContent ?? "");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) existing = parsed;
  } catch {
    // Legacy plain-text content has no structured fields to preserve.
  }
  return JSON.stringify({
    ...existing,
    isWorkshop: details.isWorkshop,
    slug: details.slug ?? existing.slug,
    spots: details.spots ?? existing.spots,
    location: details.location?.trim() || DEFAULT_WORKSHOP_LOCATION,
    workshopDate: details.workshopDate?.trim() || "",
    workshopTime: details.workshopDate?.trim()
      ? details.workshopTime?.trim() || ""
      : "",
    notes: details.notes?.trim() || "",
  });
}

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function normalizeMonthToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Convierte "2026-10-04" o etiquetas en español a YYYY-MM-DD para inputs date. */
export function workshopDateToIso(value: string | null | undefined): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return isValidWorkshopDate(trimmed) ? trimmed : "";

  const match = trimmed.match(
    /(\d{1,2})\s+de\s+([a-záéíóúüñ]+)\s*(?:de|,)?\s*(\d{4})/i,
  );
  if (!match) return "";

  const day = Number(match[1]);
  const month = MONTH_NAME_TO_NUMBER[normalizeMonthToken(match[2])];
  const year = Number(match[3]);
  if (!month || year < 1900) return "";
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return isValidWorkshopDate(iso) ? iso : "";
}

function isValidWorkshopDate(isoDate: string): boolean {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** Fecha local sin desfase UTC: "2026-10-04" → Date a medianoche local. */
export function parseWorkshopLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Etiqueta legible en español a partir de YYYY-MM-DD. */
export function formatWorkshopDateLabel(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const label = new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseWorkshopLocalDate(isoDate));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Etiqueta pública: fecha fijada o «Programando Fecha» si aún no hay calendario. */
export function publicWorkshopDateLabel(value: string | null | undefined): string {
  const iso = workshopDateToIso(value);
  return iso ? formatWorkshopDateLabel(iso) : WORKSHOP_DATE_PENDING;
}

/** Horario público solo si hay fecha y hora fijadas; si no, no se muestra. */
export function publicWorkshopTimeLabel(
  date: string | null | undefined,
  time: string | null | undefined,
): string | undefined {
  const trimmedTime = time?.trim() || "";
  if (!workshopDateToIso(date) || !trimmedTime) return undefined;
  return trimmedTime;
}

/** True solo cuando el workshop tiene fecha y hora programadas (listo para reserva). */
export function hasFixedWorkshopSchedule(
  date: string | null | undefined,
  time: string | null | undefined,
): boolean {
  return Boolean(publicWorkshopTimeLabel(date, time));
}

/**
 * Normaliza la fecha del admin al guardar.
 * Vacío o etiquetas pendientes → ""; fechas inválidas con forma de fecha → error.
 */
export function resolveWorkshopDateForSave(
  value: string | null | undefined,
): { date: string; error?: string } {
  const trimmed = value?.trim() || "";
  if (!trimmed) return { date: "" };

  const iso = workshopDateToIso(trimmed);
  if (iso) return { date: iso };

  const looksLikeDate =
    /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ||
    /\d{1,2}\s+de\s+[a-záéíóúüñ]+/i.test(trimmed);
  if (looksLikeDate) {
    return { date: "", error: "Selecciona una fecha válida para el workshop." };
  }

  return { date: "" };
}

/**
 * Fecha + hora al guardar. Sin fecha → horario vacío.
 * Con fecha → el horario es obligatorio.
 */
export function resolveWorkshopScheduleForSave(
  dateValue: string | null | undefined,
  timeValue: string | null | undefined,
): { date: string; time: string; error?: string } {
  const dateResult = resolveWorkshopDateForSave(dateValue);
  if (dateResult.error) return { date: "", time: "", error: dateResult.error };

  const time = timeValue?.trim() || "";
  if (!dateResult.date) return { date: "", time: "" };
  if (!time) {
    return {
      date: dateResult.date,
      time: "",
      error: "Indica el horario del workshop junto con la fecha.",
    };
  }
  return { date: dateResult.date, time };
}
