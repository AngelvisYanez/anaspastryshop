import fs from "fs";

const read = (f) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const write = (f, c) => fs.writeFileSync(f, c.replace(/\n/g, "\r\n"));

const page = read("app/dashboard/page.tsx");

const userStart = page.indexOf('{role === "USER" && (');
const adminStart = page.indexOf('{role === "ADMIN" && adminStats && (');
const tableStart = page.indexOf("{/* Recent inscriptions table */}");
const closingMain = page.lastIndexOf("    </div>\n  );\n}");

if (userStart < 0 || adminStart < 0 || tableStart < 0 || closingMain < 0) {
  throw new Error(`markers: ${userStart} ${adminStart} ${tableStart} ${closingMain}`);
}

function unwrapRoleBlock(block, prefix) {
  let s = block.trim();
  if (!s.startsWith(prefix)) throw new Error("bad prefix: " + s.slice(0, 60));
  s = s.slice(prefix.length).trimEnd();
  if (s.endsWith(")}")) s = s.slice(0, -2).trimEnd();
  else if (s.endsWith(")")) s = s.slice(0, -1).trimEnd();
  else throw new Error("bad suffix: " + JSON.stringify(s.slice(-40)));
  return s;
}

const userInner = unwrapRoleBlock(
  page.slice(userStart, adminStart),
  '{role === "USER" && ('
);

const adminStatsInner = unwrapRoleBlock(
  page.slice(adminStart, tableStart),
  '{role === "ADMIN" && adminStats && ('
);

let tableSection = page.slice(tableStart, closingMain).trim();
const commentEnd = tableSection.indexOf("*/}");
if (commentEnd >= 0) {
  tableSection = tableSection.slice(commentEnd + 3).trim();
}
const tableInner = unwrapRoleBlock(tableSection, '{role === "ADMIN" && (');

write(
  "app/dashboard/UserDashboardHome.tsx",
  `import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle, PlayCircle, BookOpen, ArrowRight,
  MapPin, Calendar, Clock, Tag,
} from "lucide-react";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

export function UserDashboardHome({
  userCourses,
  pendingInscription,
}: {
  userCourses: any[];
  pendingInscription: boolean;
}) {
  return (
${userInner}
  );
}
`
);

write(
  "app/dashboard/AdminDashboardHome.tsx",
  `import Link from "next/link";
import {
  Users, Clock, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";
import { AdminRevenueChart } from "@/app/dashboard/charts/AdminCharts";

export type AdminDashboardStats = {
  userGrowth: number;
  revenueGrowth: number;
  totalRevenue: number;
  registrationsByDay: { date: string; revenue: number }[];
  revenueByDay: { date: string; revenue: number }[];
  paymentMethodsData: { name: string; value: number }[];
  pendingPayments: number;
  totalUsers: number;
};

export type RecentInscription = {
  id: string;
  amountPaid: number;
  method: string;
  status: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  curso: { title: string } | null;
};

export function AdminDashboardHome({
  adminStats,
  lastInscriptions,
}: {
  adminStats: AdminDashboardStats;
  lastInscriptions: RecentInscription[];
}) {
  return (
    <>
${adminStatsInner}
      {/* Recent inscriptions table */}
${tableInner}
    </>
  );
}
`
);

console.log("ok", userInner.split("\n").length, adminStatsInner.split("\n").length, tableInner.split("\n").length);
