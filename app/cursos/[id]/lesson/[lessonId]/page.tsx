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
    redirect("/iniciar-sesion?callbackUrl=/cursos/" + cursoId);
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
    const inscription = await prisma.inscription.findFirst({
      where: { userId: session.user.id, cursoId: curso.id, status: "APPROVED" },
    });
    if (inscription) hasPaid = true;
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
            <Link href={`/cursos/${cursoId}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold">
               <ChevronLeft size={18} /> Volver al Curso
            </Link>
            <div className="text-sm font-bold text-white/60">
               {curso.title}
            </div>
         </div>

         <div className="w-full bg-black aspect-video flex items-center justify-center border-b border-white/5 relative">
            {embedUrl ? (
               <iframe 
                  src={embedUrl}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
               />
            ) : (
               <div className="text-white/40 text-center">
                  <PlayCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-bold tracking-widest uppercase text-xs">Video no disponible</p>
               </div>
            )}
         </div>

         <div className="p-8 max-w-4xl max-auto w-full">
            <h1 className="font-display text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
               {currentLesson.title}
            </h1>
            {currentLesson.summary && (
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/80 leading-relaxed">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-pink-300 mb-3">Resumen de la Clase</h3>
                  <div className="whitespace-pre-wrap">{currentLesson.summary}</div>
               </div>
            )}
         </div>
      </div>

      <div className="w-full md:w-96 bg-[#16041D] border-l border-white/10 h-screen overflow-y-auto hidden md:block shrink-0">
         <div className="p-6 border-b border-white/10 sticky top-0 bg-[#16041D]/90 backdrop-blur z-10">
            <h2 className="text-lg font-black tracking-tight text-white font-display">Contenido</h2>
            <div className="w-full bg-white/10 h-1.5 mt-4 rounded-full overflow-hidden">
               <div className="bg-accent w-1/3 h-full rounded-full" />
            </div>
         </div>

         <div className="p-4 space-y-4">
            {curso.courseModules.map((mod, modIdx) => (
               <div key={mod.id} className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-pink-300/80 mb-3 px-2">
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
                                 ? "bg-accent/20 border border-accent/40 text-white shadow-lg shadow-pink-600/10" 
                                 : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                              }`}
                           >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-accent text-white' : 'bg-white/10'}`}>
                                 <PlayCircle size={14} className={isCurrent ? "fill-white/20" : ""} />
                              </div>
                              <div>
                                 <p className={`text-sm font-bold line-clamp-1 ${isCurrent ? 'text-pink-200' : ''}`}>{less.title}</p>
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
