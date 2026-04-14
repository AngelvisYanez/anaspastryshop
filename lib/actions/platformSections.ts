"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ALL_ROLES = ["ADMIN", "MENTOR", "USER"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function getSections() {
  return prisma.platformSection.findMany({ orderBy: { order: "asc" } });
}

export async function createSection(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const icon = formData.get("icon") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const rolesRaw = formData.get("roles") as string;
  const roles = rolesRaw ? rolesRaw.split(",").filter(Boolean) : ALL_ROLES;

  try {
    const section = await prisma.platformSection.create({
      data: { name, slug, icon, order, roles },
    });
    revalidatePath("/dashboard/modulos");
    return { section };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "El slug ya existe, elige otro" };
    return { error: "Error al crear el módulo" };
  }
}

export async function updateSection(
  id: string,
  data: {
    name?: string;
    slug?: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
    roles?: string[];
  }
) {
  await requireAdmin();
  try {
    const section = await prisma.platformSection.update({ where: { id }, data });
    revalidatePath("/dashboard/modulos");
    return { section };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "El slug ya existe" };
    return { error: "Error al actualizar el módulo" };
  }
}

export async function deleteSection(id: string) {
  await requireAdmin();
  await prisma.platformSection.delete({ where: { id } });
  revalidatePath("/dashboard/modulos");
  return { success: true };
}
