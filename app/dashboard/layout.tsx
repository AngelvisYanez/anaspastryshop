import { Suspense } from "react";
import { auth, signOut } from "@/lib/auth";
import DashboardShell from "./DashboardShell";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import RealTimeGuard from "@/components/RealTimeGuard";
import { prisma } from "@/lib/prisma";
import DashboardLoading from "./loading";

function AuthLoading() {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="w-64 flex-shrink-0 bg-card border-r border-card-border h-screen animate-pulse" />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-card border-b border-card-border flex items-center justify-between px-4 md:px-8 animate-pulse">
          <div className="h-5 w-24 bg-section-alt rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-section-alt rounded-full" />
            <div className="w-8 h-8 bg-section-alt rounded-full" />
            <div className="h-8 w-32 bg-section-alt rounded-lg" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <DashboardLoading />
        </main>
      </div>
    </div>
  );
}

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const [dbUser, platformSections, pendingInscription, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isActive: true,
        deactivationReason: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    }),
    prisma.platformSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.inscription.findFirst({
      where: { userId: session.user.id, cursoId: null, status: "PENDING" },
      select: { id: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    }),
  ]);

  const isActive = dbUser?.isActive !== false;
  const deactivationReason = dbUser?.deactivationReason;
  const hasPendingPayment =
    !!pendingInscription && subscription?.status !== "ACTIVE";

  if (!isActive) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <RealTimeGuard />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-orange-100/40 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg bg-card rounded-lg p-12 shadow-2xl shadow-red-100/30 text-center border border-card-border z-10 relative">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-red-100 rounded-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center">
              <Lock className="text-red-500" size={36} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-foreground mb-4 leading-tight">
            Acceso Suspendido
          </h1>
          <p className="text-muted leading-relaxed mb-6">
            Tu cuenta acaba de ser desactivada por un administrador:
          </p>

          <div className="bg-red-50 text-red-600 font-bold p-4 rounded-lg mb-8">
            {deactivationReason || "Sin razón especificada"}
          </div>

          <p className="text-xs text-muted mb-6">
            No tienes acceso al panel. Contacta a soporte:{" "}
            <a href="mailto:soporte@academiacreditousa.com" className="text-red-500 font-bold hover:underline">
              soporte@academiacreditousa.com
            </a>
          </p>

          <div className="flex flex-col items-center gap-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/auth/login" });
              }}
            >
              <button
                type="submit"
                className="bg-navy text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-accent transition-all"
              >
                Cerrar Sesión y Salir
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  if (!dbUser) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <RealTimeGuard />
        <p>Cargando perfil...</p>
      </main>
    );
  }

  const isMentor = dbUser.role === "MENTOR";
  const hasPhoto = !!dbUser.image;
  const isBlockedMentor = isMentor && !hasPhoto;

  return (
    <DashboardShell
      user={{
        ...session.user,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        image: dbUser.image,
      }}
      isBlockedMentor={isBlockedMentor}
      platformSections={platformSections}
      hasPendingPayment={hasPendingPayment}
    >
      <RealTimeGuard />
      <Suspense fallback={<DashboardLoading />}>
        {children}
      </Suspense>
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
