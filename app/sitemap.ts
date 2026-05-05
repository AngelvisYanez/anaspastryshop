import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://academiacreditousa.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let courseEntries: MetadataRoute.Sitemap = [];

  try {
    const cursos = await prisma.curso.findMany({
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    courseEntries = cursos.map((c) => ({
      url: `${siteUrl}/cursos/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    courseEntries = [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/cursos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/membresia`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/lives`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/nosotros`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/pasantias`, changeFrequency: "monthly", priority: 0.6 },
  ];

  return [...staticPages, ...courseEntries];
}
