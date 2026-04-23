"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ForYou from "@/components/ForYou";
import VideoIntro from "@/components/VideoIntro";
import WhatYouGet from "@/components/WhatYouGet";
import Features from "@/components/Features";
import TrustedBy from "@/components/TrustedBy";
import AboutRami from "@/components/AboutRami";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <Hero />

      <ForYou />

      <VideoIntro />

      <WhatYouGet />

      <Features />

      <TrustedBy />

      <AboutRami />

      <Testimonials />

      <CtaBanner />

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Próximos Cursos
            </h2>
            <p className="text-muted font-medium mt-2">
              Potencia tus habilidades con formación real y técnica.
            </p>
          </div>
          <button className="bg-card border border-card-border px-6 py-3 rounded-full font-bold text-sm hover:bg-card-hover transition-colors shadow-sm text-foreground">
            Explorar Catálogo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CourseCard
            title="Edición de Video High-Impact"
            category="Producción"
            price={45}
            icon="🎬"
          />
          <CourseCard
            title="Estrategias de Digital Trafficker"
            category="Marketing"
            price={60}
            icon="📈"
          />
          <CourseCard
            title="Next.js 15 & Prisma Mastery"
            category="Desarrollo"
            price={55}
            icon="💻"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
