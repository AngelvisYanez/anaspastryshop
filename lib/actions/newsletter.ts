"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public newsletter signup by design; only writes its own opt-in row and is rate limited
export async function subscribeToNewsletter(email: string, name?: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email inválido." };
  }

  const normalized = email.trim().toLowerCase();

  const throttle = rateLimit(`newsletter:${normalized}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo más tarde." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: { isActive: true, name: name ?? undefined },
      create: { email: normalized, name: name ?? null },
    });

    return { success: true };
  } catch {
    return { error: "No se pudo procesar la suscripción." };
  }
}

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public unsubscribe by design; the unguessable token is emailed to the subscriber and the action is rate limited
export async function unsubscribeByToken(token: string) {
  if (!token || !/^[a-z0-9]{20,32}$/i.test(token)) {
    return { error: "Token inválido." };
  }

  const throttle = rateLimit(`newsletter-unsubscribe:${token}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo más tarde." };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) return { error: "Suscriptor no encontrado." };

    await prisma.newsletterSubscriber.update({
      where: { token },
      data: { isActive: false },
    });

    return { success: true };
  } catch {
    return { error: "No se pudo procesar la solicitud." };
  }
}

export async function getNewsletterSubscribers() {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  return { subscribers };
}

export async function sendNewsletter(
  subject: string,
  title: string,
  preheaderText: string,
  htmlContent: string
) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  if (!subject.trim() || !title.trim() || !htmlContent.trim()) {
    return { error: "Asunto, título y contenido son obligatorios." };
  }

  const activeSubscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
  });

  if (activeSubscribers.length === 0) {
    return { error: "No hay suscriptores activos." };
  }

  let sent = 0;
  let failed = 0;

  for (const subscriber of activeSubscribers) {
    try {
      // react-doctor-disable-next-line react-doctor/async-await-in-loop -- deliberate sequential send: parallelising a bulk campaign gets the email provider to rate limit or reject
      await sendNewsletterEmail(
        subscriber.email,
        subscriber.name,
        subject,
        title,
        preheaderText,
        htmlContent,
        subscriber.token
      );
      sent++;
    } catch {
      failed++;
    }
  }

  revalidatePath("/dashboard/newsletter");
  return { success: true, sent, failed, total: activeSubscribers.length };
}

export async function deleteNewsletterSubscriber(id: string) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/dashboard/newsletter");
  return { success: true };
}
