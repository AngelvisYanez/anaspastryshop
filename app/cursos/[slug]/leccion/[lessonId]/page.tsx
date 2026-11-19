import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getOnlineCourseBySlug } from "@/lib/data/online-courses";
import { LeccionPlayerView } from "./LeccionPlayerView";
import { CourseReviewPrompt } from "@/components/CourseReviewPrompt";
import { getCourseReviewProgress } from "@/lib/data/course-reviews";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { checkUserCourseAccess } from "../../checkUserCourseAccess";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type PageProps = { params: Promise<{ slug: string; lessonId: string }> };

async function resolveCourseId(param: string): Promise<string> {
  const onlineCourse = getOnlineCourseBySlug(param);
  const slug = onlineCourse?.slug ?? param;

  const bySlug = await prisma.curso.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (bySlug) return bySlug.id;

  // Permite abrir por id real (cuid) si el param no es un slug publicado.
  return param;
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

  const access = { userId: session.user.id, courseId: curso.id };
  const hasPaid = await checkUserCourseAccess(access);
  if (!hasPaid && session.user.role !== "ADMIN" && curso.instructorId !== session.user.id) {
    redirect(`/cursos/${canonicalSlug ?? slug}`);
  }

  const currentModule = curso.courseModules.find((mod) =>
    mod.lessons.some((l) => l.id === lessonId),
  );
  const currentLesson = currentModule?.lessons.find((l) => l.id === lessonId);

  if (!currentModule || !currentLesson) notFound();

  const reviewProgress = hasPaid && session.user.role !== "ADMIN" &&
    !parseWorkshopDetails(curso.content, curso.isLive, curso.title).isWorkshop
    ? await getCourseReviewProgress(curso.id, session.user.id)
    : undefined;

  return (
    <LeccionPlayerView
      courseTitle={curso.title}
      courseHref={`/cursos/${canonicalSlug ?? slug}`}
      lessonId={lessonId}
      currentLesson={currentLesson}
      currentModule={currentModule}
      modules={curso.courseModules}
      reviewPrompt={reviewProgress && (
        <CourseReviewPrompt
          key={currentModule.id}
          courseId={curso.id}
          moduleId={currentModule.id}
          moduleCount={curso.courseModules.length}
          progress={reviewProgress}
        />
      )}
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
