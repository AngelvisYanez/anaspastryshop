import { describe, expect, it } from "vitest";
import { formatBcvDate } from "@/lib/utils/formatBcvDate";

describe("formatBcvDate", () => {
  it("formatea YYYY-MM-DD sin drift de zona horaria", () => {
    const formatted = formatBcvDate("2026-03-15");
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/3|03|mar/i);
  });

  it("usa solo los 10 primeros caracteres de un ISO completo", () => {
    const formatted = formatBcvDate("2026-03-15T23:59:59.000Z");
    expect(formatted).toMatch(/15/);
  });

  it("devuelve el valor original si no hay fecha parseable", () => {
    expect(formatBcvDate("ayer")).toBe("ayer");
  });
});
