"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";
import type { Prisma } from "@prisma/client";
import { avatarFileError, avatarPath } from "@/lib/avatar";
import { randomUUID } from "node:crypto";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado. Solo administradores.");
  }
  return session;
}

function normalizeUserImage(raw: string | null | undefined): string | null {
  const image = raw?.trim() || null;
  if (!image) return null;
  // data: URLs in JWT cookies cause HTTP 431 (Request Header Fields Too Large).
  if (image.startsWith("data:")) {
    throw new Error("Usa una URL de imagen (no un archivo embebido en base64).");
  }
  if (image.length > 2048) {
    throw new Error("La URL de imagen es demasiado larga.");
  }
  return image;
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("No autorizado");
  }

  const name = formData.get("name");
  const image = formData.get("image");
  const newPassword = formData.get("newPassword");
  const upload = formData.get("avatar");
  const removeAvatar = formData.get("removeAvatar") === "true";
  if (typeof name !== "string" || !name.trim()) return { error: "Escribe tu nombre." };
  if (name.trim().length > 120) return { error: "El nombre debe tener hasta 120 caracteres." };

  try {
    const updateData: Prisma.UserUpdateInput = {
      name: name.trim(),
      ...(formData.has("whatsappPreferences") || formData.has("whatsappMarketing")
        ? { whatsappMarketing: formData.get("whatsappMarketing") === "on" }
        : {}),
    };

    if (upload instanceof File && upload.name) {
      const error = avatarFileError(upload);
      if (error) return { error };
      let data: Uint8Array<ArrayBuffer>;
      try {
        const { processAvatar } = await import("@/lib/process-avatar");
        data = Uint8Array.from(await processAvatar(upload));
      } catch {
        return { error: "No se pudo leer la foto. Selecciona otro archivo JPG, PNG o WebP." };
      }
      updateData.image = `${avatarPath}${userId}?v=${randomUUID()}`;
      updateData.avatar = { upsert: { create: { data }, update: { data } } };
    } else if (removeAvatar) {
      updateData.image = null;
    } else if (typeof image === "string") {
      updateData.image = normalizeUserImage(image);
    }

    if (typeof newPassword === "string" && newPassword.trim()) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const update = prisma.user.update({ where: { id: userId }, data: updateData });
    if (removeAvatar && !updateData.avatar) {
      await prisma.$transaction([update, prisma.userAvatar.deleteMany({ where: { userId } })]);
    } else {
      await update;
    }

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof Error && (error.message.includes("URL") || error.message.includes("base64"))) {
      return { error: error.message };
    }
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
  if (!["USER", "ADMIN"].includes(role))
    return { error: "Rol inválido." };

  let safeImage: string | null;
  try {
    safeImage = normalizeUserImage(image);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Imagen inválida." };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: name.trim(),
      image: safeImage,
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
}

export const adminUpdateUser = adminEditUser;

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
      _count: { select: { inscripciones: true } },
    },
  });

  if (!user) return { error: "Usuario no encontrado." };

  const instructedCourses = await prisma.curso.findMany({
    where: { instructorId: id },
    select: { id: true },
  });

  // No eliminar en cascada los cursos/workshops del usuario: se transfieren al admin que ejecuta la acción.
  if (instructedCourses.length > 0) {
    await prisma.curso.updateMany({
      where: { instructorId: id },
      data: { instructorId: session.user.id },
    });
  }

  // Igual para lives y webinars: transferir en lugar de cascada.
  await prisma.liveStream.updateMany({
    where: { instructorId: id },
    data: { instructorId: session.user.id },
  });
  await prisma.webinar.updateMany({
    where: { instructorId: id },
    data: { instructorId: session.user.id },
  });

  await prisma.coursePurchase.deleteMany({ where: { userId: id } });
  await prisma.inscription.deleteMany({ where: { userId: id } });
  await prisma.activityLog.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  await logActivity({
    userId: session.user.id as string,
    action: "DELETE",
    entityType: "USER",
    entityId: id,
    details: { email: user.email, role: user.role },
  });

  revalidatePath("/dashboard/usuarios");
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
