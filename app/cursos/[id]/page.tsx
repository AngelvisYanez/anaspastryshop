import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

export default async function CoursePage({ params }: { params: { id: string } }) {
  const { id } = await params; // Next.js 15+ needs await for params sometimes, standard practice

  const session = await auth();

  // Fetch course from DB
  const course = await prisma.curso.findUnique({
    where: { id },
    include: {
      instructor: true,
      courseModules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Check paywall
  let hasPaid = false;
  
  if (session?.user) {
    if (session.user.role === "ADMIN" || course.instructorId === session.user.id) {
       hasPaid = true; // Admir/Propietario tienen acceso gratis
    } else {
        const inscription = await prisma.inscription.findFirst({
          where: {
            userId: session.user.id,
            cursoId: course.id,
            status: "APPROVED"
          }
        });
        if (inscription) {
          hasPaid = true;
        }
      }

      // 2. Si no ha pagado individualmente, verificar acceso por Membresía (GATING)
      if (!hasPaid) {
        const activeSubscription = await prisma.subscription.findUnique({
          where: { userId: session.user.id },
        });

        if (activeSubscription && activeSubscription.status === "ACTIVE") {
          const plan = activeSubscription.plan;
          const level = course.level;

          // Reglas de acceso por nivel
          if (plan === "PREMIUM") {
            hasPaid = true; // Elite tiene acceso total
          } else if (plan === "STANDARD") {
            // Estándar: Principiante e Intermedio
            if (level === "Principiante" || level === "Intermedio") {
              hasPaid = true;
            }
          } else if (plan === "BASIC") {
            // Básico: Solo Principiante
            if (level === "Principiante") {
              hasPaid = true;
            }
          }
        }
      }
    }
  }

  return <CourseDetailClient course={course} hasPaid={hasPaid} />;
}
