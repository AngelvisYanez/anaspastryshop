"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { subscriptionEndDate } from "@/lib/utils/subscription";
import {
  sendSubscriptionConfirmedEmail,
  sendCoursePurchaseEmail,
  sendPaymentRejectedEmail,
} from "@/lib/email";

export async function getPendingPayments() {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    const inscriptions = await prisma.inscription.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, email: true } },
        curso: { select: { title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { inscriptions };
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return { error: "No se pudieron obtener los pagos pendientes" };
  }
}

export async function approvePayment(inscriptionId: string) {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    const inscription = await prisma.inscription.findUnique({
      where: { id: inscriptionId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!inscription) return { error: "Inscripción no encontrada" };

    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: { status: "APPROVED" },
    });

    if (!inscription.cursoId) {
      const plan = await prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
      const now = new Date();
      const endDate = subscriptionEndDate(now);

      await prisma.subscription.upsert({
        where: { userId: inscription.userId },
        create: {
          userId: inscription.userId,
          plan: plan?.slug ?? "membresia",
          status: "ACTIVE",
          startDate: now,
          endDate,
        },
        update: {
          status: "ACTIVE",
          startDate: now,
          endDate,
        },
      });

      sendSubscriptionConfirmedEmail(
        inscription.user.email,
        inscription.user.name,
        plan?.name ?? "Membresía Academia",
        inscription.amountPaid
      ).catch(() => {});
    } else {
      const curso = await prisma.curso.findUnique({
        where: { id: inscription.cursoId },
        select: { title: true },
      });

      sendCoursePurchaseEmail(
        inscription.user.email,
        inscription.user.name,
        curso?.title ?? "Curso"
      ).catch(() => {});

      revalidatePath("/dashboard/mis-cursos");
    }

    await logActivity({
      userId: session.user.id as string,
      action: "APPROVE_PAYMENT",
      entityType: "INSCRIPTION",
      entityId: inscriptionId,
      details: { status: "APPROVED", isSubscription: !inscription.cursoId },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { error: "No se pudo aprobar el pago" };
  }
}

export async function rejectPayment(inscriptionId: string, reason?: string) {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    const inscription = await prisma.inscription.findUnique({
      where: { id: inscriptionId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!inscription) return { error: "Inscripción no encontrada" };

    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: { status: "REJECTED" },
    });

    sendPaymentRejectedEmail(
      inscription.user.email,
      inscription.user.name,
      reason
    ).catch(() => {});

    await logActivity({
      userId: session.user.id as string,
      action: "REJECT_PAYMENT",
      entityType: "INSCRIPTION",
      entityId: inscriptionId,
      details: { status: "REJECTED" },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { error: "No se pudo rechazar el pago" };
  }
}
