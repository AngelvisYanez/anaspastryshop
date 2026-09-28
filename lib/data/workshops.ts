import type { FormacionCardData } from "@/components/FormacionCard";

export interface WorkshopItem {
  id: string;
  slug: string;
  legacySlug?: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  price: number;
  spots: number;
  duration: string;
  startTime: string;
  schedule: string;
  level: string;
  image: string;
  isDecorationWorkshop: boolean;
  studentRequirements: string;
  realizaremos: string[];
  incluye: string[];
  notes?: string;
  badge?: string;
}

export const WORKSHOPS_DATA: WorkshopItem[] = [
  {
    id: "workshop-tortas-basicas",
    slug: "tortas-basicas",
    legacySlug: "workshop-tortas-basicas",
    title: "WORKSHOP TORTAS BÁSICAS",
    shortTitle: "Tortas Básicas",
    subtitle: "Aprende a realizar tortas desde cero y afianza métodos profesionales de horneado",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a realizar tortas desde cero y también para aquellas que deseen afianzar sus conocimientos.",
    price: 70,
    spots: 8,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Desde Cero a Principiante",
    image: "/foto-1.webp",
    isDecorationWorkshop: false,
    studentRequirements:
      "El alumno debe traer un envase grande para llevarse todas las preparaciones que realizaremos (son 5 porciones de tortas).",
    badge: "Solo 8 Cupos",
    realizaremos: [
      "Torta de vainilla y variaciones (torta sabor a limón)",
      "Torta marmoleada",
      "Torta de chocolate",
      "Torta de piña",
      "Glaseado cítrico",
      "Ganache de chocolate",
      "Muro de contención",
      "Merengue italiano (clase demostrativa)",
      "Ensamblaje, relleno y decoración de una torta alta con merengue italiano (clase demostrativa)",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Degustación de todas las preparaciones",
      "5 porciones de tortas para llevar a casa",
    ],
  },
  {
    id: "workshop-tortas-especiales",
    slug: "tortas-especiales",
    legacySlug: "workshop-tortas-especiales",
    title: "WORKSHOP TORTAS ESPECIALES",
    shortTitle: "Tortas Especiales",
    subtitle: "Recetas icónicas de alta pastelería: Red Velvet, Zanahoria, Tres Leches y Fría de Parchita",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a realizar tortas especiales con sus diferentes variaciones y también para aquellas que deseen afianzar sus conocimientos.",
    price: 80,
    spots: 8,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Todos los niveles",
    image: "/foto-7.webp",
    isDecorationWorkshop: false,
    studentRequirements:
      "El alumno debe traer un envase grande para llevarse todas las preparaciones que realizaremos (son 4 porciones de tortas).",
    badge: "Solo 8 Cupos",
    realizaremos: [
      "Torta Red velvet",
      "Torta de Zanahoria",
      "Frosting de queso crema",
      "Torta tres Leches",
      "Crema chantilly",
      "Torta fría de Parchita (biscocho genovés, crema de parchita)",
      "Chantilly de parchita",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Degustación de todas las preparaciones",
      "4 porciones de tortas para llevar a casa",
    ],
  },
  {
    id: "workshop-candy-bar",
    slug: "candy-bar",
    legacySlug: "workshop-candy-bar",
    title: "WORKSHOP CANDY BAR",
    shortTitle: "Candy Bar",
    subtitle: "Aprende a realizar dulces en presentación mini, ideales para fiestas y eventos",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a realizar dulces en presentación mini, ideales para fiestas y eventos.",
    price: 80,
    spots: 8,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Todos los niveles",
    image: "/foto-5.webp",
    isDecorationWorkshop: false,
    studentRequirements:
      "El alumno debe traer un envase grande para llevarse todas las preparaciones que realizaremos (Son 10 TIPOS DE DULCES).",
    badge: "Solo 8 Cupos",
    realizaremos: [
      "Mini Cupcakes",
      "Suspiros",
      "Cake pops",
      "Paletas de Chocolate",
      "Mini Brownies",
      "Mini Alfajores",
      "Mini Polvorosas",
      "Mini Pavlovas",
      "Trufas de Chocolate",
      "Shots de Limón/Parchita",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Degustación de todas las preparaciones",
      "10 tipos de mini dulces para llevar a casa",
    ],
  },
  {
    id: "workshop-buttercream-de-chocolate-blanco",
    slug: "buttercream-de-chocolate-blanco",
    legacySlug: "workshop-buttercream-de-chocolate-blanco",
    title: "WORKSHOP BUTTERCREAM DE CHOCOLATE BLANCO",
    shortTitle: "Buttercream de Chocolate Blanco",
    subtitle: "Domina el frisado sedoso, bordes perfectos y técnicas en torta real",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a decorar tortas desde cero y también para aquellas que deseen afianzar sus conocimientos.",
    price: 90,
    spots: 6,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Desde Cero a Intermedio",
    image: "/foto-2.webp",
    isDecorationWorkshop: true,
    studentRequirements:
      "El alumno debe traer una base giratoria (de no tener notificar que disponemos de 3 bases para solventar).",
    badge: "Solo 6 Cupos",
    realizaremos: [
      "Receta de torta de vainilla",
      "Ensamblado en torta real",
      "Relleno correcto",
      "Receta de buttercream de chocolate blanco",
      "Frisado de torta con buttercream de chocolate blanco",
      "Bordes perfectos",
      "Uso de stencil",
      "Elaboración de esferas de chocolate",
      "Muchos otros tips",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Cada participante se lleva su proyecto a casa",
      "Caja para traslado de la torta",
    ],
  },
  {
    id: "workshop-buttercream-de-chocolate-blanco-avanzado",
    slug: "buttercream-de-chocolate-blanco-avanzado",
    legacySlug: "workshop-buttercream-de-chocolate-blanco-avanzado",
    title: "WORKSHOP BUTTERCREAM DE CHOCOLATE BLANCO Avanzado",
    shortTitle: "Buttercream Blanco Avanzado (2 Niveles)",
    subtitle: "Estructura arquitectónica, montaje de tortas de 2 niveles y acabados de alta gama",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a decorar tortas de niveles con esta cubierta y también para aquellas que deseen afianzar sus conocimientos.",
    price: 150,
    spots: 6,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Intermedio a Avanzado",
    image: "/foto-3.webp",
    isDecorationWorkshop: true,
    studentRequirements:
      "El alumno debe traer una base giratoria (de no tener notificar que disponemos de 3 bases para solventar).",
    badge: "Solo 6 Cupos",
    realizaremos: [
      "Recetas de torta de vainilla",
      "Proporción ideal y distribución de la torta según niveles",
      "Ensamblado en torta real",
      "Ganache de chocolate para muro de contención",
      "Relleno correcto",
      "Receta de buttercream de chocolate blanco",
      "Frisado de torta con buttercream de chocolate blanco",
      "Bordes perfectos",
      "Montaje de tortas (2 niveles)",
      "Uso de stencil",
      "Uso de manga pastelera",
      "Muchos otros tips",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Cada participante se lleva su proyecto a casa",
      "Caja para traslado de la torta",
    ],
  },
  {
    id: "workshop-fondant-basico",
    slug: "fondant-basico",
    legacySlug: "workshop-fondant-basico",
    title: "WORKSHOP FONDANT BÁSICO",
    shortTitle: "Fondant Básico de Alta Costura",
    subtitle: "Sellado impecable en Ganache y forrado en fondant de alta costura sobre pastel real",
    description:
      "Eleva tu repostería al siguiente nivel con este workshop. Aprenderás a estructurar tortas reales con un sellado impecable en Ganache (blanco y oscuro), logrando el lienzo perfecto para un forrado en fondant de alta costura.",
    price: 160,
    spots: 3,
    duration: "Jornada intensiva personalizada",
    startTime: "2:00 PM",
    schedule: "Se realiza en días de semana (Revisar cronograma de talleres)",
    level: "Todos los niveles",
    image: "/foto-4.webp",
    isDecorationWorkshop: true,
    studentRequirements: "El alumno debe traer una base giratoria.",
    badge: "Solo 3 Cupos",
    realizaremos: [
      "Ensamblado en torta real",
      "Relleno correcto",
      "Receta Ganache de chocolate oscuro",
      "Receta Ganache de chocolate blanco",
      "Bordes perfectos",
      "Receta de fondant",
      "Cubrir pastel con fondant",
      "Modelado en Fondant (lazo)",
      "Aplicación de Papel de azúcar",
      "Muchos otros tips más",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Refrigerio",
      "Certificado de asistencia",
      "Recetario impreso",
      "Cada participante se lleva su proyecto a casa",
      "Caja para traslado de la torta",
    ],
  },
  {
    id: "workshop-ganache-de-chocolate",
    slug: "ganache-de-chocolate",
    legacySlug: "workshop-ganache-de-chocolate",
    title: "WORKSHOP GANACHE DE CHOCOLATE",
    shortTitle: "Ganache de Chocolate",
    subtitle: "Aprende formulación, sellado firme, esferas de chocolate y frisado con ganache oscuro y blanco",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a decorar tortas desde cero con esta cubierta y también para aquellas que deseen afianzar sus conocimientos.",
    price: 120,
    spots: 6,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Desde Cero a Intermedio",
    image: "/foto-6.webp",
    isDecorationWorkshop: true,
    studentRequirements:
      "El alumno debe traer una base giratoria (de no tener notificar que disponemos de 3 bases para solventar).",
    badge: "Solo 6 Cupos",
    realizaremos: [
      "Receta de torta de chocolate",
      "Ensamblado en torta real",
      "Relleno correcto",
      "Receta de ganache de chocolate oscuro",
      "Receta de ganache de chocolate blanco",
      "Frisado de torta con ganache de chocolate oscuro",
      "Bordes perfectos",
      "Uso de stencil",
      "Elaboración de esferas de chocolate",
      "Muchos otros tips",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Cada participante se lleva su proyecto a casa",
      "Caja para traslado de la torta",
    ],
  },
  {
    id: "workshop-merengue-italiano",
    slug: "merengue-italiano",
    legacySlug: "workshop-merengue-italiano",
    title: "WORKSHOP MERENGUE ITALIANO",
    shortTitle: "Merengue Italiano",
    subtitle: "Punto almíbar exacto, estabilidad, colorimetría, frisado afilado y boquillas",
    description:
      "Es un taller dirigido a todas las personas que deseen aprender a decorar tortas desde cero con esta cubierta y también para aquellas que deseen afianzar sus conocimientos.",
    price: 70,
    spots: 6,
    duration: "8 horas aproximadamente (9:00am – 4 a 5 pm)",
    startTime: "9:00 AM",
    schedule: "Día Domingo (Revisar cronograma de talleres)",
    level: "Desde Cero a Intermedio",
    image: "/curso-online-merengue-italiano.png",
    isDecorationWorkshop: true,
    studentRequirements:
      "El alumno debe traer una base giratoria (de no tener notificar que disponemos de 3 bases para solventar).",
    badge: "Solo 6 Cupos",
    realizaremos: [
      "Receta de torta de vainilla",
      "Ensamblado en torta real",
      "Relleno correcto",
      "Receta de merengue italiano",
      "Colorimetría",
      "Frisado de torta con merengue italiano",
      "Bordes perfectos",
      "Uso de manga pastelera",
      "Muchos otros tips",
    ],
    incluye: [
      "Todos los materiales y utensilios",
      "Almuerzo",
      "Certificado de asistencia",
      "Recetario impreso",
      "Cada participante se lleva su proyecto a casa",
      "Caja para traslado de la torta",
    ],
  },
];

