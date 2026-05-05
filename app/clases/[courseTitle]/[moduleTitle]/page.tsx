import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, LockIcon, AlertCircle } from "lucide-react";

async function ClaseContent({ params }: { params: Promise<{ courseTitle: string; moduleTitle: string }> }) {
  const { courseTitle, moduleTitle } = await params;
  const decodedCourseTitle = decodeURIComponent(courseTitle);
  const decodedModuleTitle = decodeURIComponent(moduleTitle);

  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const course = await prisma.curso.findFirst({
    where: { title: decodedCourseTitle },
    include: {
      courseModules: {
        where: { title: decodedModuleTitle },
        include: {
          lessons: { orderBy: { order: "asc" } }
        }
      }
    }
  });

  if (!course || course.courseModules.length === 0) {
    notFound(); 
  }

  const modulo = course.courseModules[0];

  let hasAccess = false;
  if (session.user.role === "ADMIN" || course.instructorId === session.user.id) {
    hasAccess = true;
  } else {
    const inscription = await prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
        cursoId: course.id,
        status: "APPROVED"
      }
    });
    if (inscription) hasAccess = true;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0A0A15] flex items-center justify-center p-8 text-center text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <LockIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            No tienes los pases necesarios para ver esta clase confidencial. Debes comprar el curso primero.
          </p>
          <Link href={`/cursos/${course.id}`} className="block w-full py-3 bg-indigo-600 hover:bg-amber-500 font-bold rounded-xl transition-colors">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A15] text-white">
      
      <nav className="h-16 bg-black/50 border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-50 backdrop-blur-xl">
        <Link href={`/cursos/${course.id}`} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <span className="w-px h-6 bg-white/10 block" />
        <div className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-amber-500/10 px-2 py-0.5 rounded mr-3">Curso</span>
          <span className="text-sm font-bold opacity-90">{course.title}</span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        <main className="flex-1 bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden h-[40vh] lg:h-full">
          {modulo.videoUrl ? (
            <div className="w-full h-full relative aspect-video lg:aspect-auto">
              <iframe
                src={modulo.videoUrl.includes('youtube') 
                    ? modulo.videoUrl.replace('watch?v=', 'embed/').split('&')[0] 
                    : modulo.videoUrl} 
                title="Video del curso"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="text-center flex flex-col items-center p-8">
              <div className="w-24 h-24 mb-6 relative">
                 <div className="absolute inset-0 bg-indigo-600/30 blur-2xl rounded-full" />
                 <AlertCircle size={80} className="text-amber-400 relative z-10 mx-auto" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Clase en Producción</h2>
              <p className="text-slate-400 max-w-sm">No hay video configurado todavía para este módulo. Vuelve más tarde o pregúntale a tu mentor.</p>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-[400px] xl:w-[450px] bg-[#0F0F1A] border-l border-white/5 overflow-y-auto">
          <div className="p-8 pb-32">
            <h2 className="text-2xl font-black mb-1">{modulo.title}</h2>
            <p className="text-sm text-amber-400 font-bold mb-8 flex items-center gap-2 uppercase tracking-wide">
              <PlayCircle size={16} /> Ahora Reproduciendo
            </p>

            <div className="space-y-6 relative">
              <div className="absolute left-[15px] top-6 bottom-8 w-px bg-white/10 z-0" />
               
              {modulo.lessons.map((task, idx) => (
                <div key={task.id} className="relative z-10 flex gap-5 group">
                  <div className="w-8 h-8 rounded-full border border-white/20 bg-[#0F0F1A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-lg group-hover:border-indigo-500 group-hover:text-amber-400 transition-colors">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-colors">
                    <h4 className="font-bold text-sm text-slate-200 mb-2 leading-tight">
                      {task.title}
                    </h4>
                    {task.summary && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {task.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {modulo.lessons.length === 0 && (
                <div className="relative z-10 pl-12 text-slate-500 italic text-sm">
                   Este módulo no tiene tareas descritas.
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default function ClaseViewerPage({ params }: { params: Promise<{ courseTitle: string; moduleTitle: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A15]" />}>
      <ClaseContent params={params} />
    </Suspense>
  );
}
