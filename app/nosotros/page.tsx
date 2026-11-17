import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { SITE_WHATSAPP } from "@/lib/seo";

const WHATSAPP_HREF = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(
  "Hola Anais! He leído tu página y quiero más información sobre los talleres."
)}`;

const CHARACTERISTICS = [
  { number: "01", title: "Pasión por enseñar", description: "Comparte las técnicas, recetas y métodos que ha aprendido en más de seis años de oficio y formación." },
  { number: "02", title: "Formación desde cero", description: "Sus talleres están pensados para que puedas comenzar sin experiencia previa y avanzar con seguridad." },
  { number: "03", title: "Atención al detalle", description: "Explica el porqué de cada paso, desde el comportamiento de los ingredientes hasta el punto de batido y horneado." },
  { number: "04", title: "Cercanía en cada clase", description: "Acompaña el aprendizaje con workshops presenciales en Coro y cursos online para estudiar desde cualquier lugar." },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative flex min-h-[32rem] items-end overflow-hidden bg-brand-purple text-white sm:min-h-[38rem] lg:min-h-[46rem]" aria-labelledby="sobre-anais-heading">
        <Image src="/Anais (2).jpeg" alt="" fill priority sizes="100vw" className="object-cover object-[center_28%] lg:object-[center_12%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-purple via-brand-purple/55 to-brand-purple/15 lg:bg-gradient-to-r lg:from-brand-purple lg:via-brand-purple/65 lg:to-transparent" />
        <div className="page-container relative z-10 w-full pb-16 pt-32 sm:pb-20 lg:pb-28">
          <div className="max-w-2xl">
            <h1 id="sobre-anais-heading" className="font-display text-5xl font-black tracking-tight text-balance sm:text-7xl lg:text-8xl">Sobre Anais</h1>
            <p className="mt-5 border-l-4 border-on-purple-accent pl-5 font-serif text-xl text-white/90 sm:text-2xl">Esta es mi historia</p>
          </div>
        </div>
      </section>

      <section className="page-container py-20 sm:py-24 lg:py-32" aria-labelledby="historia-heading">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-section-alt shadow-[0_25px_70px_-35px_rgba(43,9,56,0.55)]">
              <Image src="/Anais (1).jpeg" alt="Anais Flores sonriendo en su cocina junto a tres batidoras" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-center" />
            </div>
            <span className="absolute -bottom-5 right-4 rounded-full bg-accent-solid px-5 py-3 text-sm font-bold text-white shadow-lg sm:right-8">Anais Flores</span>
          </div>
          <div className="pt-5 lg:pt-0">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Mi camino en la pastelería</span>
            <h2 id="historia-heading" className="mt-4 max-w-xl font-display text-3xl font-black leading-tight text-balance text-foreground sm:text-5xl">¡Hola! Soy Anais Flores</h2>
            <p className="mt-4 font-semibold text-accent">Ingeniera química, panadera y pastelera profesional</p>
            <div className="mt-8 max-w-prose space-y-5 text-base leading-relaxed text-muted sm:text-lg">
              <p>Llevo más de seis años en el mundo de la pastelería y dictando talleres. En Ana&apos;s Pastry Shop comparto lo que he aprendido con quienes quieren descubrir este oficio o llevar sus habilidades más lejos.</p>
              <p>Mis workshops presenciales en Coro, Falcón, y mis cursos online están desarrollados desde cero. No necesitas conocimientos previos: en cada clase enseño las técnicas, las recetas y los métodos para que puedas desenvolverte con seguridad.</p>
              <p>Creo en entender el porqué de cada proceso, no solo en seguir una receta. Ese conocimiento es lo que te permite crear con confianza y repetir tus resultados.</p>
            </div>
            <blockquote className="mt-9 border-l-4 border-accent pl-5 font-serif text-xl italic leading-relaxed text-foreground sm:text-2xl">“El conocimiento nos hace responsables. Invertir en conocimientos produce siempre los mejores beneficios.”</blockquote>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-solid px-6 py-3 font-bold text-white transition hover:bg-accent-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><MessageCircle size={18} aria-hidden="true" /> Escribir a Anais</a>
              <Link href="/workshops" className="inline-flex min-h-11 items-center rounded-xl border border-card-border bg-card px-6 py-3 font-bold text-foreground transition hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Ver workshops</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-alt py-20 sm:py-24 lg:py-28" aria-labelledby="caracteristicas-heading">
        <div className="page-container">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Mi forma de enseñar</span>
            <h2 id="caracteristicas-heading" className="mt-4 font-display text-3xl font-black text-balance text-foreground sm:text-5xl">Lo que encontrarás conmigo</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.85fr)] lg:items-stretch lg:gap-10">
            <dl className="grid gap-4 sm:grid-cols-2">
              {CHARACTERISTICS.map((item) => (
                <div key={item.number} className="rounded-2xl border border-card-border bg-card p-7 shadow-card sm:p-8">
                  <span className="font-serif text-3xl font-bold text-accent/60" aria-hidden="true">{item.number}</span>
                  <dt className="mt-5 font-display text-xl font-bold text-foreground">{item.title}</dt>
                  <dd className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{item.description}</dd>
                </div>
              ))}
            </dl>
            <div className="relative min-h-80 overflow-hidden rounded-2xl bg-brand-purple sm:min-h-96 lg:min-h-0">
              <Image src="/Anais (3).jpeg" alt="Anais Flores sonriente, con los brazos cruzados en su cocina" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover object-[center_30%]" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
