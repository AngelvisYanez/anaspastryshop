"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function getAllGatewayConfigs() {
  return prisma.paymentGatewayConfig.findMany();
}

export async function saveGatewayConfig(
  provider: string,
  data: {
    isEnabled: boolean;
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    extraConfig?: Record<string, string>;
  }
) {
  await requireAdmin();
  try {
    const config = await prisma.paymentGatewayConfig.upsert({
      where: { provider },
      update: {
        isEnabled: data.isEnabled,
        publicKey: data.publicKey || null,
        secretKey: data.secretKey || null,
        webhookSecret: data.webhookSecret || null,
        extraConfig: data.extraConfig ?? undefined,
      },
      create: {
        provider,
        isEnabled: data.isEnabled,
        publicKey: data.publicKey || null,
        secretKey: data.secretKey || null,
        webhookSecret: data.webhookSecret || null,
        extraConfig: data.extraConfig ?? undefined,
      },
    });
    revalidatePath("/dashboard/metodos-pago");
    return { success: true, config };
  } catch {
    return { error: "Error al guardar la configuración" };
  }
}

