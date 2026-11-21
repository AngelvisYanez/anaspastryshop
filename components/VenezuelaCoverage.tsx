import Link from "next/link";
import { Globe2, MapPin, MonitorPlay } from "lucide-react";
import { FAQ_ITEMS, ONLINE_REGIONS } from "@/lib/seo";

/**
 * Alcance de los cursos online y la formación presencial.
 * Sin landings por ciudad.
 */
export default function VenezuelaCoverage() {
  return (
    <section
      className="py-16 md:py-20 bg-section-alt border-y border-card-border"
      aria-labelledby="coverage-heading"
    >
      <div className="page-container">
        <div className="max-w-3xl mb-10 md:mb-12">
          <h2
            id="coverage-heading"
            className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight"
          >
            Cursos online para todo el mundo y workshops presenciales
          </h2>
          <p className="text-muted font-medium mt-3 leading-relaxed">
            Estudia pastelería en español desde cualquier país o practica en persona con Anais Flores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <MonitorPlay size={18} aria-hidden />
              <h3 className="font-display font-bold text-foreground text-lg">
                Cursos online globales
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Aprende pastelería y repostería desde cualquier lugar del mundo, a tu ritmo, con
              módulos en video y técnicas profesionales paso a paso.
            </p>
            <Link
              href="/cursos"
              className="text-sm font-bold text-accent hover:underline inline-block"
            >
              Explorar cursos online →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <MapPin size={18} aria-hidden />
              <h3 className="font-display font-bold text-foreground text-lg">
                Workshops presenciales
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Dedica 8 horas a practicar técnicas de pastelería con la guía de Anais Flores y todos los insumos incluidos.
            </p>
            <Link
              href="/workshops"
              className="text-sm font-bold text-accent hover:underline inline-block"
            >
              Ver workshops presenciales →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Globe2 size={18} aria-hidden />
              <h3 className="font-display font-bold text-foreground text-lg">
                Comunidad hispanohablante
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Formamos emprendedoras y apasionadas de la repostería en Venezuela, Latinoamérica,
              España, EE.UU. y donde hables español.
            </p>
            <Link
              href="/nosotros"
              className="text-sm font-bold text-accent hover:underline inline-block"
            >
              Conoce a Anais Flores →
            </Link>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Cursos online disponibles en
          </h3>
          <ul className="flex flex-wrap gap-2">
            {ONLINE_REGIONS.map((region) => (
              <li
                key={region}
                className="text-xs font-medium text-muted border border-card-border rounded-lg px-3 py-1.5 bg-card"
              >
                {region}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-card-border pt-10">
          <h3 className="font-display text-xl md:text-2xl font-black text-foreground mb-6">
            Preguntas frecuentes
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <dt className="font-bold text-foreground text-sm mb-2">{item.question}</dt>
                <dd className="text-sm text-muted leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
