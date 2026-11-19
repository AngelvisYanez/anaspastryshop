import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendDailyCloseEmail } from "@/lib/email";
import { getOverview } from "@/app/dashboard/admin-overview/get-overview";
import { parseOverviewFilter } from "@/app/dashboard/admin-overview/overview";
import { calendarDay, dateBounds } from "@/app/dashboard/data-view/filters";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "Cron sin configurar" }, { status: 503 });

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // At midnight in Caracas, the previous local day is complete.
  const day = calendarDay(new Date(Date.now() - 86_400_000));
  const filter = parseOverviewFilter({ from: day, to: day });
  try {
    const [stats, students] = await Promise.all([
      getOverview(filter, "none"),
      prisma.user.findMany({
        where: { role: "USER", createdAt: dateBounds(filter.range) },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { name: true, email: true },
      }),
    ]);
    await sendDailyCloseEmail({ day, students, revenue: stats.revenue, methods: stats.methods, statuses: stats.statuses });
    return Response.json({ ok: true, day });
  } catch {
    console.error("No se pudo generar o enviar el cierre diario.", { day });
    return Response.json({ error: "No se pudo enviar el cierre diario" }, { status: 502 });
  }
}
