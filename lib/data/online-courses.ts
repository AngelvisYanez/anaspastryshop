import type { FormacionCardData } from "@/components/FormacionCard";

export interface OnlineCourseItem {
  /** Identificador de la copia de marketing. El id real vive en `Curso.id`. */
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  price: number;
  totalHours: number;
  totalClasses: number;
  level: string;
  category: string;
  image: string;
  badge?: string;
  includes: string[];
}

/**
 * Copia de marketing de los cursos online. La fuente de verdad para contenido,
 * precio y estado es la tabla `Curso`; aquí solo vive el copy y el slug público,
 * que debe coincidir con `Curso.slug`.
 */
export const ONLINE_COURSES_DATA: OnlineCourseItem[] = [
  {
    id: "cake-de-pina",
    slug: "cake-de-pina",
    title: "Cake de Piña",
    shortTitle: "Cake de Piña",
    subtitle: "Bizcocho esponjoso, relleno y glaseado con técnica profesional, paso a paso en video",
    description:
      "Curso online 100% práctico para elaborar un cake de piña desde cero: bizcocho esponjoso, relleno y glaseado con técnica profesional, paso a paso en video.",
    price: 45,
    totalHours: 12,
    totalClasses: 18,
    level: "Desde Cero",
    category: "Cursos Online",
    image: "/curso-online-cake-de-pina.png",
    badge: "Más Vendido",
    includes: [
      "18 lecciones en video HD paso a paso",
      "Acceso ilimitado y de por vida a la plataforma",
      "Recetario descargable con formulaciones exactas",
      "Certificado digital al finalizar",
    ],
  },
  {
    id: "merengue-italiano",
    slug: "merengue-italiano",
    title: "Merengue Italiano",
    shortTitle: "Merengue Italiano",
    subtitle: "Merckert, punto de merengue, estabilidad del batido y uso en rellenos y acabados",
    description:
      "Masterclass online de merengue italiano: Merckert, punto de merengue, estabilidad del batido y su uso en rellenos y acabados de alta pastelería.",
    price: 35,
    totalHours: 8,
    totalClasses: 10,
    level: "Todos los niveles",
    category: "Cursos Online",
    image: "/curso-online-merengue-italiano.png",
    badge: "Masterclass Pro",
    includes: [
      "10 lecciones especializadas de nivel pro",
      "Guía de solución de problemas de horneado",
      "Tablas de proporciones para diferentes moldes",
      "Certificado digital de finalización",
    ],
  },
];

export function getAllOnlineCourses(): OnlineCourseItem[] {
  return ONLINE_COURSES_DATA;
}

export function toOnlineFormacionCard(
  course: OnlineCourseItem,
  overrides: Partial<FormacionCardData> = {}
): FormacionCardData {
  return {
    id: course.id,
    slug: course.slug,
    // El id de marketing (`cake-de-pina`) también sirve como bagId: el checkout
    // de bolsa lo resuelve contra `Curso.slug`.
    bagId: course.slug || course.id,
    title: course.shortTitle || course.title,
    description: course.description,
    price: course.price,
    image: course.image,
    category: course.category,
    level: course.level,
    totalHours: course.totalHours,
    totalClasses: course.totalClasses,
    isWorkshop: false,
    hasAccess: false,
    ...overrides,
  };
}

export function getOnlineCourseBySlug(slugOrId: string): OnlineCourseItem | undefined {
  if (!slugOrId) return undefined;
  const clean = slugOrId.toLowerCase().trim();
  return ONLINE_COURSES_DATA.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.slug.toLowerCase() === clean ||
      c.title.toLowerCase().includes(clean)
  );
}
