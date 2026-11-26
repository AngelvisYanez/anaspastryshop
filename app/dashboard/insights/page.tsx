import Link from "next/link";
import { Activity, Eye, Layers, MousePointer2 } from "lucide-react";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HEATMAP_COLUMNS, HEATMAP_ROWS, insightPath, sectionLabel } from "@/lib/site-insights";

const number = new Intl.NumberFormat("es-VE");
const panel = "rounded-2xl border border-card-border bg-card p-5 sm:p-6";
const select = "w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground";
const pageLabel = (path: string) => path === "/" ? "Inicio (/)" : path;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadInsights(days: number, path: string, mobile: boolean) {
  const events = prisma.siteInsightEvent;
  if (!events) return null;

  const createdAt = { gte: new Date(Date.now() - days * 86_400_000) };
  const selectedPage = { path, mobile, createdAt };

  const [traffic, sectionEvents, clickCells] = await Promise.all([
    events.groupBy({
      by: ["path", "kind"],
      where: { createdAt, kind: { in: ["PAGE_VIEW", "CLICK"] } },
      _count: { _all: true },
    }),
    events.groupBy({
      by: ["section", "kind"],
      where: { ...selectedPage, section: { not: null } },
      _count: { _all: true },
    }),
    events.groupBy({
      by: ["cell"],
      where: { ...selectedPage, kind: "CLICK", cell: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const pages = new Map<string, { views: number; clicks: number }>();
  let views = 0;
  let clicks = 0;
  for (const event of traffic) {
    const metrics = pages.get(event.path) ?? { views: 0, clicks: 0 };
    if (event.kind === "PAGE_VIEW") {
      metrics.views = event._count._all;
      views += metrics.views;
    } else {
      metrics.clicks = event._count._all;
      clicks += metrics.clicks;
    }
    pages.set(event.path, metrics);
  }
  const rankedPages = [...pages].sort((a, b) => b[1].views - a[1].views || a[0].localeCompare(b[0]));
  const pageOptions = new Set(["/", path, ...rankedPages.map(([page]) => page)]);

  const sections = new Map<string, { views: number; clicks: number }>();
  for (const event of sectionEvents) {
    if (!event.section) continue;
    const metrics = sections.get(event.section) ?? { views: 0, clicks: 0 };
    if (event.kind === "CLICK") metrics.clicks = event._count._all;
    if (event.kind === "SECTION_VIEW") metrics.views = event._count._all;
    sections.set(event.section, metrics);
  }
  const rankedSections = [...sections].sort((a, b) => b[1].clicks - a[1].clicks || b[1].views - a[1].views);
  const cells = new Map(clickCells.map(({ cell, _count }) => [cell, _count._all]));
  const maxCell = clickCells.reduce((max, item) => Math.max(max, item._count._all), 0);
  const pageClicks = clickCells.reduce((sum, item) => sum + item._count._all, 0);

  return { views, clicks, rankedPages, pageOptions, rankedSections, cells, maxCell, pageClicks };
}

export default async function InsightsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { periodo, pagina, dispositivo } = await searchParams;
  const days = periodo === "7" ? 7 : periodo === "90" ? 90 : 30;
  const path = (typeof pagina === "string" && insightPath(pagina)) || "/";
  const device = dispositivo === "movil" ? "movil" : "escritorio";
  const report = await loadInsights(days, path, device === "movil").catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return { migrationPending: true } as const;
    }
    throw error;
  });

  if (!report || "migrationPending" in report) {
    return (
      <section className={`mx-auto max-w-7xl ${panel}`}>
        <h1 className="font-display text-3xl font-extrabold">Insights</h1>
        <p className="mt-2 text-sm text-muted">
          {report
            ? "La base de datos todavía requiere la migración de Insights."
            : "El servidor necesita reiniciarse con el cliente Prisma actualizado para habilitar Insights."}
        </p>
      </section>
    );
  }

  const { views, clicks, rankedPages, pageOptions, rankedSections, cells, maxCell, pageClicks } = report;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <Activity size={17} aria-hidden="true" /> Analítica del sitio público
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Insights</h1>
        <p className="mt-2 text-sm text-muted">Consulta qué páginas se visitan y dónde hacen clic las personas.</p>
      </header>

      <form key={`${days}-${path}-${device}`} action="/dashboard/insights" className={`${panel} grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_2fr_1fr_auto] xl:items-end`}>
        <label className="grid min-w-0 gap-1.5 text-sm font-semibold">
          Período
          <select name="periodo" defaultValue={days} className={select}>
            {[7, 30, 90].map((range) => <option key={range} value={range}>Últimos {range} días</option>)}
          </select>
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-semibold">
          Página del mapa y las secciones
          <select name="pagina" defaultValue={path} className={select}>
            {[...pageOptions].map((page) => <option key={page} value={page}>{pageLabel(page)}</option>)}
          </select>
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-semibold">
          Pantalla del mapa y las secciones
          <select name="dispositivo" defaultValue={device} className={select}>
            <option value="escritorio">Escritorio</option>
            <option value="movil">Móvil</option>
          </select>
        </label>
        <button className="rounded-lg bg-accent-solid px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-solid-hover">
          Aplicar filtros
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Vistas de página", value: views, Icon: Eye },
          { label: "Páginas visitadas", value: rankedPages.filter(([, metrics]) => metrics.views > 0).length, Icon: Layers },
          { label: "Clics registrados", value: clicks, Icon: MousePointer2 },
        ].map(({ label, value, Icon }) => (
          <div key={label} className={panel}>
            <p className="flex items-center gap-2 text-sm font-semibold text-muted">
              <Icon size={16} aria-hidden="true" /> {label}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold tabular-nums">{number.format(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="min-w-0 space-y-6">
          <section className={panel}>
            <h2 className="font-display text-lg font-bold">Tráfico por página</h2>
            <p className="mt-1 text-sm text-muted">Totales de todas las pantallas. Selecciona una página para ver su mapa.</p>
            {rankedPages.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Todavía no hay actividad registrada en este período.</p>
            ) : (
              <div className="mt-4 max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-muted">
                    <tr><th scope="col" className="py-2 text-left">Página</th><th scope="col" className="px-3 text-right">Vistas</th><th scope="col" className="text-right">Clics</th></tr>
                  </thead>
                  <tbody>
                    {rankedPages.map(([page, metrics]) => (
                      <tr key={page} className="border-t border-card-border">
                        <th scope="row" className="py-2.5 text-left font-medium [overflow-wrap:anywhere]">
                          <Link
                            href={{ pathname: "/dashboard/insights", query: { periodo: days, pagina: page, dispositivo: device } }}
                            aria-current={page === path ? "true" : undefined}
                            className="text-accent underline-offset-4 hover:underline aria-[current=true]:font-bold"
                          >
                            {pageLabel(page)}
                          </Link>
                        </th>
                        <td className="px-3 text-right tabular-nums">{number.format(metrics.views)}</td>
                        <td className="text-right tabular-nums">{number.format(metrics.clicks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={panel}>
            <h2 className="font-display text-lg font-bold">Actividad por sección</h2>
            <p className="mt-1 text-sm text-muted">Cada sección visible se cuenta una vez por vista de página.</p>
            {rankedSections.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Todavía no hay actividad por sección con estos filtros.</p>
            ) : (
              <div className="mt-4 max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-muted">
                    <tr><th scope="col" className="py-2 text-left">Sección</th><th scope="col" className="px-3 text-right">Vistas</th><th scope="col" className="text-right">Clics</th></tr>
                  </thead>
                  <tbody>
                    {rankedSections.map(([section, metrics]) => (
                      <tr key={section} className="border-t border-card-border">
                        <th scope="row" className="py-2.5 text-left font-medium">{sectionLabel(section)}</th>
                        <td className="px-3 text-right tabular-nums">{number.format(metrics.views)}</td>
                        <td className="text-right tabular-nums">{number.format(metrics.clicks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className={panel}>
          <h2 className="font-display text-lg font-bold">Mapa de calor de clics</h2>
          <p className="mt-1 text-sm text-muted [overflow-wrap:anywhere]">
            {pageLabel(path)} · {device === "movil" ? "Móvil" : "Escritorio"} · {number.format(pageClicks)} clics
          </p>
          <figure className="mt-5">
            <div className="mb-2 flex justify-between gap-3 text-xs text-muted">
              <span>Parte superior</span>
              <span>{maxCell > 0 ? `Máximo por zona: ${number.format(maxCell)}` : "Sin clics registrados"}</span>
            </div>
            <div
              role="img"
              aria-label={`Cuadrícula del mapa de calor con ${number.format(pageClicks)} clics. Máximo de ${number.format(maxCell)} por zona.`}
              className="grid gap-0.5 rounded-xl border border-card-border bg-background p-2"
              style={{ gridTemplateColumns: `repeat(${HEATMAP_COLUMNS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: HEATMAP_COLUMNS * HEATMAP_ROWS }, (_, cell) => {
                const count = cells.get(cell) ?? 0;
                return (
                  <div
                    key={cell}
                    title={`Fila ${Math.floor(cell / HEATMAP_COLUMNS) + 1}, columna ${cell % HEATMAP_COLUMNS + 1} · ${number.format(count)} clics`}
                    className="h-2.5 rounded-xs bg-section-alt sm:h-3.5"
                    style={count ? { backgroundColor: `color-mix(in srgb, #c2410c ${20 + 80 * Math.sqrt(count / maxCell)}%, #fed7aa)` } : undefined}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>Parte inferior</span>
              <span className="flex items-center gap-2">Menos <span aria-hidden="true" className="h-2 w-16 rounded-full bg-linear-to-r from-orange-200 to-orange-700" /> Más</span>
            </div>
            <figcaption className="mt-4 text-xs leading-relaxed text-muted">
              La cuadrícula representa la página completa. Los colores más intensos indican zonas con más clics.
            </figcaption>
          </figure>
        </section>
      </div>
      <p className="text-xs text-muted">Cada carga o navegación a una página pública suma una vista. Una misma persona puede generar varias vistas.</p>
    </div>
  );
}
