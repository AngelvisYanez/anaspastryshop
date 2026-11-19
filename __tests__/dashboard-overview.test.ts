import { describe, expect, it } from "vitest";
import { parseOverviewFilter, summarizeOverview } from "@/app/dashboard/admin-overview/overview";
import { defaultWidgets, readWidgets } from "@/app/dashboard/admin-overview/widgets";

describe("admin overview", () => {
  it("uses approved amounts, resolved payments for the rate and calendar gaps", () => {
    const filter = parseOverviewFilter({ from: "2026-11-13", to: "2026-11-15" });
    const stats = summarizeOverview([
      { day: "2026-11-13", method: "STRIPE", status: "APPROVED", count: 2, amount: 75 },
      { day: "2026-11-13", method: "ZELLE", status: "PENDING", count: 1, amount: 90 },
      { day: "2026-11-15", method: "ZELLE", status: "REJECTED", count: 2, amount: 100 },
    ], [{ day: "2026-11-15", count: 3 }], filter);
    expect(stats).toMatchObject({
      revenue: 75, average: 37.5, approvalRate: 0.5, registrations: 3,
      statuses: { APPROVED: 2, PENDING: 1, REJECTED: 2 },
      methods: [{ name: "Stripe", value: 75 }],
      timeline: [
        { day: "2026-11-13", revenue: 75, students: 0, approvals: 2 },
        { day: "2026-11-14", revenue: 0, students: 0, approvals: 0 },
        { day: "2026-11-15", revenue: 0, students: 3, approvals: 0 },
      ],
    });
    expect(summarizeOverview([], [], filter)).toMatchObject({ average: null, approvalRate: null });
  });

  it("validates query parameters and adapts grouping to the period", () => {
    expect(parseOverviewFilter({ period: "all", method: "toString" })).toMatchObject({
      period: "all", method: "", bucket: "month", range: { from: "", to: "" },
    });
    expect(parseOverviewFilter({ from: "2026-01-01", to: "2026-03-01", method: "ZELLE" })).toMatchObject({
      period: "custom", method: "ZELLE", bucket: "week",
    });
  });

  it("preserves widget order and validates preferences read from browser storage", () => {
    expect(readWidgets(JSON.stringify([
      { id: "studentsTrend", wide: true, chart: "bar" },
      { id: "unknown" }, { id: "studentsTrend" },
      { id: "methods", wide: "yes", chart: "line" },
    ]))).toEqual([
      { id: "studentsTrend", wide: true, chart: "bar" },
      { id: "methods", wide: false, chart: "donut" },
    ]);
    expect(readWidgets("[]")).toEqual([]);
    expect(readWidgets("broken")).toEqual(defaultWidgets);
  });
});
