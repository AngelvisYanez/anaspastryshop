export interface OnlineCourseItem {
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

export const ONLINE_COURSES_DATA: OnlineCourseItem[] = [
  {
    id: "cmtoy976b000jwqakyc5ktvf6",
    slug: "reposteria-desde-cero",
    title: "Curso Online: Repostería & Pastelería Desde Cero",
    shortTitle: "Repostería Desde Cero",
    subtitle: "Aprende las bases de la pastelería profesional a tu propio ritmo",
    description:
      "Formación 100% online con acceso de por vida. Aprende desde el batido y horneado perfecto de bizcochos hasta formulación de cremas estables y decoraciones modernas.",
    price: 45,
    totalHours: 12,
    totalClasses: 18,
    level: "Desde Cero",
    category: "Cursos Online",
    image: "/foto-4.webp",
    badge: "Más Vendido",
    includes: [
      "18 lecciones en video HD paso a paso",
      "Acceso ilimitado y de por vida a la plataforma",
      "Recetario descargable con formulaciones exactas",
      "Certificado digital al finalizar",
    ],
  },
  {
    id: "cmtoy97az000lwqak79c9cho5",
    slug: "bizcochos-y-rellenos-gourmet",
    title: "Masterclass Online: Técnicas de Bizcochos & Rellenos Gourmet Estables",
    shortTitle: "Bizcochos & Rellenos Gourmet",
    subtitle: "Formulaciones estructurales y cremas resistentes al clima en video HD",
    description:
      "Comprende el porqué de cada ingrediente y paso. Formulaciones exactas de bizcochos que no se hunden, cremas estables al clima y acabados de alta pastelería.",
    price: 35,
    totalHours: 8,
    totalClasses: 10,
    level: "Todos los niveles",
    category: "Cursos Online",
    image: "/foto-6.webp",
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

export function getOnlineCourseBySlug(slugOrId: string): OnlineCourseItem | undefined {
  if (!slugOrId) return undefined;
  const clean = slugOrId.toLowerCase().trim();
  return ONLINE_COURSES_DATA.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.slug.toLowerCase() === clean ||
      clean.includes(c.slug.toLowerCase()) ||
      c.title.toLowerCase().includes(clean)
  );
}
