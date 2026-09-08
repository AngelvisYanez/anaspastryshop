"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export type GalleryItemData = {
  id: string;
  imageUrl: string;
  alt: string | null;
  caption: string | null;
  order: number;
  createdAt: Date;
};

export async function getGalleryItems(): Promise<GalleryItemData[]> {
  return prisma.galleryItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export async function addGalleryItem(formData: FormData) {
  await requireAdmin();

  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const alt = (formData.get("alt") as string)?.trim() || null;
  const caption = (formData.get("caption") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;

  if (!imageUrl) {
    return { error: "La imagen es obligatoria" };
  }

  try {
    const item = await prisma.galleryItem.create({
      data: { imageUrl, alt, caption, order },
    });
    revalidatePath("/pasteleria");
    revalidatePath("/dashboard/galeria");
    return { item };
  } catch (error) {
    return { error: "No se pudo guardar la imagen" };
  }
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();

  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/pasteleria");
  revalidatePath("/dashboard/galeria");
  return { success: true };
}

export async function updateGalleryItem(
  id: string,
  data: { alt?: string; caption?: string; order?: number }
) {
  await requireAdmin();

  const item = await prisma.galleryItem.update({
    where: { id },
    data,
  });
  revalidatePath("/pasteleria");
  revalidatePath("/dashboard/galeria");
  return { item };
}