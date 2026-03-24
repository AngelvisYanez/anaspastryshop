"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";

type CreateInscriptionParams = {
  tallerId?: string;
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

  if (!data.tallerId && !data.cursoId) {
    return { error: "Debe proveer un ID de Taller o Curso" };
  }

  try {
    // Verificar si ya está inscrito
    // @ts-ignore
    const existing = await prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { tallerId: data.tallerId || undefined },
          { cursoId: data.cursoId || undefined },
        ],
      },
    });

    if (existing) {
      return { error: "Ya existe una inscripción para este evento o curso" };
    }

    // @ts-ignore
    const inscription = await prisma.inscription.create({
      data: {
        method: data.method,
        reference: data.reference || null,
        phoneNumber: data.phoneNumber || null,
        amountPaid: data.amountPaid,
        receiptImage: data.receiptImage || null,
        tallerId: data.tallerId,
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
        type: data.tallerId ? "TALLER" : "CURSO", 
        targetId: data.tallerId || data.cursoId,
        method: data.method 
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/talleres");
    revalidatePath("/cursos");
    
    return { success: true, inscriptionId: inscription.id };
  } catch (error) {
    console.error("Error creating inscription:", error);
    return { error: "Ocurrió un error al procesar tu pago. Inténtalo de nuevo." };
  }
}

