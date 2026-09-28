import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormacionCard from "@/components/FormacionCard";
import { WORKSHOPS_DATA, toFormacionCard } from "@/lib/data/workshops";
import { Clock, Users, MapPin, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Workshops Presenciales de Pastelería & Panadería",
  description:
    "Descubre los talleres presenciales intensivos de 8 horas en Caracas (Las Mercedes). Cupos reducidos, 100% prácticos con todos los insumos incluidos y dictados por la Chef Anais Flores.",
};

export default function WorkshopsPage() {
  const workshops = WORKSHOPS_DATA;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <section className="relative flex flex-col justify-center pt-28 pb-14 xl:pt-36 xl:pb-16 bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep text-white overflow-hidden">
        <div className="page-container relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Workshops Presenciales de{" "}
            <span className="text-on-purple-accent">Pastelería & Alta Repostería</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-white/85 max-w-prose mx-auto font-medium leading-relaxed">
            Diseñados desde cero con metodología 100% práctica. Aprende las técnicas, recetas y secretos de la mano de la Chef Anais Flores en grupos reducidos de 3 a 8 personas.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 page-container w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12 text-sm font-semibold text-foreground">
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <Clock size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm">8 horas de práctica</span>
          </div>
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <Users size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm">Grupos de 3 a 8</span>
          </div>
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <CheckCircle2 size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm">Materiales incluidos</span>
          </div>
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <MapPin size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm">Las Mercedes, Caracas</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-card-border">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Elige tu próximo workshop
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted font-medium max-w-md">
            Reserva con el <strong>50% de anticipo</strong> para congelar tu puesto y cancela el 50% restante el día del taller al ingresar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {workshops.map((workshop) => (
            <div key={workshop.slug}>
              <FormacionCard course={toFormacionCard(workshop)} />
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-section-alt border-y border-card-border">
        <div className="page-container">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Condiciones de inscripción
            </h2>
            <p className="text-sm text-muted font-medium mt-2">
              Para brindarte la mejor experiencia y asegurar insumos frescos individuales:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="space-y-2">
              <p className="text-accent font-black text-sm tracking-wide">01 — Anticipo del 50%</p>
              <h3 className="font-black text-foreground text-base">Reserva tu cupo</h3>
              <p className="text-sm text-muted leading-relaxed">
                Tu cupo se congela con el 50% de anticipo. El resto se liquida el día del taller en sede.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-accent font-black text-sm tracking-wide">02 — Asistencia</p>
              <h3 className="font-black text-foreground text-base">Anticipo no reembolsable</h3>
              <p className="text-sm text-muted leading-relaxed">
                El anticipo es no reembolsable e intransferible: insumos y estaciones se preparan por participante.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-accent font-black text-sm tracking-wide">03 — Incluye</p>
              <h3 className="font-black text-foreground text-base">Insumos y almuerzo</h3>
              <p className="text-sm text-muted leading-relaxed">
                Materiales, utensilios, almuerzo completo y recetario. Solo trae envase de traslado si aplica.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
