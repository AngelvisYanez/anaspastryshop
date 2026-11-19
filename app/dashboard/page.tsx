import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserDashboardHome } from "@/app/dashboard/UserDashboardHome";
import { AdminDashboardHome } from "./AdminDashboardHome";
import { getOverview } from "./admin-overview/get-overview";
import { parseOverviewFilter } from "./admin-overview/overview";

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

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;
  const firstName = session.user.name?.split(" ")[0];
  const userId = session.user.id;

  const userData = role === "USER" && userId ? await getUserCourses(userId) : null;
  const filter = role === "ADMIN" ? parseOverviewFilter(await searchParams) : null;
  const adminStats = filter ? await getOverview(filter) : null;

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

      {userId && filter && adminStats && (
        <AdminDashboardHome adminId={userId} filter={filter} stats={adminStats} />
      )}
    </div>
  );
}
