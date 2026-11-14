import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { getWorkshopBySlug } from "@/lib/data/workshops";
import { parseWorkshopDetails, publicWorkshopDateLabel, publicWorkshopTimeLabel } from "@/lib/utils/workshop";

async function getPublishedFormations() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cursos");
  return prisma.curso.findMany({
      where: { OR: [
        { status: "PUBLISHED" },
        { status: "SCHEDULED", publishedAt: { lte: new Date() } },
      ] },
      select: { id: true, slug: true, title: true, price: true, totalClasses: true, totalHours: true, isLive: true, content: true },
      orderBy: { createdAt: "desc" },
  });
}

export async function GET() {
  try {
    const rows = await getPublishedFormations();
    const workshops = [];
    const courses = [];
    for (const row of rows) {
      const details = parseWorkshopDetails(row.content, row.isLive, row.title);
      if (details.isWorkshop) {
        const catalog = getWorkshopBySlug(details.slug ?? row.slug ?? "");
        workshops.push({
          id: row.id,
          title: row.title,
          href: catalog ? `/workshop/${catalog.slug}` : `/cursos/${row.slug ?? row.id}`,
          price: row.price,
          spots: details.spots ?? catalog?.spots,
          schedule: publicWorkshopDateLabel(details.workshopDate),
          time: publicWorkshopTimeLabel(details.workshopDate, details.workshopTime),
        });
      } else {
        courses.push({ id: row.id, title: row.title, href: `/cursos/${row.slug ?? row.id}`, price: row.price, totalClasses: row.totalClasses, totalHours: row.totalHours });
      }
    }
    return Response.json({ workshops, courses }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load navigation formations:", error);
    return Response.json({ error: "No se pudieron cargar las formaciones." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
