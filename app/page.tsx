import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ForYou from "@/components/ForYou";
import VideoIntro from "@/components/VideoIntro";
import WhatYouGet from "@/components/WhatYouGet";
import AboutRami from "@/components/AboutRami";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import CoursesCarousel from "@/components/CoursesCarousel";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

async function getData() {
  const [courses, plan] = await Promise.all([
    prisma.curso.findMany({
      select: { id: true, title: true, category: true, price: true, level: true, image: true, totalHours: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
      select: { price: true, name: true },
      orderBy: { price: "asc" },
    }),
  ]);
  return { courses, plan };
}

export default async function Home() {
  const { courses, plan } = await getData();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <Hero />

      <ForYou />

      <VideoIntro />

      <WhatYouGet />

      <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Catálogo
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Explorar Cursos
            </h2>
            <p className="text-muted font-medium mt-2">
              Formación práctica y técnica para potenciar tu perfil crediticio.
            </p>
          </div>
          <Link href="/cursos">
            <button className="bg-card border border-card-border px-6 py-3 rounded-full font-bold text-sm hover:bg-card-hover transition-colors shadow-sm text-foreground whitespace-nowrap">
              Ver todos los cursos
            </button>
          </Link>
        </div>

        <CoursesCarousel courses={courses} />
      </section>

      <AboutRami />

      <Testimonials />

      <CtaBanner price={plan?.price ?? null} planName={plan?.name ?? null} />

      <section className="py-24 px-4 md:px-10 max-w-5xl mx-auto">
        <div className="bg-section-alt rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 border border-card-border">
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Empieza hoy
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-4">
              Tu historial crediticio empieza con una decisión.
            </h2>
            <p className="text-muted leading-relaxed">
              Accede a todos nuestros cursos, sesiones en vivo y recursos actualizados con una sola membresía.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Link href="/membresia">
              <button className="bg-foreground text-background px-10 py-5 rounded-full font-bold text-base flex items-center gap-3 hover:opacity-90 hover:scale-105 transition-all shadow-lg whitespace-nowrap">
                Ver membresía <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/cursos" className="text-sm text-muted hover:text-foreground transition-colors font-medium">
              Explorar cursos gratis →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
