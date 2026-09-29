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

const DEFAULT_WORKSHOP_LOCATION = WORKSHOP_LOCATION;
const DEFAULT_WORKSHOP_TIME = "09:00 AM — 05:00 PM";

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
      workshopDate: isWorkshop ? "Sábado próximo — Consultar fecha" : undefined,
      workshopTime: isWorkshop ? DEFAULT_WORKSHOP_TIME : undefined,
    };
  }

  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null) {
      const explicitIsWorkshop = parsed.isWorkshop !== undefined ? Boolean(parsed.isWorkshop) : isWorkshop;
      return {
        isWorkshop: explicitIsWorkshop,
        slug: parsed.slug,
        spots: parsed.spots,
        location: resolveWorkshopLocation(parsed.location, explicitIsWorkshop),
        workshopDate: parsed.workshopDate || (explicitIsWorkshop ? "Fecha confirmada al reservar" : undefined),
        workshopTime: parsed.workshopTime || (explicitIsWorkshop ? DEFAULT_WORKSHOP_TIME : undefined),
        notes: parsed.notes,
      };
    }
  } catch {
    // If content is just plain text
    return {
      isWorkshop,
      location: resolveWorkshopLocation(content, isWorkshop),
      workshopDate: isWorkshop ? "Fecha confirmada al reservar" : undefined,
      workshopTime: isWorkshop ? DEFAULT_WORKSHOP_TIME : undefined,
    };
  }

  return {
    isWorkshop,
    location: resolveWorkshopLocation(undefined, isWorkshop),
    workshopDate: isWorkshop ? "Fecha confirmada al reservar" : undefined,
    workshopTime: isWorkshop ? DEFAULT_WORKSHOP_TIME : undefined,
  };
}

/**
 * Serializes workshop details to store in the content field.
 */
export function serializeWorkshopDetails(details: WorkshopDetails): string {
  return JSON.stringify({
    isWorkshop: details.isWorkshop,
    slug: details.slug,
    spots: details.spots,
    location: details.location?.trim() || DEFAULT_WORKSHOP_LOCATION,
    workshopDate: details.workshopDate?.trim() || "",
    workshopTime: details.workshopTime?.trim() || DEFAULT_WORKSHOP_TIME,
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(
    /(\d{1,2})\s+de\s+([a-záéíóúüñ]+)\s*(?:de|,)?\s*(\d{4})/i,
  );
  if (!match) return "";

  const day = Number(match[1]);
  const month = MONTH_NAME_TO_NUMBER[normalizeMonthToken(match[2])];
  const year = Number(match[3]);
  if (!month || day < 1 || day > 31 || year < 1900) return "";

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
