import { prisma } from "@/lib/prisma";

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details,
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string | object;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: typeof details === "object" ? JSON.stringify(details) : details,
      },
    });
  } catch (error) {
    // Es crítico que el loggeo no tumbe la app principal, por eso capturamos el error
    console.error("Fallo al guardar log de actividad:", error);
  }
}
