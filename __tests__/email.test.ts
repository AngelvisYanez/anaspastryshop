import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { emailTemplate: { findUnique: vi.fn().mockResolvedValue(null) } },
}));

import { getEmailTemplatePreview, sendAdminNewUserEmail } from "@/lib/email";

describe("email templates", () => {
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
    for (const type of ["WELCOME", "ACCOUNT_APPROVED", "PAYMENT_REJECTED", "COURSE_PURCHASE", "ADMIN_NEW_USER"]) {
      const preview = await getEmailTemplatePreview(type);
      expect(preview?.html).toContain("Ana's Pastry Shop");
      expect(preview?.html).toContain("/logo-anas-pastry-shop-white.png");
    }
  });
});
