import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.siteConfig.findFirst();
  return NextResponse.json(config ?? {
    siteName: "Academia Omnia",
    ctaText: "Quiero unirme ahora",
    ctaUrl: "/planes",
    subscriptionPrice: 97,
    navItems: [],
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();

  const config = await prisma.siteConfig.findFirst();

  const data = {
    siteName: body.siteName,
    logoUrl: body.logoUrl ?? null,
    ctaText: body.ctaText,
    ctaUrl: body.ctaUrl,
    instagramUrl: body.instagramUrl ?? null,
    linkedinUrl: body.linkedinUrl ?? null,
    tiktokUrl: body.tiktokUrl ?? null,
    subscriptionPrice: parseFloat(body.subscriptionPrice) || 97,
    subscriptionPriceId: body.subscriptionPriceId ?? null,
    navItems: body.navItems ?? [],
  };

  const updated = config
    ? await prisma.siteConfig.update({ where: { id: config.id }, data })
    : await prisma.siteConfig.create({ data });

  return NextResponse.json(updated);
}
