import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PublicCoursesClient from "./PublicCoursesClient";

export default async function CursosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Ejecutamos consultas en paralelo para optimizar carga
  const [coursesDB, userInscriptions, userSubscription] = await Promise.all([
    prisma.curso.findMany({
      include: {
        instructor: true,
      },
      orderBy: { createdAt: "desc" }
    }),
    userId ? prisma.inscription.findMany({
      where: { userId, status: "APPROVED" },
      select: { cursoId: true }
    }) : Promise.resolve([]),
    userId ? prisma.subscription.findUnique({
      where: { userId }
    }) : Promise.resolve(null)
  ]);

  const paidCourseIds = new Set(userInscriptions.map(ins => ins.cursoId));

  const formattedCourses = coursesDB.map((c) => {
    // Verificar si tiene acceso por suscripción o compra individual
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
      price: c.price,
      type: c.isLive ? "Híbrido" : "Online",
      level: c.level,
      category: c.category || "General",
      image: c.image || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800",
      hasAccess,
    };
  });

  return (
    <PublicCoursesClient 
      courses={formattedCourses} 
      userSubscription={userSubscription ? { plan: userSubscription.plan, status: userSubscription.status } : null} 
    />
  );
}
