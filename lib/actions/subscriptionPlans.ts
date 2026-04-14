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

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export type PlanData = {
  name: string;
  price: number;
  description?: string;
  hasLiveAccess: boolean;
  hasWebinarAccess: boolean;
  moduleIds: string[];
  paymentMethods: string[];
  isActive?: boolean;
};

export async function getPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
}

export async function createPlan(data: PlanData) {
  await requireAdmin();
  const slug = slugify(data.name);
  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        slug,
        price: data.price,
        description: data.description || null,
        hasLiveAccess: data.hasLiveAccess,
        hasWebinarAccess: data.hasWebinarAccess,
        moduleIds: data.moduleIds,
        paymentMethods: data.paymentMethods,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/dashboard/suscripciones");
    return { success: true, plan };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Ya existe un plan con ese nombre" };
    return { error: "Error al crear el plan" };
  }
}

export async function updatePlan(id: string, data: Partial<PlanData>) {
  await requireAdmin();
  try {
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.name ? slugify(data.name) : undefined,
        price: data.price,
        description: data.description,
        hasLiveAccess: data.hasLiveAccess,
        hasWebinarAccess: data.hasWebinarAccess,
        moduleIds: data.moduleIds,
        paymentMethods: data.paymentMethods,
        isActive: data.isActive,
      },
    });
    revalidatePath("/dashboard/suscripciones");
    return { success: true, plan };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Ya existe un plan con ese nombre" };
    return { error: "Error al actualizar el plan" };
  }
}

export async function deletePlan(id: string) {
  await requireAdmin();
  await prisma.subscriptionPlan.delete({ where: { id } });
  revalidatePath("/dashboard/suscripciones");
  return { success: true };
}
