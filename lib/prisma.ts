import { PrismaClient } from "@prisma/client";

// Evitamos que TypeScript se queje por la propiedad global
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Creamos la instancia única de Prisma
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// En desarrollo, guardamos la instancia en el objeto global para reutilizarla
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;