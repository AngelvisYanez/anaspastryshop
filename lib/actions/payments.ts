"use server";

import { prisma } from "@/lib/prisma";
import { dateBounds, parseRange, type DateRange } from "@/app/dashboard/data-view/filters";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendMetaPurchase } from "@/lib/meta-conversions";
import { adminPaymentText, adminWhatsAppNumber, paymentApprovedText, wakeWhatsAppBridge } from "@/lib/whatsapp-notifications";
import {
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
    return { error: "No se pudieron obtener los pagos pendientes", inscriptions: [] };
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
      include: { user: { select: { id: true, email: true, name: true, whatsappNumber: true } }, curso: { select: { title: true } } },
    });

    if (!inscription) return { error: "Inscripción no encontrada" };

    if (inscription.status !== "PENDING") return { error: "Este pago ya fue procesado" };

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.inscription.updateMany({
        where: { id: inscriptionId, status: "PENDING" },
        data: { status: "APPROVED" },
      });
      if (result.count && inscription.user.whatsappNumber) {
        await tx.whatsAppNotification.create({ data: {
          eventKey: `payment-approved:${inscriptionId}`,
          userId: inscription.user.id,
          phone: inscription.user.whatsappNumber.replace(/\D/g, ""),
          text: paymentApprovedText(inscription.curso?.title ?? "Servicio de Pastelería", Boolean(inscription.cursoId)),
          kind: "TRANSACTIONAL",
        } });
      }
      const adminPhone = adminWhatsAppNumber();
      if (result.count && adminPhone) {
        await tx.whatsAppNotification.create({ data: {
          eventKey: `admin:payment-approved:${inscriptionId}`,
          phone: adminPhone,
          text: adminPaymentText("approved", [inscription.curso?.title ?? "Servicio de Pastelería"], inscription.user.name, inscription.amountPaid),
          kind: "ADMIN",
        } });
      }
      return result;
    });
    if (updated.count === 0) return { error: "Este pago ya fue procesado" };
    if (process.env.META_CONVERSIONS_ACCESS_TOKEN?.trim()) {
      const purchase = {
        id: inscriptionId,
        amount: inscription.amountPaid,
        email: inscription.user.email,
        approvedAt: Math.floor(Date.now() / 1000),
        phone: inscription.user.whatsappNumber,
        name: inscription.user.name,
        userId: inscription.user.id,
        country: "ve",
      };
      after(() => sendMetaPurchase(purchase));
    }
    await wakeWhatsAppBridge();

    if (!inscription.cursoId) {
      // Servicio de Pastelería / Pedido Especial
      await logActivity({
        userId: session.user.id as string,
        action: "APPROVE_PASTRY_PAYMENT",
        entityType: "INSCRIPTION",
        entityId: inscriptionId,
        details: {
          status: "APPROVED",
          type: "PASTRY_SERVICE",
          amount: inscription.amountPaid,
        },
      });
    } else {
      // Workshop / Curso Online
      const curso = await prisma.curso.findUnique({
        where: { id: inscription.cursoId },
        select: { title: true },
      });

      sendCoursePurchaseEmail(
        inscription.user.email,
        inscription.user.name,
        curso?.title ?? "Workshop / Curso",
      ).catch(() => {});

      await logActivity({
        userId: session.user.id as string,
        action: "APPROVE_COURSE_PAYMENT",
        entityType: "INSCRIPTION",
        entityId: inscriptionId,
        details: {
          status: "APPROVED",
          type: "CURSO",
          cursoId: inscription.cursoId,
          amount: inscription.amountPaid,
        },
      });

      revalidatePath("/dashboard/mis-cursos");
      revalidatePath(`/cursos/${inscription.cursoId}`);
    }

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { error: "No se pudo aprobar el pago" };
  }
}

export async function getPaymentHistory(page = 1, limit = 10, range?: DateRange) {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    const where = {
      status: { in: ["APPROVED", "REJECTED"] },
      updatedAt: range ? dateBounds(parseRange(range.from, range.to)) : undefined,
    };
    const total = await prisma.inscription.count({ where });
    const pages = Math.ceil(total / limit);
    const currentPage = Math.min(page, Math.max(1, pages));
    const inscriptions = await prisma.inscription.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        curso: { select: { title: true, price: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: (currentPage - 1) * limit,
      take: limit,
    });
    return { inscriptions, total, pages, page: currentPage };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return {
      error: "No se pudo obtener el historial",
      inscriptions: [],
      total: 0,
      pages: 0,
    };
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
      include: {
        user: { select: { email: true, name: true } },
        curso: { select: { title: true } },
      },
    });

    if (!inscription) return { error: "Inscripción no encontrada" };

    if (inscription.status !== "PENDING") return { error: "Este pago ya fue procesado" };

    const updated = await prisma.inscription.updateMany({
      where: { id: inscriptionId, status: "PENDING" },
      data: { status: "REJECTED" },
    });
    if (updated.count === 0) return { error: "Este pago ya fue procesado" };

    const rejectReason = reason
      ? `${inscription.curso?.title ? `Workshop: ${inscription.curso.title} - ` : "Servicio de Pastelería - "}${reason}`
      : reason;

    sendPaymentRejectedEmail(
      inscription.user.email,
      inscription.user.name,
      rejectReason,
    ).catch(() => {});

    await logActivity({
      userId: session.user.id as string,
      action: "REJECT_PAYMENT",
      entityType: "INSCRIPTION",
      entityId: inscriptionId,
      details: {
        status: "REJECTED",
        reason: reason ?? null,
        type: inscription.cursoId ? "CURSO" : "PASTRY_SERVICE",
      },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { error: "No se pudo rechazar el pago" };
  }
}
