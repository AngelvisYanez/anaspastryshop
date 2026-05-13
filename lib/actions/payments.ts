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

export async function getPaymentHistory(page = 1, limit = 10) {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const skip = (page - 1) * limit;

  try {
    const [inscriptions, total] = await Promise.all([
      prisma.inscription.findMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
        include: {
          user: { select: { name: true, email: true } },
          curso: { select: { title: true, price: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inscription.count({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
      }),
    ]);

    return { inscriptions, total, pages: Math.ceil(total / limit) };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return { error: "No se pudo obtener el historial", inscriptions: [], total: 0, pages: 0 };
  }
}

export async function getPaymentStats() {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    const [pending, approved, rejected, approvedAmount] = await Promise.all([
      prisma.inscription.count({ where: { status: "PENDING" } }),
      prisma.inscription.count({ where: { status: "APPROVED" } }),
      prisma.inscription.count({ where: { status: "REJECTED" } }),
      prisma.inscription.aggregate({
        where: { status: "APPROVED" },
        _sum: { amountPaid: true },
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      totalApprovedAmount: approvedAmount._sum.amountPaid ?? 0,
    };
  } catch {
    return { pending: 0, approved: 0, rejected: 0, totalApprovedAmount: 0 };
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
      details: { status: "REJECTED", reason: reason ?? null },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { error: "No se pudo rechazar el pago" };
  }
}
