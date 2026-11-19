import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dateBounds } from "../data-view/filters";
import { summarizeOverview, type ActivityItem, type ChartItem, type OverviewFilter, type OverviewStats, type PaymentBucket, type StudentBucket } from "./overview";

export async function getOverview(filter: OverviewFilter): Promise<OverviewStats> {
  const { gte, lte } = dateBounds(filter.range);
  // Prisma stores these fields as timezone-free UTC timestamps.
  const range = (column: Prisma.Sql) => Prisma.sql`
    ${gte ? Prisma.sql`AND ${column} >= ${gte.toISOString()}::timestamp` : Prisma.empty}
    ${lte ? Prisma.sql`AND ${column} <= ${lte.toISOString()}::timestamp` : Prisma.empty}
  `;
  const bucket = (column: Prisma.Sql) => Prisma.sql`to_char(date_trunc(${filter.bucket}::text, ${column} - interval '4 hours'), 'YYYY-MM-DD')`;

  // Resolved payments use the same event date as the payment history. Pending uploads use receipt date.
  const events = Prisma.sql`
    WITH events AS (
      SELECT i."id", i."userId", i."cursoId", i."amountPaid" AS amount, i."status" AS status,
        CASE WHEN i."status" = 'PENDING' THEN i."createdAt" ELSE i."updatedAt" END AS at,
        CASE
          WHEN i."method" = 'TRANSFERENCIA' THEN 'BANK_TRANSFER'
          WHEN i."method" IN ('BANK_TRANSFER', 'ZELLE', 'PAGO_MOVIL', 'BINANCE', 'USDT', 'STRIPE') THEN i."method"
          ELSE 'OTHER'
        END AS method
      FROM "Inscription" i
      WHERE i."status" IN ('APPROVED', 'PENDING', 'REJECTED')
      UNION ALL
      SELECT p."id", p."userId", p."cursoId", p."amount", 'APPROVED', p."updatedAt", 'STRIPE'
      FROM "CoursePurchase" p WHERE p."status" = 'COMPLETED'
    ), filtered AS (
      SELECT * FROM events
      WHERE true ${range(Prisma.sql`at`)}
      ${filter.method ? Prisma.sql`AND method = ${filter.method}` : Prisma.empty}
    )
  `;

  const [payments, students, topCourses, activity] = await Promise.all([
    prisma.$queryRaw<PaymentBucket[]>`
      ${events}
      SELECT ${bucket(Prisma.sql`at`)} AS day, method, status, count(*)::float8 AS count,
        sum(amount)::float8 AS amount
      FROM filtered GROUP BY 1, 2, 3
    `,
    prisma.$queryRaw<StudentBucket[]>`
      SELECT ${bucket(Prisma.sql`"createdAt"`)} AS day, count(*)::float8 AS count
      FROM "User" WHERE "role" = 'USER' ${range(Prisma.sql`"createdAt"`)}
      GROUP BY 1
    `,
    prisma.$queryRaw<ChartItem[]>`
      ${events}
      SELECT c."title" AS name, count(*)::float8 AS value
      FROM filtered f INNER JOIN "Curso" c ON c."id" = f."cursoId"
      WHERE f.status = 'APPROVED'
      GROUP BY c."id", c."title" ORDER BY value DESC, c."title", c."id" LIMIT 5
    `,
    prisma.$queryRaw<ActivityItem[]>`
      ${events}
      SELECT f.id, f.at, f.method, f.status, f.amount, u."name", u."email", c."title"
      FROM filtered f INNER JOIN "User" u ON u."id" = f."userId"
      LEFT JOIN "Curso" c ON c."id" = f."cursoId"
      ORDER BY f.at DESC, f.id DESC LIMIT 12
    `,
  ]);

  return { ...summarizeOverview(payments, students, filter), topCourses, activity };
}
