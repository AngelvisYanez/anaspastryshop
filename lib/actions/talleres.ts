"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearTaller(formData: FormData, includes: string[], modules: any[] = []) {
  const session = await auth();

  // 1. Seguridad: Solo ADMIN o MENTOR
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    throw new Error("No autorizado");
  }

  // 2. Extraer datos del FormData
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const date = new Date(formData.get("date") as string);
  const location = formData.get("location") as string;
  const slots = parseInt(formData.get("slots") as string);
  const category = formData.get("category") as string;
  const time = formData.get("time") as string;
  const image = formData.get("image") as string | null;
  const duration = formData.get("duration") as string | null;
  const language = (formData.get("language") as string) || "Español";
  const level = formData.get("level") as string | null;

  // Lógica de asignación de instructor
  let instructorId = session.user.id as string;
  
  if (session.user.role === "ADMIN") {
    const selectedInstructor = formData.get("instructorId") as string;
    if (selectedInstructor) instructorId = selectedInstructor;
  }

  // 3. Guardar en Prisma
  try {
    const newTaller = await prisma.taller.create({
      data: {
        title,
        description,
        category,
        price,
        date,
        time,
        location,
        slots,
        instructorId,
        includes: includes.join(","), 
        image: image || null,
        duration: duration || null,
        language,
        level: level || null,
        modules: {
          create: modules.map((m, mIndex) => ({
            title: m.title,
            order: mIndex,
            topics: {
              create: m.topics.map((t, tIndex) => ({
                title: t.title,
                summary: t.summary || null,
                order: tIndex,
              }))
            }
          }))
        }
      },
    });

    await logActivity({
      userId: session.user.id as string,
      action: "CREATE",
      entityType: "TALLER",
      entityId: newTaller.id,
      details: { title: newTaller.title },
    });
  } catch (error: any) {
    console.error("Error creando taller:", error);
    return { error: error.message || "No se pudo crear el taller" };
  }

  revalidatePath("/talleres");
  revalidatePath("/dashboard/talleres");
  redirect("/dashboard/talleres");
}

// 5. Editar Taller
export async function editarTaller(id: string, formData: FormData, includes: string[], modules: any[] = []) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const workshop = await prisma.taller.findUnique({
    where: { id },
    include: { _count: { select: { inscritos: true } } },
  });

  if (!workshop) throw new Error("Taller no encontrado");

  if (session.user.role !== "ADMIN" && workshop.instructorId !== session.user.id) {
    throw new Error("No tienes permiso para editar este taller");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const date = new Date(formData.get("date") as string);
  const location = formData.get("location") as string;
  const slots = parseInt(formData.get("slots") as string);
  const category = formData.get("category") as string;
  const time = formData.get("time") as string;
  const image = formData.get("image") as string | null;
  const duration = formData.get("duration") as string | null;
  const language = (formData.get("language") as string) || "Español";
  const level = formData.get("level") as string | null;

  try {
    await prisma.$transaction([
      prisma.tallerModule.deleteMany({ where: { tallerId: id } }),
      prisma.taller.update({
        where: { id },
        data: {
          title,
          description,
          category,
          price,
          date,
          time,
          location,
          slots,
          includes: includes.join(","),
          image: image || null,
          duration: duration || null,
          language,
          level: level || null,
          modules: {
            create: modules.map((m, mIndex) => ({
              title: m.title,
              order: mIndex,
              topics: {
                create: m.topics.map((t, tIndex) => ({
                  title: t.title,
                  summary: t.summary || null,
                  order: tIndex,
                }))
              }
            }))
          }
        },
      })
    ]);

    await logActivity({
      userId: session.user.id as string,
      action: "UPDATE",
      entityType: "TALLER",
      entityId: id,
      details: { title },
    });
  } catch (error) {
    console.error("Error editando taller:", error);
    return { error: "No se pudo actualizar el taller" };
  }

  revalidatePath("/talleres");
  revalidatePath(`/talleres/${id}`);
  revalidatePath("/dashboard/talleres");
}

// 6. Eliminar Taller
export async function eliminarTaller(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const workshop = await prisma.taller.findUnique({
    where: { id },
    include: { _count: { select: { inscritos: true } } },
  });

  if (!workshop) throw new Error("Taller no encontrado");

  // Seguridad: ADMIN puede todo, MENTOR solo lo suyo
  if (session.user.role !== "ADMIN" && workshop.instructorId !== session.user.id) {
    throw new Error("No tienes permiso para eliminar este taller");
  }

  // Regla de Negocio: Bloqueo si hay 5 o más inscritos (Admin puede saltar esto)
  if (session.user.role !== "ADMIN" && workshop._count.inscritos >= 5) {
    throw new Error("No puedes eliminar un taller con 5 o más alumnos inscritos. Contacta a soporte para proceder con reembolsos.");
  }

  try {
    await prisma.taller.delete({
      where: { id },
    });

    await logActivity({
      userId: session.user.id as string,
      action: "DELETE",
      entityType: "TALLER",
      entityId: id,
      details: { title: workshop.title },
    });
  } catch (error) {
    console.error("Error eliminando taller:", error);
    return { error: "No se pudo eliminar el taller" };
  }

  revalidatePath("/talleres");
  revalidatePath("/dashboard/talleres");
}