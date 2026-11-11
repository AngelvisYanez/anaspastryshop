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
import type { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  parseWorkshopDetails,
  publicWorkshopDateLabel,
  publicWorkshopTimeLabel,
} from "@/lib/utils/workshop";
import { resolveCourseCover } from "@/lib/data/onlineCourseCovers";
import { courseImageUrl } from "@/lib/data/course-image-url";
import { getCompactCourseImages } from "@/lib/data/compact-course-images";
import type { FormacionCardData } from "@/components/FormacionCard";
import { getAllWorkshops, getWorkshopBySlug, toFormacionCard } from "@/lib/data/workshops";
import { ONLINE_COURSES_DATA, toOnlineFormacionCard } from "@/lib/data/online-courses";
import { buildFaqJsonLd, buildPageMetadata, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

function staticCatalog(): { workshops: FormacionCardData[]; onlineCourses: FormacionCardData[] } {
  return {
    workshops: getAllWorkshops().map((workshop) =>
      toFormacionCard(workshop, {
        workshopDate: publicWorkshopDateLabel(workshop.schedule),
        workshopTime: publicWorkshopTimeLabel(workshop.schedule, workshop.startTime),
      }),
    ),
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
    updatedAt: Date;
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
    const catalog = w.isWorkshop
      ? getWorkshopBySlug(w.slug ?? c.slug ?? "")
      : undefined;
    const slug = w.isWorkshop ? (catalog?.slug ?? w.slug ?? c.slug ?? undefined) : c.slug ?? undefined;
    return {
      id: c.id,
      slug,
      bagId: c.id,
      detailHref: w.isWorkshop && !catalog
        ? `/cursos/${c.slug ?? c.id}`
        : undefined,
      title: catalog?.shortTitle ?? c.title,
      description: c.description,
      price: c.price,
      image: resolveCourseCover({
        title: catalog?.shortTitle ?? c.title,
        slug: slug ?? c.slug ?? undefined,
        image: courseImageUrl(c.id, c.image, c.updatedAt),
        isWorkshop: w.isWorkshop,
      }),
      category: c.category,
      level: c.level,
      totalHours: c.totalHours,
      totalClasses: c.totalClasses,
      modulesCount: c._count.courseModules,
      isWorkshop: w.isWorkshop,
      workshopLocation: w.location,
      workshopDate: publicWorkshopDateLabel(w.workshopDate),
      workshopTime: publicWorkshopTimeLabel(w.workshopDate, w.workshopTime),
      hasAccess: false,
    };
  };

  const courseSelect = {
    id: true,
    slug: true,
    title: true,
    category: true,
    image: false as const,
    updatedAt: true,
    price: true,
    description: true,
    level: true,
    totalHours: true,
    totalClasses: true,
    isLive: true,
    content: true,
    _count: { select: { courseModules: true } },
  };

  async function loadCards(where: Prisma.CursoWhereInput): Promise<FormacionCardData[]> {
    const rows = await prisma.curso.findMany({
      where,
      select: courseSelect,
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    const images = await getCompactCourseImages(rows.map((row) => row.id));
    return rows.map((row) =>
      toCard({ ...row, image: images.get(row.id) ?? null }),
    );
  }

  try {
    const published = {
      OR: [
        { status: "PUBLISHED" as const },
        { status: "SCHEDULED" as const, publishedAt: { lte: new Date() } },
      ],
    };

    // Usar isLive (igual que /workshops): filtrar solo por category deja la home
    // vacía si hay filas publicadas con categoría distinta o legacy.
    const [workshopRows, onlineRows] = await Promise.all([
      loadCards({ isLive: true, ...published }),
      loadCards({ isLive: false, ...published }),
    ]);

    const workshops = workshopRows.length > 0 ? workshopRows : staticCatalog().workshops;
    const onlineCourses =
      onlineRows.length > 0 ? onlineRows : staticCatalog().onlineCourses;

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
