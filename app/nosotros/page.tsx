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

const PORTRAITS = [
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
];

const PASTRY = [
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

      <section className="bg-brand-purple pt-28 pb-14 text-white xl:pt-36 xl:pb-16">
        <div className="page-container grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:gap-x-16 lg:gap-y-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-black tracking-tight text-balance sm:text-5xl xl:text-6xl">
              ¡Hola! Soy Anais Flores
            </h1>
            <p className="mt-4 text-base font-semibold text-on-purple-accent sm:text-lg">
              Ingeniera química, panadera y pastelera profesional
            </p>
          </div>

          <figure className="w-full max-w-sm lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/15 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]">
              <Image
                src="/foto-3.webp"
                alt="Retrato de Anais Flores, chef pastelera, con su torta decorada y dos bizcochos"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 352px"
                className="object-cover object-[center_18%]"
              />
            </div>
          </figure>

          <div className="max-w-prose space-y-4 text-base leading-relaxed text-white/85 lg:col-start-1">
            <p>
              Llevo más de seis años en la pastelería y dictando talleres. En Ana&apos;s Pastry Shop formo con workshops presenciales en Coro, Falcón, y con cursos online para quien estudia desde cualquier país.
            </p>
            <p>
              Los talleres están desarrollados desde cero. No hace falta conocimiento previo: en cada sesión enseño las técnicas, las recetas y los métodos para que puedas desenvolverte con seguridad.
            </p>
          </div>
        </div>
      </section>

      <div className="page-container page-section">
        <section className="grid gap-8 border-b border-card-border pb-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,22rem)] lg:items-start lg:gap-16 lg:pb-16">
          <blockquote>
            <p className="font-display text-2xl font-bold leading-snug text-balance text-foreground sm:text-3xl">
              &ldquo;El conocimiento nos hace responsables. Invertir en conocimientos produce siempre los mejores beneficios.&rdquo;
            </p>
          </blockquote>
          <div>
            <p className="text-sm leading-relaxed text-muted">
              Lee con calma la información de cada workshop. Si decides capacitarte, escríbeme y resolvemos las dudas que queden.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent-solid px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-16px_rgba(40,16,48,0.7)] transition hover:bg-accent-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Escribir a Anais
              </a>
              <Link
                href="/workshops"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-card-border bg-card px-6 py-3.5 text-sm font-bold text-foreground transition hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Ver workshops
              </Link>
              <Link
                href="/cursos"
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-2 py-3.5 text-sm font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Cursos online
              </Link>
            </div>
          </div>
        </section>

        <section className="pt-14 lg:pt-16" aria-labelledby="metodo-heading">
          <h2
            id="metodo-heading"
            className="max-w-xl font-display text-3xl font-black tracking-tight text-balance text-foreground sm:text-4xl"
          >
            Cómo está pensada la formación
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="max-w-prose">
                <dt className="font-display text-lg font-bold leading-snug text-foreground">
                  {item.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {item.desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 border-t border-card-border pt-14 lg:mt-20 lg:pt-16" aria-labelledby="mesa-heading">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="mesa-heading"
              className="font-display text-3xl font-black tracking-tight text-balance text-foreground sm:text-4xl"
            >
              Retratos y pastelería
            </h2>
            <Link
              href="/pasteleria"
              className="inline-flex items-center gap-1 rounded-md text-sm font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ver pastelería
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <h3 className="text-sm font-bold text-foreground">Con Anais</h3>
          <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {PORTRAITS.map((photo) => (
              <li key={photo.src}>
                <figure>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-card-border bg-card">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
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

          <h3 className="mt-12 text-sm font-bold text-foreground">La mesa</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {PASTRY.map((photo) => (
              <li key={photo.src}>
                <figure>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-card-border bg-card">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
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
