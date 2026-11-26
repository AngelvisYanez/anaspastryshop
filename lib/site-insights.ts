export const HEATMAP_COLUMNS = 12;
export const HEATMAP_ROWS = 24;
export const INSIGHTS_BATCH_SIZE = 20;

const publicPages = new Set([
  "/", "/cursos", "/workshops", "/workshops/calendario", "/pasteleria",
  "/pasantias", "/nosotros", "/iniciar-sesion", "/registro", "/pagar/bolsa",
  "/pagar/pasteleria", "/pagar/confirmacion", "/pagar/curso",
  "/olvide-mi-contrasena", "/restablecer-contrasena", "/unsubscribe",
]);

export function insightPath(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (publicPages.has(path)) return path;
  if (/^\/pagar\/curso\/[a-z0-9-]{1,128}$/i.test(path)) return "/pagar/curso";
  if (/^\/(cursos|workshop)\/[a-z0-9-]{1,140}$/i.test(path)) return path;
  return null;
}

const sections: Record<string, string> = {
  navegacion: "Navegación",
  portada: "Portada",
  capacitaciones: "Cursos y workshops",
  beneficios: "Beneficios",
  testimonios: "Testimonios",
  logros: "Logros",
  cobertura: "Cobertura en Venezuela",
  explorar: "Capacítate hoy",
  contenido: "Contenido principal",
  pie: "Pie de página",
  catalogo: "Catálogo",
  detalles: "Detalles",
  calendario: "Calendario",
  inscripcion: "Condiciones de inscripción",
  servicios: "Servicios de pastelería",
  pedidos: "Proceso de pedido",
  pagos: "Opciones de pago",
  historia: "Historia de Anais",
  caracteristicas: "Lo que encontrarás con Anais",
};

export function isInsightSection(value: unknown): value is string {
  return typeof value === "string" &&
    (Object.hasOwn(sections, value) || /^seccion-[1-9][0-9]{0,2}$/.test(value));
}

export function sectionLabel(section: string) {
  return Object.hasOwn(sections, section) ? sections[section] : `Sección ${section.slice(8)}`;
}

export type InsightEvent =
  | { kind: "PAGE_VIEW" }
  | { kind: "SECTION_VIEW"; section: string }
  | { kind: "CLICK"; section: string; cell: number };

export function isInsightEvent(value: unknown): value is InsightEvent {
  if (typeof value !== "object" || value === null || !("kind" in value)) return false;
  if (value.kind === "PAGE_VIEW") return true;
  if (!("section" in value) || !isInsightSection(value.section)) return false;
  if (value.kind === "SECTION_VIEW") return true;
  return value.kind === "CLICK" && "cell" in value && typeof value.cell === "number" &&
    Number.isInteger(value.cell) && value.cell >= 0 && value.cell < HEATMAP_COLUMNS * HEATMAP_ROWS;
}
