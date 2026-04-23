"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function getPendingPayments() {
  const session = await auth();

  // Basic authorization
  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    const inscriptions = await prisma.inscription.findMany({
      where: {
        status: "PENDING",
      },
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
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: { status: "APPROVED" },
    });

    await logActivity({
      userId: session.user.id as string,
      action: "APPROVE_PAYMENT",
      entityType: "INSCRIPTION",
      entityId: inscriptionId,
      details: { status: "APPROVED" },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { error: "No se pudo aprobar el pago" };
  }
}

export async function rejectPayment(inscriptionId: string) {
  const session = await auth();

  // @ts-ignore
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  try {
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: { status: "REJECTED" },
    });

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
