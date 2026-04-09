import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Video, Users, Trash2, Edit } from "lucide-react";
import CourseActions from "./CourseActions";

export default async function CursosDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Si es MENTOR ve sus cursos, si es ADMIN ve todos
  const filter = session.user.role === "MENTOR" ? { instructorId: session.user.id } : {};

  const cursos = await prisma.curso.findMany({
    where: filter,
    include: {
      instructor: true,
      _count: {
        select: { inscritos: true, courseModules: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tighter">
            Cursos & Contenido
          </h1>
          <p className="text-gray-500 mt-2">
            Gestiona tus programas educativos pre-grabados y en vivo.
          </p>
        </div>
        <Link
          href="/dashboard/cursos/create"
          className="bg-[#5A4FCF] text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-600 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Crear Curso</span>
        </Link>
      </div>

      {cursos.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Video className="text-indigo-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A2E]">No tienes cursos publicados</h3>
          <p className="text-gray-400 mt-2 mb-6">El catálogo está vacío. Comienza tu primer curso ahora.</p>
          <Link
            href="/dashboard/cursos/create"
            className="bg-[#1A1A2E] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90"
          >
            Publicar Curso
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((c) => (
            <div key={c.id} className="relative bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col hover:shadow-xl transition-all h-full group">
              <CourseActions courseId={c.id} hasEnrolled={c._count.inscritos > 0} />
              {c.image ? (
                <div className="w-full h-40 bg-gray-100 rounded-2xl mb-5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-40 bg-indigo-50 rounded-2xl mb-5 flex items-center justify-center">
                  <Video className="text-indigo-200" size={32} />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-[#1A1A2E] leading-tight line-clamp-2">{c.title}</h3>
                  <span className="font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap">
                    ${c.price}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{c.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Video size={16} className="text-gray-400" />
                    <span className="font-medium">{c._count.courseModules} Mods</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-gray-400" />
                    <span className="font-medium">{c._count.inscritos}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {c.isLive ? "En Vivo + VOD" : "VOD (Grabado)"}
                </div>
                <Link
                  href={`/cursos/${c.id}`}
                  className="text-indigo-500 font-bold text-sm hover:underline"
                >
                  Ver Público →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
