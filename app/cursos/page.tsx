import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cacheTag, cacheLife } from "next/cache";
import PublicCoursesClient from "./PublicCoursesClient";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Cursos",
  description:
    "Explora nuestro catálogo de cursos sobre crédito, finanzas personales e inversión en Estados Unidos. Formación práctica en español para la comunidad hispana.",
  openGraph: {
    title: "Catálogo de Cursos | Academia Credito USA",
    description: "Cursos de crédito y finanzas personales en español para hispanos en USA.",
  },
};

async function getPublicCourses() {
  "use cache";
  cacheLife("hours");
  cacheTag("cursos");
  return prisma.curso.findMany({
    where: {
      OR: [
        { status: "PUBLISHED" },
        { status: "SCHEDULED", publishedAt: { lte: new Date() } },
      ],
    },
    include: { instructor: true },
    orderBy: { createdAt: "desc" },
  });
}

async function CursosContent() {
  const session = await auth();
  const userId = session?.user?.id;

  const [coursesDB, userInscriptions, userSubscription] = await Promise.all([
    getPublicCourses(),
    userId
      ? prisma.inscription.findMany({
          where: { userId, status: "APPROVED" },
          select: { cursoId: true },
        })
      : Promise.resolve([]),
    userId
      ? prisma.subscription.findUnique({ where: { userId } })
      : Promise.resolve(null),
  ]);

  const paidCourseIds = new Set(userInscriptions.map((ins) => ins.cursoId));

  const formattedCourses = coursesDB.map((c) => {
    let hasAccess = paidCourseIds.has(c.id) || session?.user?.role === "ADMIN";

    if (!hasAccess && userSubscription?.status === "ACTIVE") {
      const plan = userSubscription.plan;
      const level = c.level;
      if (plan === "PREMIUM") hasAccess = true;
      else if (plan === "STANDARD" && (level === "Principiante" || level === "Intermedio")) hasAccess = true;
      else if (plan === "BASIC" && level === "Principiante") hasAccess = true;
    }

    return {
      id: c.id,
      title: c.title,
      instructor: c.instructor.name || "Tutor",
      type: c.isLive ? "Híbrido" : "Online",
      category: c.category || "General",
      image: c.image || null,
      hasAccess,
    };
  });

  return (
    <PublicCoursesClient courses={formattedCourses}>
      <Footer />
    </PublicCoursesClient>
  );
}

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CursosContent />
    </Suspense>
  );
}