export function getWorkshopBySlug(slug: string): WorkshopItem | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  const normalized = clean.replace(/^workshop-/, "");

  return WORKSHOPS_DATA.find((w) => {
    const wSlugClean = w.slug.toLowerCase().trim();
    const wNormalized = wSlugClean.replace(/^workshop-/, "");
    const wIdClean = w.id.toLowerCase().trim();
    const wLegacyClean = w.legacySlug?.toLowerCase().trim();

    return (
      wSlugClean === clean ||
      wNormalized === normalized ||
      wIdClean === clean ||
      wLegacyClean === clean ||
      clean === `workshop-${wNormalized}` ||
      wSlugClean === `workshop-${clean}` ||
      wIdClean === `workshop-${normalized}`
    );
  });
}

export function getAllWorkshops(): WorkshopItem[] {
  return WORKSHOPS_DATA;
}

/**
 * Single source of truth for turning a workshop into the shared card payload,
 * so every surface (catálogo, home, "otros workshops") renders identical data.
 */
export function toFormacionCard(
  workshop: WorkshopItem,
  overrides: Partial<FormacionCardData> = {}
): FormacionCardData {
  const bagId = workshop.legacySlug ?? workshop.id;

  return {
    id: bagId,
    slug: workshop.slug,
    // `shortTitle` es el nombre limpio; `title` sigue siendo la clave legacy
    // en MAYÚSCULAS con prefijo "WORKSHOP" que usa el seed para emparejar filas.
    title: workshop.shortTitle,
    description: workshop.description,
    price: workshop.price,
    // Cards de workshops usan el placeholder de marca (no fotos de producto).
    image: null,
    category: "Workshops Presenciales",
    level: workshop.level,
    isWorkshop: true,
    workshopLocation: "Caracas, Las Mercedes — Sede Ana's Pastry Shop",
    workshopDate: workshop.schedule,
    workshopTime: workshop.startTime,
    hasAccess: false,
    bagId,
    ...overrides,
  };
}

/** Workshops to feature at the bottom of a detail page, excluding the current one. */
export function getOtherWorkshops(
  current: WorkshopItem,
  limit = 3
): FormacionCardData[] {
  return getAllWorkshops()
    .filter((w) => w.slug !== current.slug && w.legacySlug !== current.slug)
    .slice(0, limit)
    .map((workshop) => toFormacionCard(workshop));
}
