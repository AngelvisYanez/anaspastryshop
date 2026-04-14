"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado. Solo administradores.");
  }
  return session;
}

export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    const updateData: any = { 
      name,
      image: image && image.trim() !== "" ? image : null 
    };

    if (newPassword && newPassword.trim() !== "") {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "No se pudo actualizar el perfil" };
  }
}

/** ADMIN: Edita cualquier usuario (nombre, imagen, rol) */
export async function adminEditUser(id: string, formData: FormData) {
  const session = await assertAdmin();

  const name = formData.get("name") as string;
  const image = formData.get("image") as string | null;
  const role = formData.get("role") as string;

  if (!name?.trim()) return { error: "El nombre no puede estar vacío." };
  if (!["USER", "MENTOR", "ADMIN"].includes(role))
    return { error: "Rol inválido." };

  await prisma.user.update({
    where: { id },
    data: {
      name: name.trim(),
      image: image?.trim() || null,
      role,
    },
  });

  await logActivity({
    userId: session.user.id as string,
    action: "UPDATE",
    entityType: "USER",
    entityId: id,
    details: { name, role },
  });

  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/mentores");
}

/** ADMIN: Elimina cualquier usuario */
export async function adminDeleteUser(id: string) {
  const session = await assertAdmin();

  // Proteger: no puede autoeliminarse
  if (session.user.id === id) {
    return { error: "No puedes eliminarte a ti mismo." };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { talleres: true, inscripciones: true } },
    },
  });

  if (!user) return { error: "Usuario no encontrado." };

  if (user._count.talleres > 0) {
    return {
      error: `Este mentor tiene ${user._count.talleres} taller(es) activo(s). Elimínalos o reasígnalos primero.`,
    };
  }

  // Eliminar inscripciones primero (FK constraint)
  await prisma.inscription.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  await logActivity({
    userId: session.user.id as string,
    action: "DELETE",
    entityType: "USER",
    entityId: id,
    details: { email: user.email, role: user.role },
  });

  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/mentores");
}

export async function adminToggleUserStatus(userId: string, isActive: boolean, reason?: string) {
  const session = await assertAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true }
  });

  if (!user) {
    return { error: "Usuario no encontrado" };
  }

  // Only allow suspending standard users
  if (user.role !== "USER") {
    return { error: "Solo se puede desactivar o reactivar a alumnos (usuarios con rol USER)." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive,
        deactivationReason: isActive ? null : reason || "Sin razón especificada",
      },
    });

    await logActivity({
      userId: session.user.id as string,
      action: isActive ? "REACTIVATE" : "SUSPEND",
      entityType: "USER",
      entityId: userId,
      details: { email: user.email, reason: isActive ? "N/A" : reason },
    });

    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return { error: "Hubo un error al cambiar el estado del usuario" };
  }
}

/** ADMIN: Asigna o cambia el plan de suscripción de un usuario */
export async function adminAssignPlan(userId: string, planSlug: string | null) {
  await assertAdmin();

  if (!planSlug) {
    await prisma.subscription.deleteMany({ where: { userId } });
    revalidatePath("/dashboard/usuarios");
    return { success: true };
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) return { error: "Plan no encontrado" };

  await prisma.subscription.upsert({
    where: { userId },
    update: { plan: planSlug, status: "ACTIVE", startDate: new Date(), endDate: null },
    create: { userId, plan: planSlug, status: "ACTIVE" },
  });

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}

/** Obtener imagen de perfil del usuario actual (evita cookies pesadas) */
export async function getUserImage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true }
  });

  return user?.image || null;
}
