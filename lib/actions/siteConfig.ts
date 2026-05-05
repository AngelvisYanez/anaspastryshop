"use server";

import { prisma } from "@/lib/prisma";

export async function getSiteConfig() {
  try {
    return await prisma.siteConfig.findFirst();
  } catch {
    return null;
  }
}
