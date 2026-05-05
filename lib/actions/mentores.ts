"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { sendAccountApprovedEmail } from "@/lib/email";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado. Solo administradores.");
  }
  return session;
}

export async function aprobarMentor(id: string) {
  const session = await assertAdmin();

  const mentor = await prisma.user.update({
    where: { id },
    data: { isApproved: true },
    select: { email: true, name: true },
  });

  sendAccountApprovedEmail(mentor.email, mentor.name).catch(() => {});

  await logActivity({
    userId: session.user.id as string,
    action: "APPROVE",
    entityType: "MENTOR",
    entityId: id,
    details: { message: "Mentor aprobado" },
  });

  revalidatePath("/dashboard/mentores");
}

/** Revoca acceso a un mentor (isApproved = false) */
export async function revocarMentor(id: string) {
  const session = await assertAdmin();

  await prisma.user.update({
    where: { id },
    data: { isApproved: false },
  });

  await logActivity({
    userId: session.user.id as string,
    action: "REVOKE",
    entityType: "MENTOR",
    entityId: id,
    details: { message: "Mentor revocado" },
  });

  revalidatePath("/dashboard/mentores");
}

/** Edita nombre e imagen de un mentor */
export async function editarMentor(id: string, formData: FormData) {
  const session = await assertAdmin();

  const name = formData.get("name") as string;
  const image = formData.get("image") as string | null;

  if (!name?.trim()) return { error: "El nombre no puede estar vacío." };

  await prisma.user.update({
    where: { id },
    data: {
      name: name.trim(),
      image: image?.trim() || null,
    },
  });

  await logActivity({
    userId: session.user.id as string,
    action: "UPDATE",
    entityType: "MENTOR",
    entityId: id,
    details: { name },
  });

  revalidatePath("/dashboard/mentores");
}

export async function eliminarMentor(id: string) {
  const session = await assertAdmin();

  const mentor = await prisma.user.findUnique({
    where: { id },
  });

  if (!mentor) return { error: "Mentor no encontrado." };

  await prisma.user.delete({ where: { id } });

  await logActivity({
    userId: session.user.id as string,
    action: "DELETE",
    entityType: "MENTOR",
    entityId: id,
    details: { email: mentor.email },
  });

  revalidatePath("/dashboard/mentores");
}
