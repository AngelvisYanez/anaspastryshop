import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, PlayCircle } from "lucide-react";

function getEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  return url;
}

async function LessonContent({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id: cursoId, lessonId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/cursos/" + cursoId);
  }

  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    include: {
      courseModules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } }
      }
    }
  });

  if (!curso) notFound();

  let hasPaid = false;
  if (session.user.role === "ADMIN" || curso.instructorId === session.user.id) {
    hasPaid = true;
  } else {
    const [inscription, activeSubscription] = await Promise.all([
      prisma.inscription.findFirst({
        where: { userId: session.user.id, cursoId: curso.id, status: "APPROVED" },
      }),
      prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    ]);
    if (inscription || activeSubscription?.status === "ACTIVE") hasPaid = true;
  }

  if (!hasPaid) {
    redirect("/cursos/" + cursoId);
  }

  let currentLesson = null;

  for (const mod of curso.courseModules) {
    for (const less of mod.lessons) {
      if (less.id === lessonId) {
        currentLesson = less;
      }
    }
  }

  if (!currentLesson) notFound();

  const currentModule = curso.courseModules.find((mod) =>
    mod.lessons.some((l) => l.id === lessonId)
  ) as any;
  const embedUrl = getEmbedUrl(currentModule?.videoUrl ?? null);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans">
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
         <div className="h-16 border-b border-white/10 flex items-center px-6 shrink-0 justify-between">
            <Link href={`/cursos/${cursoId}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
               <ChevronLeft size={18} /> Volver al Curso
            </Link>
            <div className="text-sm font-bold text-gray-500">
               {curso.title}
            </div>
         </div>

         <div className="w-full bg-gray-950 aspect-video flex items-center justify-center border-b border-white/5 relative">
            {embedUrl ? (
               <iframe 
                  src={embedUrl}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
               />
            ) : (
               <div className="text-gray-600 text-center">
                  <PlayCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-bold tracking-widest uppercase text-xs">Video no disponible</p>
               </div>
            )}
         </div>

         <div className="p-8 max-w-4xl max-auto w-full">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
               {currentLesson.title}
            </h1>
            {currentLesson.summary && (
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-300 leading-relaxed">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Resumen de la Clase</h3>
                  <div className="whitespace-pre-wrap">{currentLesson.summary}</div>
               </div>
            )}
         </div>
      </div>

      <div className="w-full md:w-96 bg-[#111111] border-l border-white/10 h-screen overflow-y-auto hidden md:block shrink-0">
         <div className="p-6 border-b border-white/10 sticky top-0 bg-[#111111]/90 backdrop-blur z-10">
            <h2 className="text-lg font-black tracking-tight">Contenido</h2>
            <div className="w-full bg-white/10 h-1.5 mt-4 rounded-full overflow-hidden">
               <div className="bg-[#C9A84C] w-1/3 h-full rounded-full" />
            </div>
         </div>

         <div className="p-4 space-y-4">
            {curso.courseModules.map((mod, modIdx) => (
               <div key={mod.id} className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 px-2">
                     Módulo {modIdx + 1}: {mod.title}
                  </h3>
                  <div className="space-y-1">
                     {mod.lessons.map((less) => {
                        const isCurrent = less.id === lessonId;
                        return (
                           <Link 
                              key={less.id} 
                              href={`/cursos/${cursoId}/lesson/${less.id}`}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                 isCurrent 
                                 ? "bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-white shadow-[0_0_20px_rgba(90,79,207,0.15)]" 
                                 : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                              }`}
                           >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-[#C9A84C] text-white' : 'bg-white/10'}`}>
                                 <PlayCircle size={14} className={isCurrent ? "fill-white/20" : ""} />
                              </div>
                              <div>
                                 <p className={`text-sm font-bold line-clamp-1 ${isCurrent ? 'text-indigo-200' : ''}`}>{less.title}</p>
                              </div>
                           </Link>
                        )
                     })}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export default function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <LessonContent params={params} />
    </Suspense>
  );
}
