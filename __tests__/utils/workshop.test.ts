import { describe, expect, it } from "vitest";
import {
  formatWorkshopDateLabel,
  parseWorkshopDetails,
  parseWorkshopLocalDate,
  serializeWorkshopDetails,
  workshopDateToIso,
  WORKSHOP_LOCATION,
} from "@/lib/utils/workshop";

describe("parseWorkshopDetails", () => {
  it("marca workshop por isLive y aplica sede canónica", () => {
    const result = parseWorkshopDetails(null, true);
    expect(result.isWorkshop).toBe(true);
    expect(result.location).toBe(WORKSHOP_LOCATION);
    expect(result.workshopTime).toContain("09:00");
  });

  it("detecta workshop por título aunque isLive sea false", () => {
    const result = parseWorkshopDetails(null, false, "Taller de Fondant");
    expect(result.isWorkshop).toBe(true);
  });

  it("parsea JSON y migra ubicaciones legacy de Caracas", () => {
    const content = JSON.stringify({
      isWorkshop: true,
      slug: "tortas-basicas",
      spots: 12,
      location: "Caracas, Las Mercedes",
      workshopDate: "2026-10-04",
      workshopTime: "2:00 PM",
      notes: "Traer delantal",
    });
    const result = parseWorkshopDetails(content, false);
    expect(result).toMatchObject({
      isWorkshop: true,
      slug: "tortas-basicas",
      spots: 12,
      location: WORKSHOP_LOCATION,
      workshopDate: "2026-10-04",
      workshopTime: "2:00 PM",
      notes: "Traer delantal",
    });
  });

  it("trata contenido de texto plano como ubicación", () => {
    const result = parseWorkshopDetails("Sede Coro personalizada", true);
    expect(result.isWorkshop).toBe(true);
    expect(result.location).toBe("Sede Coro personalizada");
  });

  it("no fuerza workshop en cursos online sin señales", () => {
    const result = parseWorkshopDetails(null, false, "Cake de Piña");
    expect(result.isWorkshop).toBe(false);
    expect(result.location).toBeUndefined();
  });
});

describe("serializeWorkshopDetails", () => {
  it("serializa con defaults de sede y horario", () => {
    const json = serializeWorkshopDetails({
      isWorkshop: true,
      slug: "ganache",
      spots: 10,
    });
    expect(JSON.parse(json)).toMatchObject({
      isWorkshop: true,
      slug: "ganache",
      spots: 10,
      location: WORKSHOP_LOCATION,
      workshopTime: "09:00 AM — 05:00 PM",
      workshopDate: "",
      notes: "",
    });
  });

  it("round-trip parse ↔ serialize conserva campos clave", () => {
    const original = {
      isWorkshop: true,
      slug: "candy-bar",
      spots: 8,
      location: WORKSHOP_LOCATION,
      workshopDate: "2026-10-18",
      workshopTime: "09:00 AM — 05:00 PM",
      notes: "Incluye kit",
    };
    const parsed = parseWorkshopDetails(serializeWorkshopDetails(original), true);
    expect(parsed).toMatchObject(original);
  });
});

describe("workshopDateToIso", () => {
  it("pasa fechas ISO intactas", () => {
    expect(workshopDateToIso("2026-10-04")).toBe("2026-10-04");
  });

  it("convierte etiquetas en español", () => {
    expect(workshopDateToIso("4 de octubre de 2026")).toBe("2026-10-04");
    expect(workshopDateToIso("11 de setiembre, 2026")).toBe("2026-09-11");
  });

  it("devuelve vacío ante valores inválidos", () => {
    expect(workshopDateToIso("")).toBe("");
    expect(workshopDateToIso("próximo sábado")).toBe("");
    expect(workshopDateToIso("99 de octubre de 2026")).toBe("");
  });
});

describe("parseWorkshopLocalDate / formatWorkshopDateLabel", () => {
  it("parsea sin desfase UTC", () => {
    const date = parseWorkshopLocalDate("2026-10-04");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(4);
  });

  it("formatea etiqueta legible en español", () => {
    const label = formatWorkshopDateLabel("2026-10-04");
    expect(label.toLowerCase()).toContain("octubre");
    expect(label).toMatch(/2026/);
    expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase());
  });

  it("devuelve el valor original si no es ISO", () => {
    expect(formatWorkshopDateLabel("Sábado próximo")).toBe("Sábado próximo");
  });
});
