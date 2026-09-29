import { describe, expect, it } from "vitest";
import {
  bagIdLookupOr,
  courseMatchesBagId,
} from "@/lib/utils/bagCourseLookup";

describe("bagIdLookupOr", () => {
  it("ignora ids vacíos", () => {
    expect(bagIdLookupOr(["", "  "])).toEqual([]);
  });

  it("genera cláusulas por id, slug y content", () => {
    const clauses = bagIdLookupOr(["cake-de-pina"]);
    expect(clauses).toEqual(
      expect.arrayContaining([
        { id: "cake-de-pina" },
        { slug: "cake-de-pina" },
        { content: { contains: "cake-de-pina" } },
      ]),
    );
    expect(clauses).toHaveLength(3);
  });

  it("expande el prefijo legacy workshop-", () => {
    const clauses = bagIdLookupOr(["workshop-tortas-basicas"]);
    expect(clauses).toEqual(
      expect.arrayContaining([
        { id: "workshop-tortas-basicas" },
        { slug: "workshop-tortas-basicas" },
        { slug: "tortas-basicas" },
        { content: { contains: "tortas-basicas" } },
      ]),
    );
    expect(clauses.length).toBeGreaterThanOrEqual(5);
  });
});

describe("courseMatchesBagId", () => {
  const course = {
    id: "cuid_abc",
    slug: "tortas-basicas",
    content: JSON.stringify({ slug: "tortas-basicas", isWorkshop: true }),
    title: "Tortas Básicas",
  };

  it("hace match por id de BD", () => {
    expect(courseMatchesBagId(course, "cuid_abc")).toBe(true);
  });

  it("hace match por slug canónico", () => {
    expect(courseMatchesBagId(course, "tortas-basicas")).toBe(true);
  });

  it("hace match por bagId legacy workshop-", () => {
    expect(courseMatchesBagId(course, "workshop-tortas-basicas")).toBe(true);
  });

  it("rechaza bagIds vacíos o ajenos", () => {
    expect(courseMatchesBagId(course, "")).toBe(false);
    expect(courseMatchesBagId(course, "merengue-italiano")).toBe(false);
  });
});
