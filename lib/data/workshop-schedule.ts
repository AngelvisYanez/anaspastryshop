import { WORKSHOPS_DATA, toFormacionCard, type WorkshopItem } from "@/lib/data/workshops";
import type { FormacionCardData } from "@/components/FormacionCard";

/**
 * Fechas confirmadas del cronograma presencial.
 * `date` es YYYY-MM-DD en zona local (Venezuela).
 */
export interface WorkshopSession {
  id: string;
  workshopSlug: string;
  date: string;
  time?: string;
}

export const WORKSHOP_SESSIONS: WorkshopSession[] = [
  { id: "ses-2026-10-04-tortas-basicas", workshopSlug: "tortas-basicas", date: "2026-10-04" },
  { id: "ses-2026-10-11-tortas-especiales", workshopSlug: "tortas-especiales", date: "2026-10-11" },
  { id: "ses-2026-10-18-candy-bar", workshopSlug: "candy-bar", date: "2026-10-18" },
  {
    id: "ses-2026-10-22-fondant",
    workshopSlug: "fondant-basico",
    date: "2026-10-22",
    time: "2:00 PM",
  },
  {
    id: "ses-2026-10-25-buttercream",
    workshopSlug: "buttercream-de-chocolate-blanco",
    date: "2026-10-25",
  },
  {
    id: "ses-2026-11-01-buttercream-adv",
    workshopSlug: "buttercream-de-chocolate-blanco-avanzado",
    date: "2026-11-01",
  },
  { id: "ses-2026-11-08-ganache", workshopSlug: "ganache-de-chocolate", date: "2026-11-08" },
  { id: "ses-2026-11-22-tortas-basicas", workshopSlug: "tortas-basicas", date: "2026-11-22" },
  { id: "ses-2026-11-29-candy-bar", workshopSlug: "candy-bar", date: "2026-11-29" },
  {
    id: "ses-2026-12-03-fondant",
    workshopSlug: "fondant-basico",
    date: "2026-12-03",
    time: "2:00 PM",
  },
  { id: "ses-2026-12-06-tortas-especiales", workshopSlug: "tortas-especiales", date: "2026-12-06" },
  {
    id: "ses-2026-12-13-buttercream",
    workshopSlug: "buttercream-de-chocolate-blanco",
    date: "2026-12-13",
  },
  { id: "ses-2026-12-20-ganache", workshopSlug: "ganache-de-chocolate", date: "2026-12-20" },
  { id: "ses-2027-01-17-tortas-basicas", workshopSlug: "tortas-basicas", date: "2027-01-17" },
  {
    id: "ses-2027-01-21-fondant",
    workshopSlug: "fondant-basico",
    date: "2027-01-21",
    time: "2:00 PM",
  },
  {
    id: "ses-2027-01-24-buttercream-adv",
    workshopSlug: "buttercream-de-chocolate-blanco-avanzado",
    date: "2027-01-24",
  },
  { id: "ses-2027-01-31-candy-bar", workshopSlug: "candy-bar", date: "2027-01-31" },
  { id: "ses-2027-02-07-tortas-especiales", workshopSlug: "tortas-especiales", date: "2027-02-07" },
];

export interface CalendarWorkshopEvent {
  session: WorkshopSession;
  workshop: WorkshopItem;
  card: FormacionCardData;
}

function workshopBySlug(slug: string): WorkshopItem | undefined {
  return WORKSHOPS_DATA.find((w) => w.slug === slug);
}

export function getCalendarEvents(): CalendarWorkshopEvent[] {
  return WORKSHOP_SESSIONS.flatMap((session) => {
    const workshop = workshopBySlug(session.workshopSlug);
    if (!workshop) return [];

    const dateLabel = formatSessionDateLabel(session.date);
    const time = session.time ?? workshop.startTime;

    return [
      {
        session,
        workshop,
        card: toFormacionCard(workshop, {
          workshopDate: dateLabel,
          workshopTime: time,
        }),
      },
    ];
  });
}

export function getEventsByDateKey(
  events: CalendarWorkshopEvent[]
): Record<string, CalendarWorkshopEvent[]> {
  return events.reduce<Record<string, CalendarWorkshopEvent[]>>((acc, event) => {
    const key = event.session.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

/** Fecha local sin desfase UTC: "2026-10-04" → Date a medianoche local. */
export function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatSessionDateLabel(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  return new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
