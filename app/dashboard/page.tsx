import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Wallet,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) return null;
  const role = session.user.role;

  // 1. Lógica de Datos para el ADMIN (Tú)
  const pendingPaymentsCount = await prisma.inscription.count({
    where: { status: "PENDING" },
  });

  // @ts-ignore
  const totalRevenue = await prisma.inscription.aggregate({
    where: { status: "APPROVED" },
    // @ts-ignore
    _sum: { amountPaid: true },
  });

  // 2. Lógica de Datos para el MENTOR (Michelle/Rodrigo)
  const myTalleresCount = await prisma.taller.count({
    where: { instructorId: session.user.id },
  });

  // 3. Últimas inscripciones reales
  const lastInscriptions = await prisma.inscription.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      taller: { select: { title: true } },
      // @ts-ignore
      curso: { select: { title: true } },
    },
  });

  return (
    <div className="p-8">
      {/* ml-64 para no chocar con el sidebar fijo */}
      {/* --- HEADER --- */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1A1A2E]">
          Bienvenido, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 font-medium">
          {role === "ADMIN"
            ? "Panel de Control Global"
            : "Gestiona tu contenido y alumnos"}
        </p>
      </div>

      {/* --- TARJETAS DE ESTADÍSTICAS (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {role === "ADMIN" && (
          <>
            <Link href="/dashboard/pagos" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-100 transition-colors">
                  <Clock size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-gray-300">
                  Pendientes
                </span>
              </div>
              <p className="text-4xl font-black text-[#1A1A2E]">
                {pendingPaymentsCount}
              </p>
              <p className="text-sm text-gray-400 font-bold mt-1">
                Pagos por validar
              </p>
            </Link>

            <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#5A4FCF] text-white rounded-2xl">
                  <Wallet size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Ingresos
                </span>
              </div>
              <p className="text-4xl font-black italic">
                {/* @ts-ignore */}
                ${totalRevenue?._sum?.amountPaid || 0}
              </p>
              <p className="text-sm text-gray-400 font-bold mt-1">
                Ventas aprobadas
              </p>
            </div>
          </>
        )}

        {(role === "MENTOR" || role === "ADMIN") && (
          <Link href="/dashboard/talleres" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="p-3 bg-indigo-50 text-[#5A4FCF] rounded-2xl w-fit mb-4 group-hover:bg-indigo-100 transition-colors">
              <BookOpen size={24} />
            </div>
            <p className="text-4xl font-black text-[#1A1A2E]">
              {myTalleresCount}
            </p>
            <p className="text-sm text-gray-400 font-bold mt-1">
              {role === "ADMIN" ? "Talleres Totales" : "Mis Talleres Activos"}
            </p>
          </Link>
        )}

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="p-3 bg-green-50 text-green-500 rounded-2xl w-fit mb-4">
            <Users size={24} />
          </div>
          <p className="text-4xl font-black text-[#1A1A2E]">
            {role === "ADMIN" ? "128" : "12"}
          </p>
          <p className="text-sm text-gray-400 font-bold mt-1">
            Alumnos {role === "ADMIN" ? "totales" : "en mis cursos"}
          </p>
        </div>
      </div>

      {/* --- SECCIÓN INFERIOR: ACCIÓN INMEDIATA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Actividad Reciente */}
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <AlertCircle size={20} className="text-[#5A4FCF]" />
            Últimas Inscripciones
          </h3>

          <div className="space-y-6">
            {(lastInscriptions as any[]).length > 0 ? (lastInscriptions as any[]).map((ins) => (
              <div key={ins.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-[#5A4FCF]">
                    {ins.user?.name ? ins.user.name.substring(0, 2).toUpperCase() : "??"}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A2E]">{ins.user?.name || ins.user?.email}</p>
                    <p className="text-xs text-gray-400">
                      {ins.taller?.title || ins.curso?.title || "S/N"}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                  ins.status === "PENDING" ? "text-orange-500 bg-orange-50" : 
                  ins.status === "APPROVED" ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"
                }`}>
                  {ins.status === "PENDING" ? "Pendiente" : ins.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                </span>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-4 italic">No hay inscripciones recientes.</p>
            )}
          </div>
        </div>


        {/* Accesos Rápidos */}
        <div className="bg-indigo-50/50 rounded-[3rem] p-10 border border-indigo-100">
          <h3 className="text-xl font-bold mb-8">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-4">
            {role === "ADMIN" && (
              <Link href="/dashboard/pagos" className="w-full bg-white p-5 rounded-2xl font-bold text-[#1A1A2E] flex items-center justify-between hover:scale-[1.02] transition-transform shadow-sm">
                Ir a Validar Pagos <ArrowRight size={18} />
              </Link>
            )}
            {(role === "ADMIN" || role === "MENTOR") && (
              <Link href="/dashboard/talleres/create" className="w-full bg-white p-5 rounded-2xl font-bold text-[#1A1A2E] flex items-center justify-between hover:scale-[1.02] transition-transform shadow-sm">
                Crear Nuevo Taller <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

