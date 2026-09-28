import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserDashboardHome } from "@/app/dashboard/UserDashboardHome";
import {
  AdminDashboardHome,
  type AdminDashboardStats,
} from "@/app/dashboard/AdminDashboardHome";

export const metadata = {
  title: "Dashboard",
};

async function getUserCourses(userId: string) {
  const [purchases, inscriptions, pendingCount] = await Promise.all([
    prisma.coursePurchase.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        curso: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { courseModules: true } },
          },
        },
      },
    }),
    prisma.inscription.findMany({
      where: { userId, status: "APPROVED", NOT: { cursoId: null } },
      include: {
        curso: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { courseModules: true } },
          },
        },
      },
    }),
    prisma.inscription.count({
      where: { userId, status: "PENDING" },
    }),
  ]);

  const courseMap = new Map<string, (typeof purchases)[number]["curso"]>();
  for (const p of purchases) {
    if (p.curso) courseMap.set(p.cursoId, p.curso);
  }
  for (const i of inscriptions) {
    if (i.curso && i.cursoId) courseMap.set(i.cursoId, i.curso);
  }

  return {
    userCourses: Array.from(courseMap.values()),
    pendingInscription: pendingCount > 0,
  };
}

async function getAdminStats(): Promise<AdminDashboardStats> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    recentInscriptions,
    recentUsers,
    currentRevenue,
    previousRevenue,
    currentUsersCount,
    previousUsersCount,
    totalRevenue,
    methods,
    pendingPayments,
    totalUsers,
  ] = await Promise.all([
    prisma.inscription.findMany({
      where: { createdAt: { gte: fourteenDaysAgo }, status: "APPROVED" },
      select: { createdAt: true, amountPaid: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.inscription.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo }, status: "APPROVED" },
      _sum: { amountPaid: true },
    }),
    prisma.inscription.aggregate({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, status: "APPROVED" },
      _sum: { amountPaid: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.inscription.aggregate({
      where: { status: "APPROVED" },
      _sum: { amountPaid: true },
    }),
    prisma.inscription.groupBy({
      by: ["method"],
      where: { status: "APPROVED" },
      _sum: { amountPaid: true },
    }),
    prisma.inscription.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
  ]);

  const daysMap = new Map<string, { date: string; amount: number; count: number; users: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    daysMap.set(key, { date: key, amount: 0, count: 0, users: 0 });
  }

  for (const item of recentInscriptions) {
    const key = new Date(item.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
    const current = daysMap.get(key);
    if (current) {
      current.amount += item.amountPaid;
      current.count += 1;
    }
  }

  for (const item of recentUsers) {
    const key = new Date(item.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
    const current = daysMap.get(key);
    if (current) current.users += 1;
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    userGrowth: calculateGrowth(currentUsersCount, previousUsersCount),
    revenueGrowth: calculateGrowth(
      currentRevenue._sum.amountPaid || 0,
      previousRevenue._sum.amountPaid || 0
    ),
    totalRevenue: totalRevenue._sum.amountPaid || 0,
    registrationsByDay: Array.from(daysMap.values()).map((d) => ({
      date: d.date,
      revenue: d.users,
    })),
    revenueByDay: Array.from(daysMap.values()).map((d) => ({
      date: d.date,
      revenue: d.amount,
    })),
    paymentMethodsData: methods.map((m) => ({
      name: m.method || "Otro",
      value: m._sum.amountPaid || 0,
    })),
    pendingPayments,
    totalUsers,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;
  const firstName = session.user.name?.split(" ")[0];
  const userId = session.user.id;

  const userData = role === "USER" && userId ? await getUserCourses(userId) : null;
  const adminStats = role === "ADMIN" ? await getAdminStats() : null;

  const lastInscriptions =
    role === "ADMIN"
      ? await prisma.inscription.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            curso: { select: { title: true } },
          },
        })
      : [];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
          Hola, {firstName}
        </h1>
        <p className="text-muted font-medium mt-0.5 sm:mt-1 text-sm sm:text-base">
          {role === "ADMIN"
            ? "Explora el rendimiento de tu tienda y gestiona los cursos y workshops."
            : "Bienvenido a tu espacio de formación. Cursos online y workshops individuales con acceso permanente."}
        </p>
      </div>

      {role === "USER" && userData && (
        <UserDashboardHome
          userCourses={userData.userCourses}
          pendingInscription={userData.pendingInscription}
        />
      )}

      {role === "ADMIN" && adminStats && (
        <AdminDashboardHome
          adminStats={adminStats}
          lastInscriptions={lastInscriptions}
        />
      )}
    </div>
  );
}
