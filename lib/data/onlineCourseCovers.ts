import type { FormacionCardData } from "@/components/FormacionCard";

/**
 * Portadas dedicadas de los cursos online que viven en /public.
 *
 * Son imágenes específicas de cursos online concretos, así que se resuelven por
 * título/slug en lugar de depender del campo `image` de la base de datos.
 * El campo `image` de la BD se sigue usando como fallback.
 */
interface CoverEntry {
  file: string;
  /** Slugs de curso que usan esta portada (coincidencia exacta, tiene prioridad). */
  slugs?: string[];
  /** Palabras clave normalizadas (sin acentos) como fallback por título. */
  keywords: string[];
}

const ONLINE_COURSE_COVERS: CoverEntry[] = [
  {
    file: "/curso-online-cake-de-pina.png",
    slugs: ["cake-de-pina", "torta-de-pina"],
    keywords: ["cake de pina", "torta de pina", "pastel de pina", "cake de pineapple"],
  },
  {
    file: "/curso-online-merengue-italiano.png",
    slugs: ["merengue-italiano-online", "merengue-italiano"],
    keywords: ["merengue italiano"],
  },
];

/** Minúsculas y sin acentos, para comparar títulos de forma tolerante. */
export function normalize(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Devuelve la portada dedicada del curso online si existe en /public,
 * o el valor original (normalmente `image` de la BD) si no hay coincidencia.
 */
export function resolveCourseCover(
  course: Pick<FormacionCardData, "title" | "slug" | "image" | "isWorkshop">
): string | null {
  if (course.isWorkshop) return course.image ?? null;

  const slug = normalize(course.slug);
  if (slug) {
    const bySlug = ONLINE_COURSE_COVERS.find((entry) =>
      entry.slugs?.some((candidate) => normalize(candidate) === slug)
    );
    if (bySlug) return bySlug.file;
  }

  const haystack = normalize(`${course.title} ${course.slug ?? ""}`);
  if (!haystack) return course.image ?? null;

  const match = ONLINE_COURSE_COVERS.find((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword))
  );

  return match ? match.file : course.image ?? null;
}

/**
 * Devuelve una copia de la card con la portada resuelta. Aplicar siempre que
 * se construya una `FormacionCardData` a partir de la base de datos.
 */
export function withCourseCover<T extends FormacionCardData>(card: T): T {
  return { ...card, image: resolveCourseCover(card) };
}

export const ONLINE_COURSE_COVER_FILES = ONLINE_COURSE_COVERS.map((entry) => entry.file);
