import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import Footer from "@/components/Footer";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { getWorkshopBySlug } from "@/lib/data/workshops";
import { getOnlineCourseBySlug } from "@/lib/data/online-courses";

async function CourseContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Si el parámetro coincide con un slug de workshop, redirigir a la ruta amigable
  const matchedWorkshop = getWorkshopBySlug(id);
  if (matchedWorkshop) {
    redirect(`/workshop/${matchedWorkshop.slug}`);
  }

  const session = await auth();
  const onlineCourse = getOnlineCourseBySlug(id);
  const targetId = onlineCourse?.id || id;

  const course = await prisma.curso.findFirst({
    where: {
      OR: [
        { id: targetId },
        { id },
        ...(onlineCourse ? [{ title: { contains: onlineCourse.shortTitle } }] : []),
        { content: { contains: id } },
      ],
    },
    include: {
      instructor: true,
      courseModules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);

  // Si es un workshop presencial con slug amigable, redirigir a la ruta amigable
  if (workshopInfo.isWorkshop && workshopInfo.slug) {
    const w = getWorkshopBySlug(workshopInfo.slug);
    redirect(`/workshop/${w?.slug || workshopInfo.slug}`);
  }

  let hasPaid = false;

  if (session?.user) {
    if (session.user.role === "ADMIN" || course.instructorId === session.user.id) {
      hasPaid = true;
    } else {
      const inscription = await prisma.inscription.findFirst({
        where: { userId: session.user.id, cursoId: course.id, status: "APPROVED" },
      });
      if (inscription) hasPaid = true;

      if (!hasPaid) {
        const purchase = await prisma.coursePurchase.findFirst({
          where: { userId: session.user.id, cursoId: course.id, status: "COMPLETED" },
        });
        if (purchase) hasPaid = true;
      }
    }
  }

  return (
    <CourseDetailClient course={course} hasPaid={hasPaid} workshopInfo={workshopInfo}>
      <Footer />
    </CourseDetailClient>
  );
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CourseContent params={params} />
    </Suspense>
  );
}
