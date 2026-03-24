import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminEmail = "newman@artica.group";
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" }, // Aseguramos el rol
      create: {
        email: adminEmail,
        name: "Newman Acosta",
        password: hashedPassword,
        // @ts-ignore
        role: "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user: admin.email, role: admin.role });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
