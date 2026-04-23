"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const session = await auth();

  // @ts-ignore
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Acceso denegado. Sólo administradores pueden crear categorías." };
  }

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") {
    return { error: "El nombre es obligatorio" };
  }

  try {
    // @ts-ignore
    const newCategory = await prisma.category.create({
      data: { name: name.trim() },
    });

    await logActivity({
      userId: session.user.id as string,
      action: "CREATE",
      entityType: "CATEGORY",
      entityId: newCategory.id,
      details: { name: newCategory.name },
    });
    
    revalidatePath("/dashboard/categorias");
    return { category: newCategory };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Esta categoría ya existe" };
    }
    console.error("Error creating category:", error);
    return { error: "Error al crear la categoría" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();

  // @ts-ignore
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Acceso denegado" };
  }

  try {
    // @ts-ignore
    await prisma.category.delete({
      where: { id },
    });

    await logActivity({
      userId: session.user.id as string,
      action: "DELETE",
      entityType: "CATEGORY",
      entityId: id,
    });
    
    revalidatePath("/dashboard/categorias");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "No se pudo eliminar la categoría" };
  }
}
