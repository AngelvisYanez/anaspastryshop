import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [] }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  const notifications: Array<{
    id: string;
    type: "success" | "warning" | "info";
    title: string;
    description: string;
    time: string;
    read: boolean;
  }> = [];

  try {
    if (role === "ADMIN") {
      const [pendingPayments, recentLogs] = await Promise.all([
        prisma.inscription.count({ where: { status: "PENDING" } }),
        prisma.activityLog.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        }),
      ]);

      if (pendingPayments > 0) {
        notifications.push({
          id: "pending-payments",
          type: "warning",
          title: `${pendingPayments} pago${pendingPayments > 1 ? "s" : ""} pendiente${pendingPayments > 1 ? "s" : ""}`,
          description: "Hay inscripciones esperando validación manual.",
          time: "ahora",
          read: false,
        });
      }

      for (const log of recentLogs) {
        notifications.push({
          id: log.id,
          type: log.action === "REGISTER" ? "success" : "info",
          title: log.action === "REGISTER"
            ? `Nuevo registro: ${log.user?.name ?? "Usuario"}`
            : `${log.action}: ${log.entityType}`,
          description: log.action === "REGISTER"
            ? "Un nuevo usuario se registró en la plataforma."
            : `Acción realizada por ${log.user?.name ?? "sistema"}.`,
          time: timeAgo(log.createdAt),
          read: true,
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
          title: log.action,
          description: `${log.entityType} actualizado.`,
          time: timeAgo(log.createdAt),
          read: true,
        });
      }
    }
  } catch {
    // return empty list on DB error
  }

  return NextResponse.json({ notifications });
}
