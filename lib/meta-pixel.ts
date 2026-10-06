import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getMetaPixelId(): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("meta-pixel");

  try {
    const row = await prisma.platformApiConfig.findUnique({
      where: { provider: "meta" },
    });
    const config = row?.config as { pixelId?: string } | null;
    const id = config?.pixelId?.trim() ?? "";
    return /^\d{5,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
