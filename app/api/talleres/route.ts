import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const talleres = await prisma.taller.findMany({
      include: {
        instructor: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(talleres);
  } catch (error) {
    console.error("Error fetching talleres:", error);
    return NextResponse.json({ error: "Failed to fetch talleres" }, { status: 500 });
  }
}
