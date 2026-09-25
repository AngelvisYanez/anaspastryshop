import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormacionCard, { type FormacionCardData } from "@/components/FormacionCard";
import { WORKSHOPS_DATA } from "@/lib/data/workshops";
import { Clock, Users, MapPin, CheckCircle2 } from "lucide-react";
import ScrollIndicator from "@/components/ScrollIndicator";

export const metadata: Metadata = {
  title: "Workshops Presenciales de Pastelería & Panadería | Ana's Pastry Shop",
  description:
    "Descubre los talleres presenciales intensivos de 8 horas en Caracas (Las Mercedes). Cupos reducidos, 100% prácticos con todos los insumos incluidos y dictados por la Chef Anais Flores.",
};

export default function WorkshopsPage() {
  const workshops = WORKSHOPS_DATA;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-24 sm:pt-40 sm:pb-32 bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#E82D8A_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Workshops Presenciales de <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-pink-200">Pastelería & Alta Repostería</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-white/85 max-w-prose mx-auto font-medium leading-relaxed">
            Diseñados desde cero con metodología 100% práctica. Aprende las técnicas, recetas y secretos de la mano de la Chef Anais Flores en grupos reducidos de 3 a 8 personas.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-white/90">
            <span className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
              <Clock size={16} className="text-pink-200" /> 8 Horas de Práctica Real
            </span>
            <span className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
              <Users size={16} className="text-pink-200" /> Grupos VIP (3 a 8 cupos)
            </span>
            <span className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
              <CheckCircle2 size={16} className="text-pink-200" /> Todos los Materiales Incluidos
            </span>
            <span className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
              <MapPin size={16} className="text-pink-200" /> Caracas, Las Mercedes
            </span>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Grid of Workshops */}
      <section className="py-16 sm:py-20 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 -mt-8 relative z-20 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-card-border">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Elige tu Próximo Workshop Presencial
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted font-medium max-w-md">
            Reserva con el <strong>50% de anticipo</strong> para congelar tu puesto y cancela el 50% restante el día del taller al ingresar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {workshops.map((workshop) => {
            const card: FormacionCardData = {
              id: workshop.legacySlug ?? workshop.id,
              slug: workshop.slug,
              title: workshop.title,
              description: workshop.description,
              price: workshop.price,
              image: workshop.image,
              category: "Workshops Presenciales",
              level: workshop.level,
              isWorkshop: true,
              workshopLocation: "Caracas, Las Mercedes — Sede Ana's Pastry Shop",
              workshopDate: workshop.schedule,
              workshopTime: workshop.startTime,
              hasAccess: false,
              bagId: workshop.legacySlug ?? workshop.id,
            };

            return (
              <div key={workshop.slug}>
                <FormacionCard course={card} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Global In-person Logistics Banner */}
      <section className="py-16 bg-section-alt border-y border-card-border">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Condiciones de Inscripción a Workshops Presenciales
            </h2>
            <p className="text-xs sm:text-sm text-muted font-medium mt-2">
              Para brindarte la mejor experiencia culinaria y asegurar los mejores insumos frescos individuales:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-card-border p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-3xl font-black text-accent leading-none">1</span>
                <h3 className="font-black text-foreground text-base">Anticipo del 50%</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed font-medium">
                Tu cupo se reserva y congela únicamente con el pago del 50% de anticipo. El 50% restante se liquida el día del taller en sede.
              </p>
            </div>

            <div className="bg-card border border-card-border p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-3xl font-black text-accent leading-none">2</span>
                <h3 className="font-black text-foreground text-base">Política de Asistencia</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed font-medium">
                El anticipo es <strong>no reembolsable</strong> e <strong>intransferible</strong> debido a que los insumos y estaciones se preparan de forma personalizada por participante.
              </p>
            </div>

            <div className="bg-card border border-card-border p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-3xl font-black text-accent leading-none">3</span>
                <h3 className="font-black text-foreground text-base">Insumos & Almuerzo</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed font-medium">
                No tienes que traer ingredientes ni utensilios especiales (salvo tu envase de traslado o base giratoria según corresponda). Incluye almuerzo completo y recetario.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
