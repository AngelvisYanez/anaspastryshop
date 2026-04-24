import { auth, signOut } from "@/lib/auth";
import DashboardShell from "./DashboardShell";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import RealTimeGuard from "@/components/RealTimeGuard";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const [dbUser, platformSections] = await Promise.all([
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
  ]);

  const isActive = dbUser?.isActive !== false;
  const deactivationReason = dbUser?.deactivationReason;

  if (!isActive) {
    return (
      <main className="min-h-screen bg-[#F8F4EE] flex items-center justify-center p-6 relative overflow-hidden">
        <RealTimeGuard />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-orange-100/40 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl shadow-red-100/30 text-center border border-white z-10 relative">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-red-100 rounded-3xl animate-pulse" />
            <div className="relative w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
              <Lock className="text-red-500" size={36} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-[#0B1F3A] mb-4 leading-tight">
            Acceso Suspendido
          </h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            Tu cuenta acaba de ser desactivada por un administrador:
          </p>

          <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl mb-8">
            {deactivationReason || "Sin razón especificada"}
          </div>

          <p className="text-xs text-gray-400 mb-6">
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
                className="bg-[#0B1F3A] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-[#C9A84C] transition-all"
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
    >
      <RealTimeGuard />
      {children}
    </DashboardShell>
  );
}
