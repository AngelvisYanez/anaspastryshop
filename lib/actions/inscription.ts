"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { sendSubscriptionPendingEmail } from "@/lib/email";

type CreateInscriptionParams = {
  cursoId?: string;
  method: "ZELLE" | "PAGO_MOVIL" | "USDT" | "TRANSFERENCIA" | "STRIPE" | "BANK_TRANSFER";
  reference?: string;
  phoneNumber?: string;
  amountPaid: number;
  receiptImage?: string;
};

export async function createSubscriptionInscription(data: {
  reference: string;
  amountPaid: number;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para continuar" };
  }

  try {
    const existingPending = await prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
        cursoId: null,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return { error: "Ya tienes un pago de membresía pendiente de revisión" };
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSubscription?.status === "ACTIVE") {
      return { error: "Ya tienes una membresía activa" };
    }

    const inscription = await prisma.inscription.create({
      data: {
        method: "BANK_TRANSFER",
        reference: data.reference,
        amountPaid: data.amountPaid,
        cursoId: null,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "SUBSCRIPTION_PAYMENT_SUBMITTED",
      entityType: "INSCRIPTION",
      entityId: inscription.id,
      details: { type: "SUBSCRIPTION", method: "BANK_TRANSFER" },
    });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, name: true } });
    if (user) {
      sendSubscriptionPendingEmail(user.email, user.name).catch(() => {});
    }

    revalidatePath("/dashboard");
    return { success: true, inscriptionId: inscription.id };
  } catch (error) {
    console.error("Error creating subscription inscription:", error);
    return { error: "Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo." };
  }
}

export async function createInscription(data: CreateInscriptionParams) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "Debes iniciar sesión para inscribirte" };
  }

  if (!data.cursoId) {
    return { error: "Debe proveer un ID de Curso" };
  }

  try {
    // @ts-ignore
    const existing = await prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
        cursoId: data.cursoId,
      },
    });

    if (existing) {
      return { error: "Ya existe una inscripción para este curso" };
    }

    // @ts-ignore
    const inscription = await prisma.inscription.create({
      data: {
        method: data.method,
        reference: data.reference || null,
        phoneNumber: data.phoneNumber || null,
        amountPaid: data.amountPaid,
        receiptImage: data.receiptImage || null,
        cursoId: data.cursoId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "ENROLL",
      entityType: "INSCRIPTION",
      entityId: inscription.id,
      details: { 
        type: "CURSO", 
        targetId: data.cursoId,
        method: data.method 
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/cursos");
    
    return { success: true, inscriptionId: inscription.id };
  } catch (error) {
    console.error("Error creating inscription:", error);
    return { error: "Ocurrió un error al procesar tu pago. Inténtalo de nuevo." };
  }
}
