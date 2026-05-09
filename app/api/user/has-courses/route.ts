import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ hasCourses: false });

  const [purchase, inscription] = await Promise.all([
    prisma.coursePurchase.findFirst({
      where: { userId: session.user.id, status: "COMPLETED" },
      select: { id: true },
    }),
    prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        NOT: { cursoId: null },
      },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({ hasCourses: !!(purchase || inscription) });
}
