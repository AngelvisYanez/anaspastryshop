import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, BarChart2, ArrowRight } from "lucide-react";

export default async function MisCursosPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "USER") redirect("/dashboard");

  const inscripciones = await prisma.inscription.findMany({
    where: {
      userId: session.user.id,
      status: "APPROVED",
      cursoId: { not: null },
    },
    include: {
      curso: {
        include: {
          instructor: { select: { name: true } },
          _count: { select: { courseModules: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#0B1F3A]">Mis Cursos</h1>
        <p className="text-gray-400 font-medium">
          Cursos a los que tienes acceso actualmente.
        </p>
      </div>

      {inscripciones.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
          <BookOpen className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-400 font-bold mb-4">
            Aún no tienes cursos activos.
          </p>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-[#C9A84C] font-bold hover:underline text-sm"
          >
            Explorar cursos disponibles <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {inscripciones.map(({ curso, id }) => {
            if (!curso) return null;
            return (
              <div
                key={id}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {curso.image && (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-6 bg-gray-100">
                    <Image
                      src={curso.image}
                      alt={curso.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-[#C9A84C] px-3 py-1 rounded-lg w-fit mb-3">
                  {curso.level}
                </span>

                <h3 className="text-lg font-bold text-[#0B1F3A] mb-2 leading-snug flex-1">
                  {curso.title}
                </h3>

                <p className="text-xs text-gray-400 font-medium mb-4">
                  Instructor: {curso.instructor.name}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-6">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#C9A84C]" />
                    {curso.totalHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart2 size={13} className="text-[#C9A84C]" />
                    {curso._count.courseModules} módulos
                  </span>
                </div>

                <Link href={`/cursos/${curso.id}`}>
                  <button className="w-full bg-[#0B1F3A] text-white py-3 rounded-2xl font-bold text-sm hover:bg-[#C9A84C] transition-all flex items-center justify-center gap-2">
                    Ir al Curso <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
