import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import WorkshopCalendarClient from "./WorkshopCalendarClient";
import {
  getCalendarEvents,
  getEventsByDateKey,
} from "@/lib/data/workshop-schedule";
import { CalendarDays, Clock, Users } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Calendario de Workshops Presenciales en Coro, Falcón",
  description:
    "Fechas confirmadas de talleres presenciales de Ana's Pastry Shop en Coro, Falcón, Venezuela. Reserva tu cupo y viaja desde cualquier ciudad del país.",
  path: "/workshops/calendario",
});

export default function WorkshopsCalendarioPage() {
  const events = getCalendarEvents();
  const eventsByDate = getEventsByDateKey(events);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <PageHero
        backHref="/workshops"
        backLabel="Cartelera de workshops"
        title={
          <>
            Calendario de{" "}
            <span className="text-on-purple-accent">Workshops</span>
          </>
        }
        subtitle="Fechas confirmadas en Coro, Falcón. En desktop, pasa el cursor sobre una sesión para abrir la ficha del taller; en móvil, tócala."
      />

      <section className="py-8 sm:py-12 page-container w-full flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <CalendarDays size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Fechas confirmadas</span>
          </div>
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <Clock size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Jornadas de ~8 horas</span>
          </div>
          <div className="flex items-center gap-2.5 border border-card-border rounded-xl px-3 py-3 bg-card">
            <Users size={16} className="text-accent shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Cupos reducidos 3–8</span>
          </div>
        </div>

        <WorkshopCalendarClient events={events} eventsByDate={eventsByDate} />

        <p className="mt-10 text-center text-sm text-muted font-medium">
          ¿Prefieres ver todos los talleres juntos?{" "}
          <Link href="/workshops" className="text-accent font-bold hover:underline">
            Ir a la cartelera
          </Link>
        </p>
      </section>

      <Footer />
    </main>
  );
}
