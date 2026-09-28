import type { Prisma } from "@prisma/client";

/**
 * Tokens que pueden llegar desde la bolsa: cuid de `Curso`, `Curso.slug`,
 * legacySlug de workshops (`workshop-tortas-basicas`) o id de marketing del
 * catálogo estático (`cake-de-pina`).
 */
export function bagIdLookupOr(ids: string[]): Prisma.CursoWhereInput[] {
  const clauses: Prisma.CursoWhereInput[] = [];

  for (const raw of ids) {
    const id = raw.trim();
    if (!id) continue;

    clauses.push({ id }, { slug: id }, { content: { contains: id } });

    // Legacy: bagId = "workshop-tortas-basicas" pero el slug canónico es "tortas-basicas".
    if (id.startsWith("workshop-")) {
      const withoutPrefix = id.slice("workshop-".length);
      if (withoutPrefix) {
        clauses.push({ slug: withoutPrefix }, { content: { contains: withoutPrefix } });
      }
    }
  }

  return clauses;
}

export function courseMatchesBagId(
  course: { id: string; slug?: string | null; content?: string | null; title?: string },
  bagId: string
): boolean {
  const id = bagId.trim();
  if (!id) return false;
  if (course.id === id) return true;
  if (course.slug === id) return true;
  if (course.content?.includes(id)) return true;
  if (id.startsWith("workshop-")) {
    const withoutPrefix = id.slice("workshop-".length);
    if (withoutPrefix && (course.slug === withoutPrefix || course.content?.includes(withoutPrefix))) {
      return true;
    }
  }
  return false;
}
