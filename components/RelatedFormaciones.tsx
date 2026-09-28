import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import FormacionCard, { type FormacionCardData } from "@/components/FormacionCard";

export interface RelatedFormacionesProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: FormacionCardData[];
  href: string;
  ctaLabel: string;
  /** "alt" gives the soft section background, "plain" keeps it on the page background. */
  tone?: "alt" | "plain";
  columns?: 2 | 3 | 4;
}

const COLUMN_CLASSES: Record<NonNullable<RelatedFormacionesProps["columns"]>, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * "Otros workshops / otros cursos" block shown at the end of a detail page.
 * It reuses FormacionCard so the cards, portadas and CTAs are pixel-identical
 * to the ones in the catalog grids.
 */
export default function RelatedFormaciones({
  eyebrow,
  title,
  subtitle,
  items,
  href,
  ctaLabel,
  tone = "alt",
  columns = 3,
}: RelatedFormacionesProps) {
  if (!items.length) return null;

  const sectionClass =
    tone === "alt"
      ? "py-16 sm:py-20 bg-section-alt border-y border-card-border"
      : "py-16 sm:py-20";

  return (
    <section className={sectionClass} aria-labelledby="related-formaciones-title">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-card-border">
          <div className="max-w-xl">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">
                {eyebrow}
              </p>
            )}
            <h2
              id="related-formaciones-title"
              className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted font-medium mt-2">{subtitle}</p>
            )}
          </div>

          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-black uppercase tracking-wider text-accent hover:text-accent-hover transition-colors group"
          >
            {ctaLabel}
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className={`grid ${COLUMN_CLASSES[columns]} gap-6 lg:gap-8`}>
          {items.map((item) => (
            <div key={`${item.isWorkshop ? "ws" : "c"}-${item.id}`} className="h-full">
              <FormacionCard course={item} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-card-border bg-card px-5 sm:px-7 py-5 shadow-sm">
          <p className="text-xs sm:text-sm text-muted font-medium flex items-center gap-2">
            <Sparkles size={15} className="text-accent shrink-0" />
            Todos los workshops incluyen insumos, almuerzo, recetario y certificado de asistencia.
          </p>
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-2 bg-accent-solid hover:bg-accent-solid-hover text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-accent-solid/20"
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
