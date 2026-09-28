import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.siteConfig.findFirst();
  return NextResponse.json(config ?? {
    siteName: "Ana's Pastry Shop",
    ctaText: "Ver Talleres Presenciales",
    ctaUrl: "/cursos",
    navItems: [],
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [body, config] = await Promise.all([req.json(), prisma.siteConfig.findFirst()]);

  const data = {
    siteName: body.siteName,
    logoUrl: body.logoUrl ?? null,
    ctaText: body.ctaText,
    ctaUrl: body.ctaUrl,
    instagramUrl: body.instagramUrl ?? null,
    linkedinUrl: body.linkedinUrl ?? null,
    tiktokUrl: body.tiktokUrl ?? null,
    navItems: body.navItems ?? [],
  };

  const updated = config
    ? await prisma.siteConfig.update({ where: { id: config.id }, data })
    : await prisma.siteConfig.create({ data });

  return NextResponse.json(updated);
}
