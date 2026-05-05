import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const role = (session.user as any).role as string;
  let count = 0;

  try {
    if (role === "ADMIN") {
      count = await prisma.inscription.count({ where: { status: "PENDING" } });
    }
  } catch {
    count = 0;
  }

  return NextResponse.json({ count });
}
