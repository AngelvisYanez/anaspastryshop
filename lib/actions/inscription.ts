"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function withSerializableRetry<T>(
  operation: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)
        || error.code !== "P2034"
        || attempt === 2) {
        throw error;
      }
    }
  }
  throw new Error("No se pudo completar la transacción");
}

export type PaymentMethod =
  | "ZELLE"
  | "PAGO_MOVIL"
  | "BINANCE"
  | "BANK_TRANSFER"
  | "USDT"
  | "TRANSFERENCIA"
  | "STRIPE";

export type CreateCourseInscriptionParams = {
  cursoId: string;
  method: PaymentMethod;
  reference?: string;
  phoneNumber?: string;
  amountPaid: number;
  receiptImage?: string;
};

export type CreatePastryServiceParams = {
  serviceDescription: string;
  method: PaymentMethod;
  reference?: string;
  phoneNumber?: string;
  amountPaid: number;
  receiptImage?: string;
};

/**
 * Registra el pago por compra de un taller o curso online
 */
export async function createCourseInscription(data: CreateCourseInscriptionParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para inscribirte en el taller" };
  }

  if (!data.cursoId) {
    return { error: "Debe seleccionar un taller o curso válido" };
  }

  const userId = session.user.id;

  try {
    const result = await withSerializableRetry(async (tx) => {
      const existing = await tx.inscription.findFirst({
        where: {
          userId,
          cursoId: data.cursoId,
          status: { in: ["PENDING", "APPROVED"] },
        },
      });
      if (existing) return { kind: "existing" as const, status: existing.status };

      const inscription = await tx.inscription.create({
        data: {
          method: data.method,
          reference: data.reference || null,
          phoneNumber: data.phoneNumber || null,
          amountPaid: data.amountPaid,
          receiptImage: data.receiptImage || null,
          cursoId: data.cursoId,
          userId,
          status: "PENDING",
        },
      });
      return { kind: "created" as const, id: inscription.id };
    });

    if (result.kind === "existing") {
      if (result.status === "APPROVED") {
        return { error: "Ya tienes acceso activo a este taller" };
      }
      return { error: "Ya tienes un comprobante de pago pendiente de revisión para este taller" };
    }

    await logActivity({
      userId: session.user.id,
      action: "COURSE_PAYMENT_SUBMITTED",
      entityType: "INSCRIPTION",
      entityId: result.id,
      details: {
        type: "CURSO",
        targetId: data.cursoId,
        method: data.method,
        amount: data.amountPaid,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard/mis-cursos");
    revalidatePath(`/cursos/${data.cursoId}`);

    return { success: true, inscriptionId: result.id };
  } catch (error) {
    console.error("Error creating course inscription:", error);
    return { error: "Ocurrió un error al procesar tu pago. Inténtalo de nuevo." };
  }
}

/**
 * Registra el pago por un servicio de pastelería, torta para evento o pedido especial
 */
export async function createPastryServicePayment(data: CreatePastryServiceParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión o registrarte para registrar tu pago de pastelería" };
  }

  const throttle = rateLimit(`pastry-payment:${session.user.id}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return { error: "Demasiados envíos. Intenta de nuevo más tarde." };
  }

  try {
    const refFormatted = data.serviceDescription?.trim()
      ? `[Servicio: ${data.serviceDescription.trim()}] ${data.reference ? data.reference.trim() : ""}`.trim()
      : (data.reference || "Servicio de Pastelería");

    const inscription = await prisma.inscription.create({
      data: {
        method: data.method,
        reference: refFormatted,
        phoneNumber: data.phoneNumber || null,
        amountPaid: data.amountPaid,
        receiptImage: data.receiptImage || null,
        cursoId: null, // Null identifica pago directo de servicio de pastelería
        userId: session.user.id,
        status: "PENDING",
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "PASTRY_SERVICE_PAYMENT_SUBMITTED",
      entityType: "INSCRIPTION",
      entityId: inscription.id,
      details: {
        type: "PASTRY_SERVICE",
        description: data.serviceDescription,
        method: data.method,
        amount: data.amountPaid,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pagos");

    return { success: true, inscriptionId: inscription.id };
  } catch (error) {
    console.error("Error creating pastry service payment:", error);
    return { error: "Ocurrió un error al enviar tu comprobante. Inténtalo de nuevo." };
  }
}

export type CreateBulkCourseInscriptionsParams = {
  items: { cursoId: string; amountPaid: number }[];
  method: PaymentMethod;
  reference?: string;
  phoneNumber?: string;
  receiptImage?: string;
};

/**
 * Registra el pago por compra de varios talleres o cursos online desde la bolsa de compras.
 * Crea una inscripción PENDING por cada curso, omitiendo los que ya tengan una
 * inscripción pendiente/aprobada (devuelve sus ids en alreadyEnrolled).
 */
export async function createBulkCourseInscriptions(data: CreateBulkCourseInscriptionsParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para inscribirte en las formaciones" };
  }

  const userId = session.user.id;

  if (!data.items?.length) {
    return { error: "No hay formaciones en la bolsa para inscribir" };
  }

  const uniqueItems = [
    ...new Map(data.items.filter((item) => item.cursoId).map((item) => [item.cursoId, item])).values(),
  ];
  if (!uniqueItems.length) {
    return { error: "No hay formaciones válidas en la bolsa para inscribir" };
  }

  let transactionResult: { created: string[]; alreadyEnrolled: string[] };
  try {
    transactionResult = await withSerializableRetry(async (tx) => {
      const existingInscriptions = await tx.inscription.findMany({
        where: {
          userId,
          cursoId: { in: uniqueItems.map((item) => item.cursoId) },
          status: { in: ["PENDING", "APPROVED"] },
        },
        select: { cursoId: true },
      });
      const alreadyEnrolledSet = new Set(existingInscriptions.map((i) => i.cursoId));
      const alreadyEnrolled: string[] = [];
      const pending: typeof uniqueItems = [];

      for (const item of uniqueItems) {
        if (alreadyEnrolledSet.has(item.cursoId)) {
          alreadyEnrolled.push(item.cursoId);
        } else {
          pending.push(item);
        }
      }

      if (pending.length) {
        await tx.inscription.createMany({
          data: pending.map((item) => ({
            method: data.method,
            reference: data.reference || null,
            phoneNumber: data.phoneNumber || null,
            amountPaid: item.amountPaid,
            receiptImage: data.receiptImage || null,
            cursoId: item.cursoId,
            userId,
            status: "PENDING" as const,
          })),
        });
      }
      return { created: pending.map((item) => item.cursoId), alreadyEnrolled };
    });
  } catch (error) {
    console.error("Error creating bag inscriptions:", error);
    return { error: "Ocurrió un error al procesar tu pago. Inténtalo de nuevo." };
  }
  const { created, alreadyEnrolled } = transactionResult;

  if (!created.length) {
    return {
      error: "Ya tienes un comprobante de pago pendiente o acceso activo en todas las formaciones de tu bolsa.",
      alreadyEnrolled,
    };
  }

  await logActivity({
    userId: session.user.id,
    action: "COURSE_PAYMENT_SUBMITTED",
    entityType: "INSCRIPTION",
    entityId: created.join(","),
    details: {
      type: "BAG",
      targetIds: created,
      method: data.method,
      amount: created.reduce(
        (acc, id) => acc + (uniqueItems.find((i) => i.cursoId === id)?.amountPaid ?? 0),
        0
      ),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard/mis-cursos");

  return { success: true, inscriptionIds: created, alreadyEnrolled };
}
