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

export async function getAllApiConfigs() {
  return prisma.platformApiConfig.findMany({ orderBy: { provider: "asc" } });
}

export async function saveApiConfig(
  provider: string,
  label: string,
  config: Record<string, string>
) {
  await requireAdmin();
  try {
    await prisma.platformApiConfig.upsert({
      where: { provider },
      update: { label, config },
      create: { provider, label, config },
    });
    revalidatePath("/dashboard/api-config");
    return { success: true };
  } catch {
    return { error: "Error al guardar la configuración" };
  }
}

export async function getRtkConfig() {
  const dbConfig = await prisma.platformApiConfig.findUnique({
    where: { provider: "CLOUDFLARE_RTK" },
  });

  const config = dbConfig?.config as Record<string, string> | null;

  return {
    accountId: config?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "",
    appId: config?.appId || process.env.CLOUDFLARE_RTK_APP_ID || "",
    apiToken: config?.apiToken || process.env.CLOUDFLARE_API_TOKEN || "",
  };
}
