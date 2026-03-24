"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string; // Mock URL for now
  const newPassword = formData.get("newPassword") as string;

  try {
    const updateData: any = {
      name,
      image,
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
