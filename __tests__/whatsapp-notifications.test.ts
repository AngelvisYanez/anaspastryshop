import { describe, expect, it } from "vitest";
import { workshopNewDateWhatsAppText } from "@/lib/whatsapp-notifications";

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
