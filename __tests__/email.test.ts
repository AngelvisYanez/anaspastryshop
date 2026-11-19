import { describe, expect, it, vi } from "vitest";

const { findAdmins, sendEmail } = vi.hoisted(() => ({
  findAdmins: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailTemplate: { findUnique: vi.fn().mockResolvedValue(null) },
    user: { findMany: findAdmins },
  },
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));

import { getEmailTemplatePreview, sendAdminNewUserEmail } from "@/lib/email";

describe("email templates", () => {
  it("sends new registration notices to both of Anais's addresses", async () => {
    findAdmins.mockResolvedValueOnce([{ email: "admin@anaspastryshop.com" }]);

    await sendAdminNewUserEmail("María", "maria@example.com", "USER", null);

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: ["admin@anaspastryshop.com", "anaspastryshopvzla2026@gmail.com"],
    }));
  });

  it("shows the complete registration details safely in the admin email", async () => {
    const result = await sendAdminNewUserEmail(
      "María del Carmen Pérez",
      "maria@example.com",
      "USER",
      "+584121234567",
      { dryRun: true },
    );
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.html).toContain("María del Carmen Pérez");
    expect(result.html).toContain("maria@example.com");
    expect(result.html).toContain("+584121234567");
    expect(result.html).toContain("Nombre y apellido");
    expect(result.html).toContain('width="110" height="68"');
    expect(result.html).toContain("/logo-anas-pastry-shop-white.png");
  });

  it("renders all dashboard email previews", async () => {
    for (const type of ["WELCOME", "ACCOUNT_APPROVED", "PAYMENT_REJECTED", "COURSE_PURCHASE", "ADMIN_NEW_USER", "WORKSHOP_NEW_DATE"]) {
      const preview = await getEmailTemplatePreview(type);
      expect(preview?.html).toContain("Ana's Pastry Shop");
      expect(preview?.html).toContain("/logo-anas-pastry-shop-white.png");
    }
  });

  it("renders workshop new date details in the preview", async () => {
    const preview = await getEmailTemplatePreview("WORKSHOP_NEW_DATE");
    expect(preview?.html).toContain("Tortas Básicas");
    expect(preview?.html).toContain("15 de noviembre de 2026");
    expect(preview?.html).toContain("/workshop/tortas-basicas");
  });
});
