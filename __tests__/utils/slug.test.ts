import { describe, expect, it, vi } from "vitest";
import { slugify, uniqueSlug } from "@/lib/utils/slug";

describe("slugify", () => {
  it("normaliza acentos, mayúsculas y símbolos", () => {
    expect(slugify("Repostería & Pastelería Desde Cero")).toBe(
      "reposteria-pasteleria-desde-cero",
    );
  });

  it("recorta guiones extremos y colapsa separadores", () => {
    expect(slugify("  ---Cake   de   Piña!!!  ")).toBe("cake-de-pina");
  });

  it("soporta nullish como cadena vacía", () => {
    expect(slugify(null as unknown as string)).toBe("");
    expect(slugify(undefined as unknown as string)).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("devuelve la base si está libre", async () => {
    const isTaken = vi.fn().mockResolvedValue(false);
    await expect(uniqueSlug("Merengue Italiano", isTaken)).resolves.toBe(
      "merengue-italiano",
    );
    expect(isTaken).toHaveBeenCalledWith("merengue-italiano");
  });

  it("añade sufijos -2, -3… mientras esté ocupado", async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(uniqueSlug("Tortas Básicas", isTaken)).resolves.toBe(
      "tortas-basicas-3",
    );
  });

  it("usa 'curso' como raíz si el título no produce slug", async () => {
    const isTaken = vi.fn().mockResolvedValue(false);
    await expect(uniqueSlug("!!!", isTaken)).resolves.toBe("curso");
  });
});
