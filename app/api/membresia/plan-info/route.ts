import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
    select: { name: true, price: true, description: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(plan ?? { name: "Membresía Academia", price: 97, description: null });
}
