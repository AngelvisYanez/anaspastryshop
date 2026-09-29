import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhatYouGet from "@/components/WhatYouGet";
import Testimonials from "@/components/Testimonials";
import Achievements from "@/components/Achievements";
import CapacitacionesTabs from "@/components/CapacitacionesTabs";
import VenezuelaCoverage from "@/components/VenezuelaCoverage";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { resolveCourseCover } from "@/lib/data/onlineCourseCovers";
import type { FormacionCardData } from "@/components/FormacionCard";
import { WORKSHOPS_DATA, toFormacionCard } from "@/lib/data/workshops";
import { ONLINE_COURSES_DATA, toOnlineFormacionCard } from "@/lib/data/online-courses";
import { buildFaqJsonLd, buildPageMetadata, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

function staticCatalog(): { workshops: FormacionCardData[]; onlineCourses: FormacionCardData[] } {
  return {
    workshops: WORKSHOPS_DATA.map((w) => toFormacionCard(w)),
    onlineCourses: ONLINE_COURSES_DATA.map((c) => toOnlineFormacionCard(c)),
  };
}

async function getData() {
  "use cache";
  cacheLife("hours");
  cacheTag("home-data", "cursos", "planes");

  interface CourseRow {
    id: string;
    slug: string | null;
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
    const slug = w.isWorkshop ? w.slug : c.slug ?? undefined;
    return {
      id: c.id,
      slug,
      title: c.title,
      description: c.description,
      price: c.price,
      image: resolveCourseCover({
        title: c.title,
        slug: slug ?? c.slug ?? undefined,
        image: c.image,
        isWorkshop: w.isWorkshop,
      }),
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

  try {
    const [workshops, onlineCourses] = await Promise.all([
      prisma.curso
        .findMany({
          where: { category: "Workshops Presenciales" },
          select: {
            id: true,
            slug: true,
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
            slug: true,
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

    if (workshops.length === 0 && onlineCourses.length === 0) {
      return staticCatalog();
    }

    return { workshops, onlineCourses };
  } catch {
    return staticCatalog();
  }
}

export default async function Home() {
  const { workshops, onlineCourses } = await getData();

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={buildFaqJsonLd()} />
      <Navbar />

      <Hero />

      <section className="py-20 md:py-24 page-container">
        <div className="mb-10 md:mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Workshops & Cursos Online
          </h2>
          <p className="text-muted font-medium mt-3 max-w-2xl">
            Talleres presenciales en Coro, Falcón (Venezuela), y cursos online disponibles en cualquier país.
          </p>
        </div>

        <CapacitacionesTabs workshops={workshops} onlineCourses={onlineCourses} />
      </section>

      <WhatYouGet />

      <Testimonials />

      <Achievements />

      <VenezuelaCoverage />

      <section className="py-16 md:py-20 page-container">
        <div className="border-t border-card-border pt-12 md:pt-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-3">
              Capacítate hoy
            </h2>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              Reserva un workshop en Coro o empieza un curso online desde donde estés. Técnicas profesionales con Anais Flores, insumos incluidos en presencial y aprendizaje a tu ritmo en online.
            </p>
          </div>
          <Link
            href="/cursos"
            className="shrink-0 bg-accent-solid text-white px-8 py-4 rounded-xl font-bold text-base inline-flex items-center justify-center gap-3 hover:bg-accent-solid-hover transition-colors"
          >
            Reserva tu cupo <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
