import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function withSerializableRetry<T>(operation: (tx: TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034" || attempt === 2) throw error;
    }
  }
  throw new Error("No se pudo completar la transacción");
}
