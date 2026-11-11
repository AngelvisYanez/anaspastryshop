"use server";

import { prisma } from "@/lib/prisma";
import { sendWorkshopNewDateEmail } from "@/lib/email";
import { formatWorkshopDateLabel } from "@/lib/utils/workshop";
import {
  normalizeWhatsAppNumber,
  wakeWhatsAppBridge,
  workshopNewDateWhatsAppText,
} from "@/lib/whatsapp-notifications";

export type WorkshopNotifyPayload = {
  courseId: string;
  title: string;
  slug: string;
  dateIso: string;
  time?: string;
  location?: string;
  price?: number;
};

export type WorkshopNotifyResult = {
  emailsSent: number;
  emailsFailed: number;
  whatsappQueued: number;
};

/** Avisa a clientes registrados: email a usuarios activos y WhatsApp a quienes optaron por marketing. */
export async function notifyWorkshopNewDate(
  payload: WorkshopNotifyPayload,
): Promise<WorkshopNotifyResult> {
  const dateLabel = formatWorkshopDateLabel(payload.dateIso);
  const campaignId = crypto.randomUUID();
  const [emailUsers, whatsappUsers] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER", isActive: true },
      select: { id: true, email: true, name: true },
    }),
    prisma.user.findMany({
      where: {
        role: "USER",
        isActive: true,
        whatsappMarketing: true,
        whatsappNumber: { not: null },
        inscripciones: { some: { status: "APPROVED" } },
      },
      select: { id: true, whatsappNumber: true },
    }),
  ]);

  const waRows = whatsappUsers.flatMap((user) => {
    const phone = normalizeWhatsAppNumber(user.whatsappNumber || "");
    if (!phone) return [];
    return [{
      eventKey: `workshop-date:${payload.courseId}:${payload.dateIso}:${campaignId}:${user.id}`,
      userId: user.id,
      phone,
      text: workshopNewDateWhatsAppText({
        title: payload.title,
        dateLabel,
        time: payload.time,
        location: payload.location,
        slug: payload.slug,
        price: payload.price,
      }),
      kind: "MARKETING",
    }];
  });

  const whatsappQueued = waRows.length
    ? (
        await prisma.whatsAppNotification.createMany({
          data: waRows,
          skipDuplicates: true,
        })
      ).count
    : 0;
  if (whatsappQueued) await wakeWhatsAppBridge();

  let emailsSent = 0;
  let emailsFailed = 0;
  for (const user of emailUsers) {
    try {
      // react-doctor-disable-next-line react-doctor/async-await-in-loop -- sequential Resend sends avoid provider rate limits
      await sendWorkshopNewDateEmail(user.email, user.name, {
        title: payload.title,
        dateLabel,
        time: payload.time,
        location: payload.location,
        slug: payload.slug,
        price: payload.price,
      });
      emailsSent++;
    } catch {
      emailsFailed++;
    }
  }

  return { emailsSent, emailsFailed, whatsappQueued };
}
