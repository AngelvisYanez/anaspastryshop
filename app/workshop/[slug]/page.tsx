import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RelatedFormaciones from "@/components/RelatedFormaciones";
import { getWorkshopBySlug, getAllWorkshops, getOtherWorkshops } from "@/lib/data/workshops";
import { WorkshopDetailHero } from "./WorkshopDetailHero";
import { WorkshopDetailBody } from "./WorkshopDetailBody";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const workshops = getAllWorkshops();
  return workshops.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) {
    return {
      title: "Workshop No Encontrado",
    };
  }

  return {
    title: `${workshop.shortTitle} — Workshop Presencial`,
    description: `${workshop.subtitle}. Workshop presencial intensivo de 8 horas en Caracas (Las Mercedes). Cupo reducido de ${workshop.spots} personas. Inversión: $${workshop.price} USD.`,
    alternates: { canonical: `/workshop/${workshop.slug}` },
    openGraph: {
      title: `${workshop.shortTitle} — Ana's Pastry Shop`,
      description: workshop.subtitle,
      images: [{ url: workshop.image, width: 1200, height: 630, alt: workshop.shortTitle }],
    },
  };
}

async function WorkshopDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) {
    notFound();
  }

  if (workshop.slug !== slug) {
    permanentRedirect(`/workshop/${workshop.slug}`);
  }

  const depositAmount = Math.round(workshop.price * 0.5);
  const balanceAmount = workshop.price - depositAmount;
  const waText = encodeURIComponent(
    `¡Hola Chef Anais! Me interesa información e inscripción para el taller presencial: "${workshop.title}" ($${workshop.price} USD). ¿Cuáles son las próximas fechas disponibles?`,
  );
  const waUrl = `https://wa.me/584120000000?text=${waText}`;
  const courseId =
    (workshop as any).courseId || workshop.legacySlug || workshop.id || `ws-${workshop.slug}`;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <WorkshopDetailHero workshop={workshop} depositAmount={depositAmount} />
      <WorkshopDetailBody
        workshop={workshop}
        depositAmount={depositAmount}
        balanceAmount={balanceAmount}
        courseId={courseId}
        waUrl={waUrl}
      />
      <RelatedFormaciones
        eyebrow="Sigue Capacitándote"
        title="Otros Workshops Presenciales"
        subtitle="Talleres intensivos de 8 horas en Caracas (Las Mercedes) con grupos reducidos y todos los insumos incluidos."
        items={getOtherWorkshops(workshop, 3)}
        href="/workshops"
        ctaLabel="Ver Catálogo Completo"
        columns={3}
      />
      <Footer />
    </main>
  );
}

export default function WorkshopDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkshopDetailContent params={params} />
    </Suspense>
  );
}
