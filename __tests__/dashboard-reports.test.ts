import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import { GET as overviewReport } from "@/app/api/dashboard/overview-report/route";
import { GET as dailyClose } from "@/app/api/cron/daily-close/route";
import { auth } from "@/lib/auth";
import { getOverview } from "@/app/dashboard/admin-overview/get-overview";
import { sendDailyCloseEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findMany: vi.fn() } } }));
vi.mock("@/lib/email", () => ({ sendDailyCloseEmail: vi.fn() }));
vi.mock("@/app/dashboard/admin-overview/get-overview", () => ({ getOverview: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOverview).mockResolvedValue({
    revenue: 45, registrations: 1, average: 45, approvalRate: 1,
    statuses: { APPROVED: 1, PENDING: 0, REJECTED: 0 },
    methods: [{ name: "Zelle", value: 45 }], timeline: [], topCourses: [],
    activity: [{ id: "r1", at: new Date("2026-11-19T18:00:00Z"), name: "Ana",
      email: "ana@example.test", title: "Curso de prueba", method: "ZELLE", status: "APPROVED", amount: 45 }],
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("PDF de rendimiento", () => {
  it("requiere una sesión de administración", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await overviewReport(new Request("https://example.test/api/dashboard/overview-report"))).status).toBe(403);
    expect(getOverview).not.toHaveBeenCalled();
  });

  it("descarga un PDF con el método y las fechas activos y todos los pagos del filtro", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: "ADMIN" } } as never);
    const response = await overviewReport(new Request(
      "https://example.test/api/dashboard/overview-report?from=2026-11-18&to=2026-11-19&method=ZELLE",
    ));
    expect(getOverview).toHaveBeenCalledWith(expect.objectContaining({
      method: "ZELLE", range: { from: "2026-11-18", to: "2026-11-19" },
    }), "all");
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("rendimiento-del-negocio-2026-11-18-2026-11-19.pdf");
    expect((await PDFDocument.load(await response.arrayBuffer())).getTitle()).toBe("Rendimiento del negocio");
  });
});

describe("cierre diario", () => {
  it("no consulta datos ni envía correo si el secreto no coincide", async () => {
    vi.stubEnv("CRON_SECRET", "daily-test-secret");
    expect((await dailyClose(new Request("https://example.test/api/cron/daily-close"))).status).toBe(401);
    expect(getOverview).not.toHaveBeenCalled();
    expect(sendDailyCloseEmail).not.toHaveBeenCalled();
  });

  it("envía el cierre del día completo de Caracas y la lista de alumnos nuevos", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-20T04:00:00Z") });
    vi.stubEnv("CRON_SECRET", "daily-test-secret");
    const students = [{ name: "Ana", email: "ana@example.test" }];
    vi.mocked(prisma.user.findMany).mockResolvedValue(students as never);
    const response = await dailyClose(new Request("https://example.test/api/cron/daily-close", {
      headers: { authorization: "Bearer daily-test-secret" },
    }));
    expect(await response.json()).toEqual({ ok: true, day: "2026-11-19" });
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { role: "USER", createdAt: {
        gte: new Date("2026-11-19T04:00:00Z"), lte: new Date("2026-11-20T03:59:59.999Z"),
      } },
    }));
    expect(sendDailyCloseEmail).toHaveBeenCalledWith(expect.objectContaining({ day: "2026-11-19", students, revenue: 45 }));
  });
});
