"use server";

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { accountSetupBinding } from "@/lib/account-setup";
import { guidedAmount, guidedPaymentMethods, guidedReceiptError, normalizeGuidedEmail, sellableFormations } from "@/lib/guided-sale";
import { prisma } from "@/lib/prisma";
import { withSerializableRetry } from "@/lib/serializable-transaction";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp-notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("No autorizado");
  return session.user.id;
}

function blockedAccount(user: { role: string; isActive: boolean }) {
  if (user.role !== "USER") return "El correo pertenece a una cuenta de administración. Usa el correo del alumno.";
  if (!user.isActive) return "La cuenta está suspendida. Revisa su estado en Usuarios.";
  return null;
}

export async function findGuidedSaleStudent(input: string) {
  await requireAdmin();
  const email = typeof input === "string" ? normalizeGuidedEmail(input) : null;
  if (!email) return { error: "Ingresa un correo electrónico válido." };
  const student = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, whatsappNumber: true, role: true, isActive: true },
  });
  if (!student) return { email, student: null };
  const error = blockedAccount(student);
  if (error) return { error };
  return { email, student: { id: student.id, name: student.name, whatsappNumber: student.whatsappNumber } };
}

export async function registerGuidedSale(formData: FormData) {
  const adminId = await requireAdmin();
  const field = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const email = normalizeGuidedEmail(field("email"));
  const studentId = field("studentId");
  const name = field("name");
  const whatsapp = normalizeWhatsAppNumber(field("whatsapp"));
  const courseId = field("courseId");
  const method = field("method");
  const amount = guidedAmount(field("amount"));
  const reference = field("reference");
  const file = formData.get("receipt");
  if (!email) return { error: "Ingresa un correo electrónico válido." };
  if (!studentId && (!name || name.length > 120 || !whatsapp)) return { error: "Para una cuenta nueva, ingresa el nombre y un WhatsApp con código de país." };
  if (!courseId) return { error: "Selecciona una formación." };
  if (!Object.hasOwn(guidedPaymentMethods, method)) return { error: "Selecciona un método de pago válido." };
  if (amount === null) return { error: "Ingresa un monto en USD mayor que cero, con hasta dos decimales." };
  if (!reference || reference.length > 120) return { error: "Ingresa una referencia de pago de hasta 120 caracteres." };
  if (field("verified") !== "true") return { error: "Confirma que verificaste el pago antes de autorizarlo." };
  const receiptError = guidedReceiptError(file instanceof File ? file : null);
  if (receiptError || !(file instanceof File)) return { error: receiptError ?? "Adjunta el comprobante." };

  let receiptImage: string;
  try {
    const sharp = (await import("sharp")).default;
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 32_000_000, failOn: "warning" });
    const { format } = await image.metadata();
    if (format !== "jpeg" && format !== "png" && format !== "webp") return { error: "El contenido del comprobante debe ser una imagen JPG, PNG o WebP." };
    const webp = await image.rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 94 }).toBuffer();
    receiptImage = `data:image/webp;base64,${webp.toString("base64")}`;
  } catch {
    return { error: "No se pudo leer el comprobante. Adjunta otra imagen." };
  }

  const token = studentId ? null : randomBytes(32).toString("hex");
  try {
    const password = token ? await bcrypt.hash(randomBytes(32).toString("hex"), 10) : null;
    const result = await withSerializableRetry(async (tx) => {
      const course = await tx.curso.findFirst({
        where: { id: courseId, ...sellableFormations() },
        select: { id: true, title: true },
      });
      if (!course) return { error: "La formación ya no está disponible para vender." };

      let student = await tx.user.findUnique({
        where: { email }, select: { id: true, name: true, role: true, isActive: true },
      });
      if (student) {
        const error = blockedAccount(student);
        if (error) return { error };
        if (student.id !== studentId) {
          return { error: "El alumno ya tiene una cuenta. Vuelve al primer paso y consulta el correo nuevamente." };
        }
        const [inscription, purchase] = await Promise.all([
          tx.inscription.findFirst({
            where: { userId: student.id, cursoId: course.id, status: { in: ["APPROVED", "PENDING"] } },
            orderBy: { status: "asc" },
            select: { status: true },
          }),
          tx.coursePurchase.findUnique({
            where: { userId_cursoId: { userId: student.id, cursoId: course.id } },
            select: { status: true },
          }),
        ]);
        if (inscription?.status === "APPROVED" || purchase?.status === "COMPLETED") {
          return { error: "El alumno ya tiene acceso a esta formación." };
        }
        if (inscription?.status === "PENDING") {
          return { error: "Ya hay un pago pendiente para esta formación. Revísalo en Pagos." };
        }
      } else {
        if (studentId || !token || !password) return { error: "La cuenta cambió. Vuelve al primer paso y consulta el correo nuevamente." };
        student = await tx.user.create({
          data: { name, email, password, role: "USER", isApproved: true, whatsappNumber: `+${whatsapp}` },
          select: { id: true, name: true, role: true, isActive: true },
        });
        await tx.passwordResetToken.create({
          data: { email, token, setupBinding: accountSetupBinding(student.id, password) },
        });
      }

      const inscription = await tx.inscription.create({
        data: {
          userId: student.id, cursoId: course.id, status: "APPROVED", method,
          reference, amountPaid: amount, receiptImage,
        },
        select: { id: true },
      });
      await tx.activityLog.create({
        data: {
          userId: adminId, action: "APPROVE_COURSE_PAYMENT", entityType: "INSCRIPTION", entityId: inscription.id,
          details: JSON.stringify({ source: "Venta guiada", cursoId: course.id, targetId: student.id, method, amount, status: "APPROVED" }),
        },
      });
      return { sale: { id: inscription.id, email, student: student.name, course: course.title } };
    });

    if (!result.sale) return { error: result.error };
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/logs");
    revalidatePath("/dashboard/mis-cursos");
    revalidatePath(`/cursos/${courseId}`);
    return { sale: result.sale, setupPath: token ? `/restablecer-contrasena?token=${encodeURIComponent(token)}` : null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "La cuenta cambió mientras registrabas la venta. Consulta el correo nuevamente." };
    }
    console.error("Error registrando venta guiada:", error instanceof Error ? error.name : "Error");
    return { error: "No se pudo registrar la venta. Inténtalo de nuevo." };
  }
}
