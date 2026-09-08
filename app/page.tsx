import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhatYouGet from "@/components/WhatYouGet";
import Testimonials from "@/components/Testimonials";
import Achievements from "@/components/Achievements";
import CapacitacionesTabs from "@/components/CapacitacionesTabs";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import type { FormacionCardData } from "@/components/FormacionCard";

async function getData() {
  "use cache";
  cacheLife("hours");
  cacheTag("home-data", "cursos", "planes");

  interface CourseRow {
    id: string;
    title: string;
    category: string;
    image: string | null;
    price: number;
    description: string | null;
    level: string | null;
    totalHours: number | null;
    totalClasses: number | null;
    isLive: boolean;
    content: string | null;
    _count: { courseModules: number };
  }

  const toCard = (c: CourseRow): FormacionCardData => {
    const w = parseWorkshopDetails(c.content, c.isLive, c.title);
    return {
      id: c.id,
      slug: w.slug,
      title: c.title,
      description: c.description,
      price: c.price,
      image: c.image,
      category: c.category,
      level: c.level,
      totalHours: c.totalHours,
      totalClasses: c.totalClasses,
      modulesCount: c._count.courseModules,
      isWorkshop: w.isWorkshop,
      workshopLocation: w.location,
      workshopDate: w.workshopDate,
      workshopTime: w.workshopTime,
      hasAccess: false,
    };
  };

  const [workshops, onlineCourses] = await Promise.all([
    prisma.curso
      .findMany({
        where: { category: "Workshops Presenciales" },
        select: {
          id: true,
          title: true,
          category: true,
          image: true,
          price: true,
          description: true,
          level: true,
          totalHours: true,
          totalClasses: true,
          isLive: true,
          content: true,
          _count: { select: { courseModules: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
      .then((rows) => (rows as CourseRow[]).map(toCard)),
    prisma.curso
      .findMany({
        where: { category: "Cursos Online" },
        select: {
          id: true,
          title: true,
          category: true,
          image: true,
          price: true,
          description: true,
          level: true,
          totalHours: true,
          totalClasses: true,
          isLive: true,
          content: true,
          _count: { select: { courseModules: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
      .then((rows) => (rows as CourseRow[]).map(toCard)),
  ]);
  return { workshops, onlineCourses };
}

export default async function Home() {
  const { workshops, onlineCourses } = await getData();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <Hero />

      <section className="py-24 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
            Catálogo de Capacitaciones
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Workshops & Cursos Online
          </h2>
          <p className="text-muted font-medium mt-2">
            Formación práctica desde cero con técnicas profesionales de pastelería y panadería.
          </p>
        </div>

        <CapacitacionesTabs workshops={workshops} onlineCourses={onlineCourses} />
      </section>

      <WhatYouGet />

      <Testimonials />

      <Achievements />

      <section className="py-24 px-4 md:px-10 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-[#25092F] dark:to-[#180520] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 border border-card-border shadow-xl">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-4">
              Capacítate hoy: invertir en conocimientos produce siempre los mejores beneficios.
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Reserva formalmente tu cupo y aprende técnicas infalibles con la orientación personalizada de Anais Flores.
            </p>
            <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <Sparkles size={14} /> Workshops diseñados desde cero · Insumos incluidos · 8 horas de práctica
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0 w-full sm:w-auto">
            <Link
              href="/cursos"
              className="w-full sm:w-auto bg-accent text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-accent-hover hover:scale-105 transition-all shadow-lg shadow-pink-600/30 whitespace-nowrap"
            >
              Reserva tu cupo ahora mismo <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}