import { Suspense } from "react";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, permanentRedirect } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { getWorkshopBySlug } from "@/lib/data/workshops";
import { getOnlineCourseBySlug } from "@/lib/data/online-courses";
import { checkUserCourseAccess } from "./checkUserCourseAccess";
import { labelsForEnabledProviders } from "@/components/checkout/manualProviders";
import {
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

const COURSE_INCLUDE = {
  instructor: true,
  courseModules: {
    orderBy: { order: "asc" as const },
    include: { lessons: { orderBy: { order: "asc" as const } } },
  },
};

type PageProps = { params: Promise<{ slug: string }> };

type ResolvedCourse =
  | { kind: "redirect"; to: string }
  | {
      kind: "course";
      course: Prisma.CursoGetPayload<{ include: typeof COURSE_INCLUDE }>;
      canonicalSlug: string | null;
      /** Catálogo online estático: nunca es reserva de cupo. */
      isOnlineCatalog: boolean;
    };

/**
 * Resuelve el parámetro de la URL contra catálogo online estático y `Curso.slug` en la BD.
 * Devuelve el curso junto con el slug canónico que debe vivir en la URL.
 */
async function resolveCourse(param: string): Promise<ResolvedCourse | null> {
  // Catálogo online primero: evita confundir un curso online con un taller
  // presencial que pudiera compartir nombre o slug histórico.
  const onlineCourse = getOnlineCourseBySlug(param);

  if (!onlineCourse) {
    const workshop = getWorkshopBySlug(param);
    if (workshop) return { kind: "redirect", to: `/workshop/${workshop.slug}` };
  }

  const course = await prisma.curso.findFirst({
    where: {
      OR: [
        { slug: param },
        { id: param },
        ...(onlineCourse
          ? [{ slug: onlineCourse.slug }, { id: onlineCourse.id }]
          : []),
      ],
    },
    include: COURSE_INCLUDE,
  });

  if (!course) return null;

  const isOnlineCatalog = Boolean(
    onlineCourse || (course.slug && getOnlineCourseBySlug(course.slug))
  );

  // Solo redirigir a /workshop si el registro de BD es realmente un taller
  // presencial (no un curso online con nombre parecido).
  if (!isOnlineCatalog) {
    const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);
    const workshopSlug = workshopInfo.slug;
    if (workshopInfo.isWorkshop && workshopSlug) {
      const matched = getWorkshopBySlug(workshopSlug);
      return { kind: "redirect", to: `/workshop/${matched?.slug ?? workshopSlug}` };
    }
  }

  return {
    kind: "course",
    course,
    canonicalSlug: course.slug ?? onlineCourse?.slug ?? null,
    isOnlineCatalog,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCourse(slug);

  if (!resolved || resolved.kind === "redirect") {
    return { title: "Curso No Encontrado" };
  }

  const { course } = resolved;

  return buildPageMetadata({
    title: `${course.title} — Curso Online Disponible Globalmente`,
    description:
      course.description?.slice(0, 155) ||
      `Curso online de pastelería: ${course.title}. Aprende con Anais Flores desde cualquier país, en español y a tu ritmo.`,
    path: `/cursos/${resolved.canonicalSlug ?? slug}`,
    images: course.image
      ? [{ url: course.image, alt: `${course.title} — Ana's Pastry Shop (online global)` }]
      : undefined,
    keywords: [
      course.title,
      "curso online pastelería",
      "repostería online español",
      "Ana's Pastry Shop",
    ],
  });
}

async function CourseContent({ params }: PageProps) {
  const { slug } = await params;
  const resolved = await resolveCourse(slug);

  if (!resolved) notFound();
  if (resolved.kind === "redirect") permanentRedirect(resolved.to);

  const { course, canonicalSlug } = resolved;

  // Cualquier URL no canónica (cuid, slug antiguo) se redirige al slug friendly.
  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`/cursos/${canonicalSlug}`);
  }

  let userId: string | undefined;
  let role: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
    role = session?.user?.role;
  } catch (err) {
    console.error("[cursos/[slug]] auth unavailable:", err);
  }
  const hasPaid = await checkUserCourseAccess({
    userId,
    role,
    courseId: course.id,
    instructorId: course.instructorId,
  });

  const parsed = parseWorkshopDetails(course.content, course.isLive, course.title);
  // Los cursos del catálogo online se compran (pago completo), nunca se reservan.
  const workshopInfo = resolved.isOnlineCatalog
    ? { ...parsed, isWorkshop: false }
    : parsed;

  let paymentMethods: string[] = [];
  try {
    const enabledGateways = await prisma.paymentGatewayConfig.findMany({
      where: { isEnabled: true },
      select: { provider: true },
    });
    paymentMethods = labelsForEnabledProviders(enabledGateways.map((g) => g.provider));
  } catch (err) {
    console.error("[cursos/[slug]] gateways unavailable:", err);
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Cursos Online", path: "/cursos" },
          { name: course.title, path: `/cursos/${canonicalSlug ?? slug}` },
        ])}
      />
      <JsonLd
        data={buildCourseJsonLd({
          name: course.title,
          description: course.description || course.title,
          url: `/cursos/${canonicalSlug ?? slug}`,
          image: course.image,
          price: course.price,
          isOnline: true,
        })}
      />
      <CourseDetailClient
        course={course}
        hasPaid={hasPaid}
        workshopInfo={workshopInfo}
        paymentMethods={paymentMethods}
      >
        <Footer />
      </CourseDetailClient>
    </>
  );
}

export default function CoursePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CourseContent params={params} />
    </Suspense>
  );
}
