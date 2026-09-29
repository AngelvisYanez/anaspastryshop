import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllWorkshops } from "@/lib/data/workshops";
import { getAllOnlineCourses } from "@/lib/data/online-courses";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${siteUrl}/cursos`, changeFrequency: "daily", priority: 0.95, lastModified: now },
    { url: `${siteUrl}/workshops`, changeFrequency: "weekly", priority: 0.95, lastModified: now },
    { url: `${siteUrl}/workshops/calendario`, changeFrequency: "weekly", priority: 0.85, lastModified: now },
    { url: `${siteUrl}/pasteleria`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${siteUrl}/nosotros`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
  ];

  const workshopEntries: MetadataRoute.Sitemap = getAllWorkshops().map((w) => ({
    url: `${siteUrl}/workshop/${w.slug}`,
    changeFrequency: "weekly",
    priority: 0.85,
    lastModified: now,
  }));

  const staticCourseEntries: MetadataRoute.Sitemap = getAllOnlineCourses().map((c) => ({
    url: `${siteUrl}/cursos/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: now,
  }));

  let courseEntries: MetadataRoute.Sitemap = [];
  try {
    const courses = await prisma.curso.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, createdAt: true, isLive: true },
    });
    const known = new Set(staticCourseEntries.map((e) => e.url));
    courseEntries = courses
      .filter((c) => !c.isLive)
      .map((c) => ({
        url: `${siteUrl}/cursos/${c.slug ?? c.id}`,
        lastModified: c.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
      .filter((e) => !known.has(e.url));
  } catch {
    courseEntries = [];
  }

  return [...staticPages, ...workshopEntries, ...staticCourseEntries, ...courseEntries];
}
