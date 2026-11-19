"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";
import { Prisma } from "@prisma/client";
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

async function avatarUpdate(formData: FormData, userId: string): Promise<
  { data: Prisma.UserUpdateInput; remove: boolean } | { error: string }
> {
  const upload = formData.get("avatar");
  if (upload instanceof File && upload.name) {
    const error = avatarFileError(upload);
    if (error) return { error };
    try {
      const { processAvatar } = await import("@/lib/process-avatar");
      const data = Uint8Array.from(await processAvatar(upload));
      return {
        data: {
          image: `${avatarPath}${userId}?v=${randomUUID()}`,
          avatar: { upsert: { create: { data }, update: { data } } },
        },
        remove: false,
      };
    } catch {
      return { error: "No se pudo leer la foto. Selecciona otro archivo JPG, PNG o WebP." };
    }
  }
  if (formData.get("removeAvatar") === "true") return { data: { image: null }, remove: true };
  const legacyImage = formData.get("image");
  return { data: typeof legacyImage === "string" ? { image: normalizeUserImage(legacyImage) } : {}, remove: false };
}

async function saveUser(userId: string, data: Prisma.UserUpdateInput, removeAvatar: boolean) {
  const update = prisma.user.update({ where: { id: userId }, data });
  if (removeAvatar) {
    await prisma.$transaction([update, prisma.userAvatar.deleteMany({ where: { userId } })]);
  } else {
    await update;
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("No autorizado");
  }

  const name = formData.get("name");
  const newPassword = formData.get("newPassword");
  if (typeof name !== "string" || !name.trim()) return { error: "Escribe tu nombre." };
  if (name.trim().length > 120) return { error: "El nombre debe tener hasta 120 caracteres." };

  try {
    const updateData: Prisma.UserUpdateInput = {
      name: name.trim(),
      ...(formData.has("whatsappPreferences") || formData.has("whatsappMarketing")
        ? { whatsappMarketing: formData.get("whatsappMarketing") === "on" }
        : {}),
    };

    const photo = await avatarUpdate(formData, userId);
    if ("error" in photo) return { error: photo.error };
    Object.assign(updateData, photo.data);

    if (typeof newPassword === "string" && newPassword.trim()) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await saveUser(userId, updateData, photo.remove);

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

export async function adminEditUser(id: string, formData: FormData) {
  const session = await assertAdmin();

  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const name = text("name");
  const email = text("email").toLowerCase();
  const role = text("role");
  const whatsappNumber = text("whatsappNumber").replace(/[\s()-]/g, "");
  const password = formData.get("newPassword");
  const isActive = formData.get("isActive") === "true";
  const deactivationReason = text("deactivationReason");

  if (!name || name.length > 120) return { error: "Escribe un nombre de hasta 120 caracteres." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return { error: "Ingresa un correo electrónico válido." };
  if (role !== "USER" && role !== "ADMIN") return { error: "Rol inválido." };
  if (whatsappNumber && !/^\+[1-9]\d{7,14}$/.test(whatsappNumber))
    return { error: "Ingresa un número de WhatsApp con código de país." };
  if (typeof password === "string" && password && (password.trim().length < 8 || Buffer.byteLength(password) > 72))
    return { error: "Usa una contraseña de al menos 8 caracteres y hasta 72 bytes." };
  if (session.user.id === id && (role !== "ADMIN" || !isActive)) {
    return { error: "Tu cuenta debe conservar el rol de administrador y el acceso activo." };
  }
  if (deactivationReason.length > 300) return { error: "El motivo de suspensión admite hasta 300 caracteres." };

  try {
    const photo = await avatarUpdate(formData, id);
    if ("error" in photo) return { error: photo.error };
    const data: Prisma.UserUpdateInput = {
      ...photo.data,
      name, email, role, isActive,
      whatsappNumber: whatsappNumber || null,
      whatsappMarketing: Boolean(whatsappNumber) && formData.get("whatsappMarketing") === "on",
      isApproved: formData.get("isApproved") === "on",
      deactivationReason: isActive ? null : deactivationReason || null,
    };
    if (typeof password === "string" && password) data.password = await bcrypt.hash(password, 10);
    await saveUser(id, data, photo.remove);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ese correo ya pertenece a otra cuenta." };
    }
    return { error: "No se pudo actualizar el usuario. Revisa los datos e inténtalo de nuevo." };
  }

  await logActivity({
    userId: session.user.id as string,
    action: "UPDATE",
    entityType: "USER",
    entityId: id,
    details: { name, role },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
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
