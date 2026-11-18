import { describe, expect, it } from "vitest";
import { adminPaymentText, paymentSubmittedText, workshopNewDateWhatsAppText } from "@/lib/whatsapp-notifications";

describe("payment WhatsApp recipients", () => {
  it("uses distinct customer and administrator messages", () => {
    const customer = paymentSubmittedText(["Tortas Básicas"]);
    const admin = adminPaymentText("submitted", ["Tortas Básicas"], "María", 45);

    expect(customer).toContain("Comprobante recibido");
    expect(customer).not.toContain("Nuevo comprobante pendiente de revisión");
    expect(customer).not.toContain("dashboard/pagos");
    expect(admin).toContain("Nuevo comprobante pendiente de revisión");
    expect(admin).toContain("dashboard/pagos");
  });
});

describe("workshopNewDateWhatsAppText", () => {
  it("includes date, link and opt-out note", () => {
    const text = workshopNewDateWhatsAppText({
      title: "Tortas Básicas",
      dateLabel: "Sábado, 15 de noviembre de 2026",
      time: "09:00 AM — 05:00 PM",
      location: "Coro, Falcón",
      slug: "tortas-basicas",
      price: 45,
    });

    expect(text).toContain("Tortas Básicas");
    expect(text).toContain("Sábado, 15 de noviembre de 2026");
    expect(text).toContain("09:00 AM — 05:00 PM");
    expect(text).toContain("Coro, Falcón");
    expect(text).toContain("$45.00 USD");
    expect(text).toContain("https://anaspastryshop.com/workshop/tortas-basicas");
    expect(text).toContain("desactiva WhatsApp en tu perfil");
  });
});
