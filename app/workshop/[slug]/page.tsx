import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import RelatedFormaciones from "@/components/RelatedFormaciones";
import { getWorkshopBySlug, getAllWorkshops, getOtherWorkshops } from "@/lib/data/workshops";
import { getOnlineCourseBySlug } from "@/lib/data/online-courses";
import { WorkshopDetailHero } from "./WorkshopDetailHero";
import { WorkshopDetailBody } from "./WorkshopDetailBody";
import {
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  buildPageMetadata,
  GEO,
  getSiteUrl,
  SITE_WHATSAPP,
} from "@/lib/seo";

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
    return { title: "Workshop No Encontrado" };
  }

  return buildPageMetadata({
    title: `${workshop.shortTitle} — Workshop Presencial en ${GEO.shortAddress}`,
    description: `${workshop.subtitle}. Workshop presencial intensivo de 8 horas en Coro, Falcón, Venezuela. Cupo de ${workshop.spots} personas. Inversión: $${workshop.price} USD.`,
    path: `/workshop/${workshop.slug}`,
    images: [{ url: workshop.image, width: 1200, height: 630, alt: `${workshop.shortTitle} — Ana's Pastry Shop Venezuela` }],
    keywords: [
      `${workshop.shortTitle} Coro`,
      "workshop pastelería Venezuela",
      "taller presencial Falcón",
      workshop.title,
    ],
  });
}

async function WorkshopDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  // Slugs que antes eran workshop y ahora son solo curso online (p. ej. Merengue Italiano).
  if (!workshop) {
    const online = getOnlineCourseBySlug(slug.replace(/^workshop-/, ""));
    if (online) permanentRedirect(`/cursos/${online.slug}`);
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
  const waUrl = `https://wa.me/${SITE_WHATSAPP}?text=${waText}`;
  const courseId =
    (workshop as { courseId?: string }).courseId || workshop.legacySlug || workshop.id || `ws-${workshop.slug}`;
  const siteUrl = getSiteUrl();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Workshops", path: "/workshops" },
          { name: workshop.shortTitle, path: `/workshop/${workshop.slug}` },
        ])}
      />
      <JsonLd
        data={buildCourseJsonLd({
          name: workshop.title,
          description: workshop.subtitle,
          url: `${siteUrl}/workshop/${workshop.slug}`,
          image: workshop.image,
          price: workshop.price,
          isOnline: false,
        })}
      />
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
        subtitle="Talleres intensivos de 8 horas en Coro, Falcón con grupos reducidos y todos los insumos incluidos."
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
