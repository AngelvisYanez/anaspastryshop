import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dedupeWorkshopRows } from "@/lib/data/workshop-schedule";
import { courseImageUrl } from "@/lib/data/course-image-url";
import { getCompactCourseImages } from "@/lib/data/compact-course-images";

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
        image: false,
        updatedAt: true,
        content: true,
        isLive: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const images = await getCompactCourseImages(rows.map((row) => row.id));
    return dedupeWorkshopRows(
      rows.map((row) => ({
        ...row,
        image: courseImageUrl(row.id, images.get(row.id), row.updatedAt),
      })),
    );
  } catch (error) {
    console.error("Unable to load published workshops:", error);
    return [];
  }
}
