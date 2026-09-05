"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logActivity } from "@/lib/logger";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAdminNewUserEmail,
} from "@/lib/email";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://academiaomnia.com";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleStr = (formData.get("role") as string) || "USER";

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "El correo ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // @ts-ignore
        role: roleStr,
      },
    });

    await logActivity({
      userId: newUser.id,
      action: "REGISTER",
      entityType: "USER",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    sendWelcomeEmail(newUser.email, newUser.name).catch(() => {});
    sendAdminNewUserEmail(
      newUser.name ?? "Sin nombre",
      newUser.email,
      newUser.role,
    ).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { error: "Hubo un error al registrar el usuario" };
  }
}

export async function checkPreloginStatus(formData: FormData) {
  try {
    const identifier = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = identifier.includes("@")
      ? await prisma.user.findUnique({ where: { email: identifier } })
      : await prisma.user.findFirst({
          where: { name: { equals: identifier, mode: "insensitive" } },
        });

    if (user) {
      const isValid = await bcrypt.compare(password, user.password!);
      if (isValid) {
        if (user.role === "MENTOR" && !user.isApproved) {
          return { isPendingMentor: true };
        }
        if (!user.isActive) {
          return { isSuspended: true, reason: user.deactivationReason };
        }
      }
    }
  } catch {}
  return { isPendingMentor: false, isSuspended: false };
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { error: "El correo es obligatorio" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, email, expiresAt },
    });

    const resetUrl = `${BASE_URL}/restablecer-contrasena?token=${token}`;
    sendPasswordResetEmail(user.email, user.name, resetUrl).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Error en requestPasswordReset:", error);
    return { error: "Ocurrió un error. Intenta de nuevo." };
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return { error: "Todos los campos son obligatorios" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      return {
        error: "El enlace no es válido o ha expirado. Solicita uno nuevo.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: record.email },
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return { error: "Ocurrió un error. Intenta de nuevo." };
  }
}
