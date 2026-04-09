"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { logActivity } from "@/lib/logger";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleStr = formData.get("role") as string || "USER"; // Capturamos el rol

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

    return { success: true };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { error: "Hubo un error al registrar el usuario" };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales invalidas" };
        default:
          return { error: "Algo salio mal" };
      }
    }
    throw error;
  }
}

export async function checkPreloginStatus(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const isValid = await bcrypt.compare(password, user.password!);
    if (isValid) {
      if (user.role === "MENTOR" && !user.isApproved) {
        return { isPendingMentor: true };
      }
      if (user.role === "USER" && !user.isActive) {
        return { isSuspended: true, reason: user.deactivationReason };
      }
    }
  }
  return { isPendingMentor: false, isSuspended: false };
}
