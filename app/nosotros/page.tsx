import { ArrowRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { SITE_WHATSAPP } from "@/lib/seo";

const WHATSAPP_HREF = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(
  "Hola Anais! He leído tu página y quiero más información sobre los talleres."
)}`;

const PRINCIPLES = [
  {
    title: "Técnica que se puede repetir",
    desc: "Cada clase explica el comportamiento de los ingredientes, el punto de batido y la temperatura de horneado, para que la receta se sostenga y el resultado no dependa de la suerte.",
  },
  {
    title: "Desde cero, sin experiencia previa",
    desc: "Los talleres están pensados para quien empieza. En la sesión se enseñan las técnicas, las recetas y el método para trabajar con soltura y seguridad.",
  },
  {
    title: "El porqué de cada paso",
    desc: "El conocimiento nos hace responsables. Enseñar el motivo de cada proceso es lo que permite decidir con criterio, no solo copiar una receta.",
  },
  {
    title: "Más de seis años de oficio",
    desc: "Una trayectoria en pastelería profesional y en la formación de personas que quieren emprender o afinar su técnica.",
  },
];

const GALLERY = [
  {
    src: "/foto-4.webp",
    alt: "Anais Flores de pie detrás de la mesa, con la torta decorada y tres bizcochos",
    caption: "Anais con la mesa completa",
  },
  {
    src: "/foto-1.webp",
    alt: "Anais Flores sonriendo junto a la torta de cerezas y los bizcochos del frente",
    caption: "Retrato junto a la torta",
  },
  {
    src: "/foto-2.webp",
    alt: "Torta decorada en verde, rosa y amarillo, coronada con tres cerezas",
    caption: "Torta decorada",
  },
  {
    src: "/foto-7.webp",
    alt: "Bizcocho con glaseado blanco y ralladura de limón, con la torta al fondo",
    caption: "Bizcocho de limón",
  },
  {
    src: "/foto-5.webp",
    alt: "Bizcocho marmoleado con cobertura de chocolate, nueces y perlas de cacao",
    caption: "Chocolate y nueces",
  },
  {
    src: "/foto-6.webp",
    alt: "Bizcocho de chocolate con hilos de ganache y perlas de azúcar rosa y blanca",
    caption: "Bizcocho de chocolate",
  },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-brand-purple pt-28 pb-14 xl:pt-36 xl:pb-16 text-white">
        <div className="page-container relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] mb-5 text-balance">
            El arte de la técnica, la{" "}
            <span className="text-on-purple-accent">pasión de la pastelería.</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/85 leading-relaxed text-pretty">
            La historia, el método y la mesa de Anais Flores. Workshops en Coro, Falcón, y cursos online para estudiar desde cualquier país.
          </p>
        </div>
      </section>

      <div className="page-container page-section">
        <section className="mx-auto max-w-2xl">
          <figure className="mx-auto mb-8 w-full max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-card-border shadow-[0_18px_40px_-24px_rgba(40,16,48,0.55)]">
              <Image
                src="/foto-3.webp"
                alt="Retrato de Anais Flores, chef pastelera, con su torta decorada y dos bizcochos"
                fill
                priority
                sizes="(max-width: 640px) 100vw, 384px"
                className="object-cover object-[center_18%]"
              />
            </div>
          </figure>

          <h2 className="font-display text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight text-balance">
            ¡Hola! Soy Anais Flores
          </h2>
          <p className="mt-4 text-sm font-semibold text-accent">
            Ingeniera química, panadera y pastelera profesional
          </p>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/85 max-w-prose">
            <p>
              Llevo más de seis años en la pastelería y dictando talleres. En Ana&apos;s Pastry Shop formo con workshops presenciales en Coro, Falcón, y con cursos online para quien estudia desde cualquier país.
            </p>
            <p>
              Los talleres están desarrollados desde cero. No hace falta conocimiento previo: en cada sesión enseño las técnicas, las recetas y los métodos para que puedas desenvolverte con seguridad.
            </p>
          </div>

          <blockquote className="mt-8 border-t border-card-border pt-6">
            <p className="font-display text-xl sm:text-2xl font-bold leading-snug text-foreground text-balance">
              &ldquo;El conocimiento nos hace responsables. Invertir en conocimientos produce siempre los mejores beneficios.&rdquo;
            </p>
          </blockquote>

          <p className="mt-6 text-sm leading-relaxed text-muted max-w-prose">
            Lee con calma la información de cada workshop. Si decides capacitarte, escríbeme y resolvemos las dudas que queden.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent-solid text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-accent-solid-hover transition shadow-[0_10px_24px_-16px_rgba(40,16,48,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Escribir a Anais
            </a>
            <Link
              href="/workshops"
              className="inline-flex items-center justify-center bg-card border border-card-border hover:bg-card-hover text-foreground px-6 py-3.5 rounded-xl font-bold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ver workshops
            </Link>
            <Link
              href="/cursos"
              className="inline-flex items-center justify-center text-accent px-2 py-3.5 font-bold text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
            >
              Cursos online
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-4xl border-t border-card-border pt-16">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground tracking-tight text-balance max-w-xl">
            Cómo está pensada la formación
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title}>
                <dt className="font-display text-lg font-bold text-foreground leading-snug">
                  {item.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {item.desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-20 border-t border-card-border pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground tracking-tight text-balance">
                Retratos y pastelería
              </h2>
            </div>
            <Link
              href="/pasteleria"
              className="text-accent text-sm font-bold hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
            >
              Ver pastelería
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
            {GALLERY.map((photo) => (
              <li key={photo.src}>
                <figure>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-card-border bg-card">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-sm text-muted">
                    {photo.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </main>
  );
}
