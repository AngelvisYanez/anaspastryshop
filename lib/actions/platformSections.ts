"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { moduleBySlug, isExistingModuleRoute } from "@/lib/dashboard-modules";

function refreshModules() {
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/modulos');
}

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
  const slug = String(formData.get("slug") ?? '').trim();
  const icon = formData.get("icon") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const rolesRaw = formData.get("roles") as string;
  const roles = rolesRaw ? rolesRaw.split(",").filter(Boolean) : ["ADMIN", "USER"];

  if (!isExistingModuleRoute(slug) || moduleBySlug(slug)) return { error: 'Selecciona una ruta existente del dashboard que no esté en la lista.' };
  if (slug === 'cursos/create' && (roles.length !== 1 || roles[0] !== 'ADMIN')) return { error: 'Esta pantalla solo está disponible para administradores.' };
  if (!name.trim() || roles.length === 0) return { error: 'Indica un nombre y al menos un rol.' };

  try {
    const section = await prisma.platformSection.create({
      data: { name, slug, icon, order, roles },
    });
    refreshModules();
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
    const virtualSlug = id.startsWith('builtin:') ? id.slice(8) : null;
    const existing = virtualSlug ? null : await prisma.platformSection.findUnique({ where: { id } });
    const builtIn = moduleBySlug(virtualSlug ?? existing?.slug ?? '');
    if (builtIn) {
      const section = await prisma.platformSection.upsert({
        where: { slug: builtIn.slug },
        create: { name: builtIn.name, slug: builtIn.slug, icon: builtIn.icon, roles: [...builtIn.roles], order: data.order ?? 0, isActive: data.isActive ?? true },
        update: { order: data.order, isActive: data.isActive },
      });
      refreshModules();
      return { section: { ...section, name: builtIn.name, icon: builtIn.icon, roles: [...builtIn.roles] } };
    }
    if (!existing || !isExistingModuleRoute(data.slug ?? existing.slug)) return { error: 'La ruta no corresponde a una pantalla existente.' };
    if ((data.slug ?? existing.slug) === 'cursos/create' && data.roles && (data.roles.length !== 1 || data.roles[0] !== 'ADMIN')) return { error: 'Esta pantalla solo está disponible para administradores.' };
    if (data.roles && data.roles.length === 0) return { error: 'Selecciona al menos un rol.' };
    const section = await prisma.platformSection.update({ where: { id }, data });
    refreshModules();
    return { section };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "El slug ya existe" };
    return { error: "Error al actualizar el módulo" };
  }
}

export async function deleteSection(id: string) {
  await requireAdmin();
  if (id.startsWith('builtin:')) return { success: false };
  const existing = await prisma.platformSection.findUnique({ where: { id } });
  if (!existing || moduleBySlug(existing.slug)) return { success: false };
  await prisma.platformSection.delete({ where: { id } });
  refreshModules();
  return { success: true };
}
