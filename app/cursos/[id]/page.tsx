import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import Footer from "@/components/Footer";
import { isSubscriptionValid } from "@/lib/utils/subscription";

async function CourseContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const course = await prisma.curso.findUnique({
    where: { id },
    include: {
      instructor: true,
      courseModules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } }
        }
      }
    }
  });

  if (!course) notFound();

  let hasPaid = false;

  if (session?.user) {
    if (session.user.role === "ADMIN" || course.instructorId === session.user.id) {
      hasPaid = true;
    } else {
      const inscription = await prisma.inscription.findFirst({
        where: { userId: session.user.id, cursoId: course.id, status: "APPROVED" }
      });
      if (inscription) hasPaid = true;

      if (!hasPaid) {
        const purchase = await prisma.coursePurchase.findFirst({
          where: { userId: session.user.id, cursoId: course.id, status: "COMPLETED" }
        });
        if (purchase) hasPaid = true;
      }
    }

    if (!hasPaid) {
      const sub = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        select: { status: true, endDate: true },
      });
      if (sub && isSubscriptionValid(sub)) hasPaid = true;
    }
  }

  return (
    <CourseDetailClient course={course} hasPaid={hasPaid}>
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
