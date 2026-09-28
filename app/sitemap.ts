import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllWorkshops } from "@/lib/data/workshops";
import { getAllOnlineCourses } from "@/lib/data/online-courses";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://anaspastryshop.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`,             changeFrequency: "daily",   priority: 1.0 },
    { url: `${siteUrl}/cursos`,       changeFrequency: "daily",   priority: 0.9 },
    { url: `${siteUrl}/workshops`,    changeFrequency: "weekly",  priority: 0.9 },
    { url: `${siteUrl}/pasteleria`,   changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/pasantias`,    changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/nosotros`,     changeFrequency: "monthly", priority: 0.6 },
  ];

  const workshopEntries: MetadataRoute.Sitemap = getAllWorkshops().map((w) => ({
    url: `${siteUrl}/workshop/${w.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Los cursos online del catálogo estático siempre son públicos.
  const staticCourseEntries: MetadataRoute.Sitemap = getAllOnlineCourses().map((c) => ({
    url: `${siteUrl}/cursos/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  let courseEntries: MetadataRoute.Sitemap = [];
  try {
    const courses = await prisma.curso.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, createdAt: true, isLive: true },
    });
    const known = new Set(staticCourseEntries.map((e) => e.url));
    courseEntries = courses
      // Los workshops presenciales se sirven en /workshop/<slug>, no en /cursos/.
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
