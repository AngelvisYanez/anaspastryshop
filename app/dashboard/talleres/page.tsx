import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Plus, MapPin, Users, Clock } from "lucide-react";
import TallerActions from "./TallerActions";

export default async function TalleresDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const talleres = await prisma.taller.findMany({
    where: session.user.role === "ADMIN" ? {} : { instructorId: session.user.id },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { inscritos: true } },
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E]">Gestionar Talleres</h1>
          <p className="text-gray-400 font-medium">Controla tus eventos próximos y registrados.</p>
        </div>
        <Link href="/dashboard/talleres/create">
          <button className="bg-[#5A4FCF] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#483dbb] transition-all shadow-lg shadow-indigo-100">
            <Plus size={20} /> Nuevo Taller
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {talleres.length > 0 ? talleres.map((taller) => (
          <div key={taller.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-[#5A4FCF] px-3 py-1 rounded-lg w-fit">
                  {taller.category}
                </span>
                {session.user.role === "ADMIN" && (
                  <span className="text-[9px] font-bold text-gray-400 px-1">
                    Mentor: {taller.instructor.name}
                  </span>
                )}
              </div>
              <span className="text-lg font-black text-[#1A1A2E]">${taller.price}</span>
            </div>
            
            <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">{taller.title}</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Calendar size={16} className="text-[#5A4FCF]" />
                {new Date(taller.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Clock size={16} className="text-[#5A4FCF]" />
                {taller.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <MapPin size={16} className="text-[#5A4FCF]" />
                {taller.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} className="text-[#5A4FCF]" />
                {taller._count.inscritos} / {taller.slots} inscritos
              </div>
            </div>

            <TallerActions 
              id={taller.id} 
              inscritos={taller._count.inscritos}
              isAdmin={session.user.role === "ADMIN"}
            />
          </div>
        )) : (
          <div className="col-span-full bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
            <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold mb-6">No hay talleres registrados.</p>
            <Link href="/dashboard/talleres/create">
              <span className="text-[#5A4FCF] font-bold hover:underline">Empieza creando el primero</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
