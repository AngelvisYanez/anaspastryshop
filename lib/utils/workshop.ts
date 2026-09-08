export interface WorkshopDetails {
  isWorkshop: boolean;
  slug?: string;
  spots?: number;
  location?: string;
  workshopDate?: string;
  workshopTime?: string;
  notes?: string;
}

const DEFAULT_WORKSHOP_LOCATION = "Caracas, Las Mercedes — Sede Ana's Pastry Shop";
const DEFAULT_WORKSHOP_TIME = "09:00 AM — 05:00 PM";

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
      location: isWorkshop ? DEFAULT_WORKSHOP_LOCATION : undefined,
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
        location: parsed.location || (explicitIsWorkshop ? DEFAULT_WORKSHOP_LOCATION : undefined),
        workshopDate: parsed.workshopDate || (explicitIsWorkshop ? "Fecha confirmada al reservar" : undefined),
        workshopTime: parsed.workshopTime || (explicitIsWorkshop ? DEFAULT_WORKSHOP_TIME : undefined),
        notes: parsed.notes,
      };
    }
  } catch {
    // If content is just plain text
    return {
      isWorkshop,
      location: content.trim() || (isWorkshop ? DEFAULT_WORKSHOP_LOCATION : undefined),
      workshopDate: isWorkshop ? "Fecha confirmada al reservar" : undefined,
      workshopTime: isWorkshop ? DEFAULT_WORKSHOP_TIME : undefined,
    };
  }

  return {
    isWorkshop,
    location: isWorkshop ? DEFAULT_WORKSHOP_LOCATION : undefined,
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
