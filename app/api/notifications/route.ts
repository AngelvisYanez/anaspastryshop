import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseReviewsReadAt } from "@/lib/data/course-reviews";

const ACTION_TITLES: Record<string, string> = {
  CREATE: "Creación", UPDATE: "Actualización", DELETE: "Eliminación",
  APPROVE: "Aprobación", REVOKE: "Revocación", REGISTER: "Nuevo registro",
  APPROVE_PAYMENT: "Pago aprobado", APPROVE_PASTRY_PAYMENT: "Pago de pastelería aprobado",
  APPROVE_COURSE_PAYMENT: "Pago de formación aprobado", REJECT_PAYMENT: "Pago rechazado",
  COURSE_PAYMENT_SUBMITTED: "Comprobante de formación enviado",
  PASTRY_SERVICE_PAYMENT_SUBMITTED: "Comprobante de pastelería enviado",
  REACTIVATE: "Cuenta reactivada", SUSPEND: "Cuenta suspendida",
};

const ENTITY_TITLES: Record<string, string> = {
  USER: "usuario", CURSO: "curso o workshop", CATEGORY: "categoría",
  INSCRIPTION: "inscripción", PASTRY_SERVICE: "servicio de pastelería",
};

function describeLog(action: string, entityType: string) {
  const entity = ENTITY_TITLES[entityType] ?? "registro";
  if (action === "DELETE") return `Se eliminó un ${entity}`;
  if (action === "CREATE") return `Se creó un ${entity}`;
  if (action === "UPDATE") return `Se actualizó un ${entity}`;
  const title = ACTION_TITLES[action] ?? "Actividad registrada";
  return entityType === "INSCRIPTION" && action.includes("PAYMENT") ? title : `${title}: ${entity}`;
}

function destination(action: string, entityType: string, role: string) {
  if (role !== "ADMIN") return entityType === "INSCRIPTION" ? "/dashboard/mis-cursos" : "/dashboard";
  if (entityType === "INSCRIPTION") return "/dashboard/pagos";
  if (entityType === "USER") return "/dashboard/usuarios";
  if (entityType === "CURSO") return "/dashboard/cursos";
  return "/dashboard/logs";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [] }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  let unreadCount = 0;
  const notifications: Array<{
    id: string;
    type: "success" | "warning" | "info";
    title: string;
    description: string;
    time: string;
    read: boolean;
    href: string;
  }> = [];

  try {
    if (role === "ADMIN") {
      const [pendingPayments, recentLogs, recentReviews, reviewsReadAt] = await Promise.all([
        prisma.inscription.count({ where: { status: "PENDING" } }),
        prisma.activityLog.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        }),
        prisma.courseReview.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          select: { id: true, cursoId: true, createdAt: true, curso: { select: { title: true } } },
        }),
        getCourseReviewsReadAt(session.user.id),
      ]);
      const unreadReviews = await prisma.courseReview.count({ where: { createdAt: { gt: reviewsReadAt } } });
      unreadCount = unreadReviews + pendingPayments;

      if (pendingPayments > 0) {
        notifications.push({
          id: "pending-payments",
          type: "warning",
          title: `${pendingPayments} pago${pendingPayments > 1 ? "s" : ""} pendiente${pendingPayments > 1 ? "s" : ""}`,
          description: "Hay inscripciones esperando validación manual.",
          time: new Date().toISOString(),
          read: false,
          href: "/dashboard/pagos",
        });
      }

      for (const review of recentReviews) {
        notifications.push({
          id: `review-${review.id}`,
          type: "info",
          title: "Nueva reseña de curso",
          description: review.curso.title,
          time: review.createdAt.toISOString(),
          read: review.createdAt <= reviewsReadAt,
          href: `/dashboard/cursos/${review.cursoId}/resenas#${review.id}`,
        });
      }

      for (const log of recentLogs) {
        notifications.push({
          id: log.id,
          type: log.action === "REGISTER" ? "success" : "info",
          title: log.action === "REGISTER"
            ? `Nuevo registro: ${log.user?.name ?? "Usuario"}`
            : describeLog(log.action, log.entityType),
          description: log.action === "REGISTER"
            ? "Un nuevo usuario se registró en la plataforma."
            : `Acción realizada por ${log.user?.name ?? "sistema"}.`,
          time: log.createdAt.toISOString(),
          read: true,
          href: destination(log.action, log.entityType, role),
        });
      }
    } else {
      const recentActivity = await prisma.activityLog.findMany({
        where: { userId: session.user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      for (const log of recentActivity) {
        notifications.push({
          id: log.id,
          type: "info",
          title: describeLog(log.action, log.entityType),
          description: "Consulta el estado de este proceso.",
          time: log.createdAt.toISOString(),
          read: true,
          href: destination(log.action, log.entityType, role),
        });
      }
    }
  } catch {
    // return empty list on DB error
  }

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const latestReview = await prisma.courseReview.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latestReview) {
    await prisma.user.updateMany({
      where: {
        id: session.user.id,
        OR: [{ courseReviewsReadAt: null }, { courseReviewsReadAt: { lt: latestReview.createdAt } }],
      },
      data: { courseReviewsReadAt: latestReview.createdAt },
    });
  }
  return new NextResponse(null, { status: 204 });
}
