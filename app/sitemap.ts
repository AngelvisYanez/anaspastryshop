import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL || "https://anaspastryshop.com";

  let courseEntries: MetadataRoute.Sitemap = [];
  try {
    const courses = await prisma.curso.findMany({
      select: { id: true, createdAt: true },
    });
    courseEntries = courses.map((c) => ({
      url: `${siteUrl}/cursos/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    courseEntries = [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                              changeFrequency: "daily",   priority: 1.0 },
    { url: `${siteUrl}/cursos`,                  changeFrequency: "daily",   priority: 0.9 },
    { url: `${siteUrl}/nosotros`,                changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/registro`,                changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/iniciar-sesion`,          changeFrequency: "monthly", priority: 0.4 },
  ];

  return [...staticPages, ...courseEntries];
}
