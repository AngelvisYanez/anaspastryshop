import { describe, expect, it } from "vitest";
import { validateManualPayment } from "@/components/checkout/validateManualPayment";
import {
  labelsForEnabledProviders,
  MANUAL_PROVIDER_KEYS,
  PROVIDER_ORDER,
} from "@/components/checkout/manualProviders";

describe("validateManualPayment", () => {
  const base = {
    reference: "REF-123",
    selectedMethod: "ZELLE",
    phoneNumber: "",
    receiptImage: "data:image/png;base64,abc",
  };

  it("acepta un pago manual completo", () => {
    expect(validateManualPayment(base)).toBeNull();
  });

  it("exige referencia", () => {
    expect(validateManualPayment({ ...base, reference: "  " })).toMatch(
      /referencia/i,
    );
  });

  it("exige teléfono en Pago Móvil", () => {
    expect(
      validateManualPayment({
        ...base,
        selectedMethod: "PAGO_MOVIL",
        phoneNumber: "",
      }),
    ).toMatch(/teléfono|telefono/i);
  });

  it("exige comprobante", () => {
    expect(validateManualPayment({ ...base, receiptImage: null })).toMatch(
      /comprobante/i,
    );
  });
});

describe("manualProviders", () => {
  it("expone las claves de métodos manuales en orden", () => {
    expect([...MANUAL_PROVIDER_KEYS]).toEqual(
      expect.arrayContaining([...PROVIDER_ORDER]),
    );
    expect(PROVIDER_ORDER).toEqual([
      "PAGO_MOVIL",
      "ZELLE",
      "BINANCE",
      "BANK_TRANSFER",
    ]);
  });

  it("labelsForEnabledProviders respeta orden y filtra deshabilitados", () => {
    expect(
      labelsForEnabledProviders(["STRIPE", "ZELLE", "PAGO_MOVIL"]),
    ).toEqual(["Pago Móvil BCV", "Zelle QR", "Tarjeta (Stripe)"]);
  });
});
