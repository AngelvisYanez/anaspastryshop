import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getOnlineCourseBySlug } from "@/lib/data/online-courses";
import { LeccionPlayerView } from "./LeccionPlayerView";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type PageProps = { params: Promise<{ slug: string; lessonId: string }> };

async function resolveCourseId(param: string): Promise<string> {
  const onlineCourse = getOnlineCourseBySlug(param);
  if (onlineCourse) return onlineCourse.id;

  const bySlug = await prisma.curso.findUnique({
    where: { slug: param },
    select: { id: true },
  });
  return bySlug?.id ?? param;
}

async function userHasCourseAccess(
  userId: string,
  role: string | undefined,
  curso: { id: string; instructorId: string | null },
) {
  if (role === "ADMIN" || curso.instructorId === userId) return true;
  const inscription = await prisma.inscription.findFirst({
    where: { userId, cursoId: curso.id, status: "APPROVED" },
  });
  return !!inscription;
}

async function LeccionContent({ params }: PageProps) {
  const { slug, lessonId } = await params;
  const [session, cursoId] = await Promise.all([auth(), resolveCourseId(slug)]);

  const canonical = await prisma.curso.findUnique({
    where: { id: cursoId },
    select: { slug: true },
  });
  const canonicalSlug = canonical?.slug ?? null;

  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`/cursos/${canonicalSlug}/leccion/${lessonId}`);
  }

  if (!session?.user?.id) {
    redirect(`/iniciar-sesion?callbackUrl=/cursos/${slug}/leccion/${lessonId}`);
  }

  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    include: {
      courseModules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!curso) notFound();

  const hasPaid = await userHasCourseAccess(session.user.id, session.user.role, curso);
  if (!hasPaid) {
    redirect(`/cursos/${canonicalSlug ?? slug}`);
  }

  const currentModule = curso.courseModules.find((mod) =>
    mod.lessons.some((l) => l.id === lessonId),
  );
  const currentLesson = currentModule?.lessons.find((l) => l.id === lessonId);

  if (!currentModule || !currentLesson) notFound();

  return (
    <LeccionPlayerView
      courseTitle={curso.title}
      courseHref={`/cursos/${canonicalSlug ?? slug}`}
      lessonId={lessonId}
      currentLesson={currentLesson}
      currentModule={currentModule}
      modules={curso.courseModules}
    />
  );
}

export default function LeccionPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <LeccionContent params={params} />
    </Suspense>
  );
}
