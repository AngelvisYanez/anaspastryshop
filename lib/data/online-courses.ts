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
    subtitle: "Torta de piña esponjosa y quesipiña, con caramelo y presentación profesional",
    description:
      "Aprende a preparar desde cero una clásica y deliciosa torta de piña esponjosa y su variación de quesipiña con un caramelo brillante en su punto exacto y una presentación de pastelería profesional.",
    price: 45,
    totalHours: 12,
    totalClasses: 12,
    level: "Desde Cero",
    category: "Cursos Online",
    image: "/curso-online-cake-de-pina.png",
    badge: "Más Vendido",
    includes: [
      "Recetario de la torta de piña",
      "Receta de quesillo",
      "Detalles y cantidades específicas para diferentes tamaños de torta de piña y quesillo",
      "Recomendaciones de ingredientes y materiales",
      "Preparación del almíbar para la torta de piña",
      "Preparación del caramelo para el quesillo",
      "Batido de la torta de piña",
      "Cómo hacer el quesillo cremoso",
      "Armado de la quesipiña (variación de torta de piña con quesillo)",
      "Desmolde de la torta de piña",
      "Tip para dar brillo o revitalizar una torta de piña de días anteriores",
      "Resultado final",
    ],
  },
  {
    id: "merengue-italiano",
    slug: "merengue-italiano",
    title: "Merengue Italiano",
    shortTitle: "Merengue Italiano",
    subtitle: "Textura sedosa, brillante y estable para decorar tortas impecables",
    description:
      "Te enseñamos el método infalible de Ana's Pastry Shop para dominar la técnica exacta del merengue italiano. Aprende a conseguir esa textura sedosa, brillante y con la estabilidad ideal para decorar tortas impecables y llevar tus postres al siguiente nivel.",
    price: 35,
    totalHours: 8,
    totalClasses: 8,
    level: "Todos los niveles",
    category: "Cursos Online",
    image: "/curso-online-merengue-italiano.png",
    badge: "Masterclass Pro",
    includes: [
      "Recetario digital con especificación de cantidades",
      "Fórmula para calcular la cantidad exacta de ingredientes según el merengue que vayas a utilizar",
      "Preparación del merengue italiano",
      "Temperatura ideal del almíbar y la mezcla",
      "Colorimetría y técnica de coloración",
      "Cómo alisar una torta",
      "Cómo manguear una torta",
      "Técnica para lograr bordes perfectos",
    ],
  },
  {
    id: "tortas-basicas-online",
    slug: "tortas-basicas-online",
    title: "Tortas Básicas",
    shortTitle: "Tortas Básicas",
    subtitle: "Vainilla, marmoleada, chocolate, chantilly y decoración",
    description:
      "Domina las preparaciones más solicitadas: la torta de vainilla, la marmoleada y la de chocolate. Incluye la crema chantilly, sus variaciones de sabor y las técnicas de decoración para dejar los postres listos.",
    price: 45,
    totalHours: 9,
    totalClasses: 9,
    level: "Desde Cero",
    category: "Cursos Online",
    image: "",
    includes: [
      "Recetario digital",
      "Preparación de torta de vainilla",
      "Preparación de torta marmoleada",
      "Preparación de torta de chocolate",
      "Preparación de ganache de chocolate",
      "Preparación de glaseado cítrico",
      "Receta de crema chantilly",
      "Variaciones de sabores de crema chantilly",
      "Relleno, decoración con crema chantilly, colorimetría y mangueado",
    ],
  },
  {
    id: "pan-de-jamon",
    slug: "pan-de-jamon",
    title: "Pan de Jamón",
    shortTitle: "Pan de Jamón",
    subtitle: "El pan de jamón venezolano, esponjoso y con el relleno tradicional",
    description:
      "Aprende a hacer un pan de jamón esponjoso, con el relleno ideal y el sabor tradicional de la mesa navideña. El curso va paso a paso para lograr un resultado de panadería profesional desde casa, aunque empieces de cero.",
    price: 35,
    totalHours: 10,
    totalClasses: 10,
    level: "Desde Cero",
    category: "Cursos Online",
    image: "",
    includes: [
      "Recetario digital",
      "Recomendación de ingredientes",
      "Preparación de la masa",
      "Amasado",
      "Armado del pan de jamón",
      "Armado del pan de jamón con queso crema",
      "Recomendaciones de cantidades",
      "Armado de rolls de jamón",
      "Levado y barnizado del pan",
      "Horneado y resultado final",
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
