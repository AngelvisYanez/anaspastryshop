"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";

type CreateInscriptionParams = {
  cursoId?: string;
  method: "ZELLE" | "PAGO_MOVIL" | "USDT" | "TRANSFERENCIA";
  reference?: string;
  phoneNumber?: string;
  amountPaid: number;
  receiptImage?: string;
};

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
