import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dedupeWorkshopRows } from "@/lib/data/workshop-schedule";

export async function getPublishedWorkshopRows() {
  "use cache";
  cacheLife("minutes");
  cacheTag("workshop-dates");

  try {
    const rows = await prisma.curso.findMany({
      where: {
        isLive: true,
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", publishedAt: { lte: new Date() } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        image: true,
        content: true,
        isLive: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return dedupeWorkshopRows(rows);
  } catch (error) {
    console.error("Unable to load published workshops:", error);
    return [];
  }
}
