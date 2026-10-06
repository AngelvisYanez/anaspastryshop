"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, updateTag } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function getAllApiConfigs() {
  await requireAdmin();
  return prisma.platformApiConfig.findMany({ orderBy: { provider: "asc" } });
}

export async function saveApiConfig(
  provider: string,
  label: string,
  config: Record<string, string>
) {
  await requireAdmin();
  const cleaned = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.trim()])
  );
  try {
    await prisma.platformApiConfig.upsert({
      where: { provider },
      update: { label, config: cleaned },
      create: { provider, label, config: cleaned },
    });
    revalidatePath("/dashboard/settings");
    revalidatePath("/pasteleria");
    revalidatePath("/", "layout");
    updateTag("instagram-feed");
    updateTag("meta-pixel");
    return { success: true };
  } catch {
    return { error: "Error al guardar la configuración" };
  }
}
