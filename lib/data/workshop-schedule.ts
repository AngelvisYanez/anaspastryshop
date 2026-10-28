import { WORKSHOPS_DATA, getWorkshopBySlug, toFormacionCard } from "@/lib/data/workshops";
import type { FormacionCardData } from "@/components/FormacionCard";
import { formatWorkshopDateLabel, parseWorkshopDetails, workshopDateToIso } from "@/lib/utils/workshop";

export interface WorkshopSession {
  id: string;
  workshopSlug: string;
  date: string;
  time?: string;
}

export interface PublishedWorkshopRow {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  content: string | null;
  isLive: boolean;
  level: string | null;
  createdAt?: Date;
}

export interface CalendarWorkshopEvent {
  session: WorkshopSession;
  workshop: { slug: string; shortTitle: string; startTime: string; price: number };
  card: FormacionCardData;
  href: string;
}

/** Build one current event per published course. Undated legacy rows are not confirmed sessions. */
export function dedupeWorkshopRows(rows: PublishedWorkshopRow[]): PublishedWorkshopRow[] {
  const seen = new Set<string>();
  return [...rows]
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    .filter((row) => {
      const details = parseWorkshopDetails(row.content, row.isLive, row.title);
      const catalog = getWorkshopBySlug(details.slug ?? row.slug ?? "")
        ?? WORKSHOPS_DATA.find((item) => item.title.toLocaleLowerCase("es") === row.title.toLocaleLowerCase("es"));
      const key = catalog?.slug ?? details.slug ?? row.slug ?? row.title.toLocaleLowerCase("es");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getCalendarEvents(rows: PublishedWorkshopRow[]): CalendarWorkshopEvent[] {
  return dedupeWorkshopRows(rows).flatMap((row) => {
    const details = parseWorkshopDetails(row.content, row.isLive, row.title);
    if (!details.isWorkshop) return [];
    const date = workshopDateToIso(details.workshopDate);
    if (!date) return [];

    const catalog = getWorkshopBySlug(details.slug ?? row.slug ?? "")
      ?? WORKSHOPS_DATA.find((item) => item.title.toLocaleLowerCase("es") === row.title.toLocaleLowerCase("es"));
    const slug = catalog?.slug ?? row.slug ?? row.id;
    const href = catalog ? `/workshop/${catalog.slug}` : `/cursos/${slug}`;
    const shortTitle = catalog?.shortTitle ?? row.title;
    const startTime = details.workshopTime ?? catalog?.startTime ?? "";
    const session: WorkshopSession = { id: row.id, workshopSlug: slug, date, time: startTime };
    const card: FormacionCardData = catalog
      ? toFormacionCard(catalog, {
          id: row.id,
          bagId: row.id,
          price: row.price,
          workshopDate: formatWorkshopDateLabel(date),
          workshopTime: startTime,
        })
      : {
          id: row.id,
          bagId: row.id,
          slug,
          detailHref: href,
          title: shortTitle,
          description: row.description,
          price: row.price,
          image: row.image,
          level: row.level,
          category: "Workshops Presenciales",
          isWorkshop: true,
          workshopDate: formatWorkshopDateLabel(date),
          workshopTime: startTime,
          workshopLocation: details.location,
        };

    return [{ session, workshop: { slug, shortTitle, startTime, price: row.price }, card, href }];
  }).sort((a, b) => a.session.date.localeCompare(b.session.date) || a.workshop.shortTitle.localeCompare(b.workshop.shortTitle));
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

/** Local date without a UTC offset. */
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
