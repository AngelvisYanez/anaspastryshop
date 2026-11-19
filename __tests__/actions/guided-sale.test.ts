import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { findGuidedSaleStudent, registerGuidedSale } from "@/lib/actions/guided-sale";

const tx = vi.hoisted(() => ({
  curso: { findFirst: vi.fn() },
  user: { findUnique: vi.fn(), create: vi.fn() },
  inscription: { findFirst: vi.fn(), create: vi.fn() },
  coursePurchase: { findUnique: vi.fn() },
  passwordResetToken: { create: vi.fn() },
  activityLog: { create: vi.fn() },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  user: tx.user,
  $transaction: (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
} }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

async function saleForm(fields: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    email: " ALUMNA@EXAMPLE.TEST ", name: "Ana", whatsapp: "+58 412 123 4567",
    courseId: "c1", method: "ZELLE", amount: "45,50", reference: "ABC123", verified: "true", ...fields,
  })) data.set(key, value);
  const png = await sharp({ create: { width: 16, height: 16, channels: 3, background: "#fff" } }).png().toBuffer();
  data.set("receipt", new File([Uint8Array.from(png)], "pago.png", { type: "image/png" }));
  return data;
}

describe("guided sale", () => {
  const student = { id: "u1", name: "Ana", role: "USER", isActive: true };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin", role: "ADMIN" } } as never);
    tx.curso.findFirst.mockResolvedValue({ id: "c1", title: "Repostería" });
    tx.user.findUnique.mockResolvedValue(null);
    tx.user.create.mockResolvedValue(student);
    tx.inscription.create.mockResolvedValue({ id: "i1" });
  });

  it("requires an administrator for lookup and authorization", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1", role: "USER" } } as never);
    await expect(findGuidedSaleStudent("alumna@example.test")).rejects.toThrow("No autorizado");
    await expect(registerGuidedSale(new FormData())).rejects.toThrow("No autorizado");
    expect(tx.user.findUnique).not.toHaveBeenCalled();
  });

  it("creates the student, approved enrollment, receipt and account setup link", async () => {
    const result = await registerGuidedSale(await saleForm());
    expect(result.sale).toEqual({ id: "i1", email: "alumna@example.test", student: "Ana", course: "Repostería" });
    expect(result.setupPath).toMatch(/^\/restablecer-contrasena\?token=[a-f0-9]{64}$/);
    expect(tx.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: "USER", isApproved: true, whatsappNumber: "+584121234567" }),
    }));
    expect(tx.inscription.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: "u1", cursoId: "c1", status: "APPROVED", amountPaid: 45.5,
        receiptImage: expect.stringMatching(/^data:image\/webp;base64,/),
      }),
    }));
    expect(tx.passwordResetToken.create).toHaveBeenCalledWith({
      data: { email: "alumna@example.test", token: expect.any(String), setupBinding: expect.stringMatching(/^[a-f0-9]{64}$/) },
    });
    expect(tx.activityLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: "admin", entityId: "i1" }),
    }));
  });

  it("uses an existing account without changing its details or generating a setup link", async () => {
    tx.user.findUnique.mockResolvedValue(student);
    const result = await registerGuidedSale(await saleForm({ studentId: "u1", name: "", whatsapp: "" }));
    expect(result.setupPath).toBeNull();
    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.passwordResetToken.create).not.toHaveBeenCalled();
    expect(tx.inscription.create).toHaveBeenCalledOnce();
  });

  it("blocks duplicate, pending and unauthorized payments before writing an enrollment", async () => {
    tx.user.findUnique.mockResolvedValue(student);
    const form = await saleForm({ studentId: "u1" });
    tx.coursePurchase.findUnique.mockResolvedValue({ status: "COMPLETED" });
    expect((await registerGuidedSale(form)).error).toMatch(/ya tiene acceso/);
    tx.coursePurchase.findUnique.mockResolvedValue(null);
    tx.inscription.findFirst.mockResolvedValue({ status: "PENDING" });
    expect((await registerGuidedSale(form)).error).toMatch(/pago pendiente/);
    form.set("verified", "");
    expect((await registerGuidedSale(form)).error).toMatch(/Confirma/);
    expect(tx.inscription.create).not.toHaveBeenCalled();
  });
});
