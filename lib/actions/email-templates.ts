"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_TEMPLATES,
  type EmailTemplateData,
} from "@/lib/email-template-defaults";
import {
  sendWelcomeEmail,
  sendAccountApprovedEmail,
  sendPaymentRejectedEmail,
  sendCoursePurchaseEmail,
  sendAdminNewUserEmail,
  getEmailTemplatePreview,
} from "@/lib/email";

const TEST_EMAIL = "angelviselyanez@gmail.com";
const TEST_NAME = "Angelvis Yanez";

async function assertAdmin() {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function getEmailTemplates(): Promise<EmailTemplateData[]> {
  await assertAdmin();

  let stored: {
    type: string;
    id: string;
    subject: string;
    title: string;
    preheader: string;
    isEnabled: boolean;
  }[] = [];
  try {
    stored = await (prisma as any).emailTemplate.findMany();
  } catch {
    stored = [];
  }
  const storedMap = new Map(stored.map((t) => [t.type, t]));

  return DEFAULT_TEMPLATES.map((def) => {
    const db = storedMap.get(def.type);
    return {
      id: db?.id ?? "",
      type: def.type,
      label: def.label,
      recipient: def.recipient,
      subject: db?.subject || def.subject,
      title: db?.title || def.title,
      preheader: db?.preheader || def.preheader,
      isEnabled: db?.isEnabled ?? true,
    };
  });
}

export async function updateEmailTemplate(
  type: string,
  data: {
    subject?: string;
    title?: string;
    preheader?: string;
    isEnabled?: boolean;
  },
) {
  await assertAdmin();

  const def = DEFAULT_TEMPLATES.find((t) => t.type === type);
  if (!def) return { error: "Tipo de email no válido." };

  try {
    await (prisma as any).emailTemplate.upsert({
      where: { type },
      update: {
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.preheader !== undefined && { preheader: data.preheader }),
        ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
      },
      create: {
        type,
        label: def.label,
        recipient: def.recipient,
        subject: data.subject ?? def.subject,
        title: data.title ?? def.title,
        preheader: data.preheader ?? def.preheader,
        isEnabled: data.isEnabled ?? true,
      },
    });
  } catch {
    return {
      error:
        "El cliente de base de datos no está actualizado. Reinicia el servidor.",
    };
  }

  revalidatePath("/dashboard/emails");
  return { success: true };
}

export async function sendTestEmail(
  type: string,
): Promise<{ success?: boolean; error?: string }> {
  await assertAdmin();

  try {
    switch (type) {
      case "WELCOME":
        await sendWelcomeEmail(TEST_EMAIL, TEST_NAME);
        break;
      case "ACCOUNT_APPROVED":
        await sendAccountApprovedEmail(TEST_EMAIL, TEST_NAME);
        break;
      case "PAYMENT_REJECTED":
        await sendPaymentRejectedEmail(
          TEST_EMAIL,
          TEST_NAME,
          "El comprobante de pago no coincide con el monto indicado.",
        );
        break;
      case "COURSE_PURCHASE":
        await sendCoursePurchaseEmail(
          TEST_EMAIL,
          TEST_NAME,
          "Fundamentos Digitales",
        );
        break;
      case "ADMIN_NEW_USER":
        await sendAdminNewUserEmail(
          "Usuario Prueba",
          "prueba@ejemplo.com",
          "USER",
        );
        break;
      default:
        return { error: "Tipo de email no válido." };
    }
    return { success: true };
  } catch (err) {
    console.error("[sendTestEmail]", err);
    return { error: "No se pudo enviar el email de prueba." };
  }
}

export async function previewEmailTemplate(
  type: string,
): Promise<{ subject: string; html: string } | { error: string }> {
  await assertAdmin();

  try {
    const preview = await getEmailTemplatePreview(type);
    if (!preview) {
      return { error: "No se pudo generar la previsualización." };
    }
    return preview;
  } catch (err) {
    console.error("[previewEmailTemplate]", err);
    return { error: "No se pudo generar la previsualización." };
  }
}
