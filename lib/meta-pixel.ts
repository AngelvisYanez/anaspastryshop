import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

const DEFAULT_META_PIXEL_ID = "1470119374448900";

export async function getMetaPixelId(): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("meta-pixel");

  try {
    const row = await prisma.platformApiConfig.findUnique({
      where: { provider: "meta" },
    });
    const config = row?.config as { pixelId?: string } | null;
    const id = typeof config?.pixelId === "string" ? config.pixelId.trim() : "";
    if (!id) return DEFAULT_META_PIXEL_ID;
    return /^\d{5,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
