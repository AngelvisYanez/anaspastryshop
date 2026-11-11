import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EMBEDDED_COURSE_IMAGE_MARKER } from "@/lib/data/course-image-url";

/**
 * Compact image refs for `"use cache"` catalogs: embedded covers collapse to a
 * short marker so multi-MB base64 never enters the data cache payload.
 */
export async function getCompactCourseImages(
  ids: string[],
): Promise<Map<string, string | null>> {
  if (ids.length === 0) return new Map();

  const rows = await prisma.$queryRaw<Array<{ id: string; image: string | null }>>(
    Prisma.sql`
      SELECT id,
        CASE
          WHEN image IS NULL OR image = '' THEN NULL
          WHEN image LIKE 'data:image/%' THEN ${EMBEDDED_COURSE_IMAGE_MARKER}
          ELSE image
        END AS image
      FROM "Curso"
      WHERE id IN (${Prisma.join(ids)})
    `,
  );

  return new Map(rows.map((row) => [row.id, row.image]));
}
