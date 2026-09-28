import { Suspense } from "react";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, permanentRedirect } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import Footer from "@/components/Footer";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { getWorkshopBySlug } from "@/lib/data/workshops";
import { getOnlineCourseBySlug } from "@/lib/data/online-courses";
import { checkUserCourseAccess } from "./checkUserCourseAccess";

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
  | { kind: "course"; course: Prisma.CursoGetPayload<{ include: typeof COURSE_INCLUDE }>; canonicalSlug: string | null };

/**
 * Resuelve el parámetro de la URL contra las tres fuentes de verdad que conviven
 * hoy: slug de workshop, catálogo online estático y `Curso.slug` en la BD.
 * Devuelve el curso junto con el slug canónico que debe vivir en la URL.
 */
async function resolveCourse(param: string): Promise<ResolvedCourse | null> {
  const workshop = getWorkshopBySlug(param);
  if (workshop) return { kind: "redirect", to: `/workshop/${workshop.slug}` };

  const onlineCourse = getOnlineCourseBySlug(param);

  const course = await prisma.curso.findFirst({
    where: {
      OR: [
        { slug: param },
        { id: param },
        ...(onlineCourse ? [{ id: onlineCourse.id }, { title: { contains: onlineCourse.shortTitle } }] : []),
      ],
    },
    include: COURSE_INCLUDE,
  });

  if (!course) return null;

  // Los workshops presenciales tienen su propia ruta canónica.
  const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);
  const workshopSlug = workshopInfo.slug;
  if (workshopInfo.isWorkshop && workshopSlug) {
    const matched = getWorkshopBySlug(workshopSlug);
    return { kind: "redirect", to: `/workshop/${matched?.slug ?? workshopSlug}` };
  }

  return { kind: "course", course, canonicalSlug: course.slug ?? onlineCourse?.slug ?? null };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCourse(slug);

  if (!resolved || resolved.kind === "redirect") {
    return { title: "Curso No Encontrado" };
  }

  const { course } = resolved;

  return {
    title: course.title,
    description: course.description?.slice(0, 160) || undefined,
    alternates: { canonical: `/cursos/${resolved.canonicalSlug ?? slug}` },
    openGraph: {
      title: `${course.title} | Ana's Pastry Shop`,
      description: course.description?.slice(0, 200) || undefined,
      ...(course.image ? { images: [{ url: course.image, alt: course.title }] } : {}),
    },
  };
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

  const session = await auth();
  const hasPaid = await checkUserCourseAccess({
    userId: session?.user?.id,
    role: session?.user?.role,
    courseId: course.id,
    instructorId: course.instructorId,
  });

  const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);

  return (
    <CourseDetailClient course={course} hasPaid={hasPaid} workshopInfo={workshopInfo}>
      <Footer />
    </CourseDetailClient>
  );
}

export default function CoursePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CourseContent params={params} />
    </Suspense>
  );
}
