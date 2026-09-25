import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, LockIcon } from "lucide-react";

async function ClaseContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ courseTitle: string; moduleTitle: string }>;
}) {
  const { courseTitle, moduleTitle } = await paramsPromise;
  const decodedCourse = decodeURIComponent(courseTitle);
  const decodedModule = decodeURIComponent(moduleTitle);

  const session = await auth();
  if (!session?.user) {
    redirect(`/iniciar-sesion?callbackUrl=/clases/${courseTitle}/${moduleTitle}`);
  }

  const course = await prisma.curso.findFirst({
    where: { title: decodedCourse },
    include: {
      courseModules: {
        where: { title: decodedModule },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
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
        status: "APPROVED",
      },
    });
    if (inscription) {
      hasAccess = true;
    } else {
      const purchase = await prisma.coursePurchase.findFirst({
        where: {
          userId: session.user.id,
          cursoId: course.id,
          status: "COMPLETED",
        },
      });
      if (purchase) {
        hasAccess = true;
      }
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-brand-purple-deep flex items-center justify-center p-8 text-center text-white">
        <div className="max-w-md w-full bg-brand-purple border border-pink-500/20 p-8 rounded-2xl shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <LockIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
          <p className="text-white/70 mb-8 leading-relaxed text-sm">
            Para ver esta clase y su material, debes estar inscrito formalmente en este curso.
          </p>
          <Link href={`/cursos/${course.id}`} className="block w-full py-3.5 bg-accent hover:bg-accent-hover font-bold rounded-xl transition-all shadow-md shadow-pink-600/25">
            Ver Detalles del Curso
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-purple-deep text-white">
      <nav className="h-16 bg-black/50 border-b border-white/10 flex items-center px-6 gap-4 sticky top-0 z-50 backdrop-blur-xl">
        <Link href={`/dashboard/cursos/${course.id}`} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <span className="w-px h-6 bg-white/10 block" />
        <div className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis">
          <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-500/20 px-2.5 py-0.5 rounded-full mr-3 border border-pink-500/30">Curso Online</span>
          <span className="text-sm font-bold opacity-90">{course.title}</span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        <main className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden h-[40vh] lg:h-full">
          {modulo.videoUrl ? (
            <div className="w-full h-full relative aspect-video lg:aspect-auto">
              <iframe
                src={
                  modulo.videoUrl.includes("youtube")
                    ? modulo.videoUrl.replace("watch?v=", "embed/")
                    : modulo.videoUrl.includes("youtu.be")
                    ? `https://www.youtube.com/embed/${modulo.videoUrl.split("/").pop()}`
                    : modulo.videoUrl
                }
                title={modulo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <PlayCircle size={64} className="text-pink-400/40 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-bold text-white/60">Contenido en Producción</h2>
              <p className="text-white/40 text-sm mt-1 max-w-sm">
                El instructor aún no ha configurado el video de este módulo.
              </p>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-96 bg-brand-purple border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-[60vh] lg:h-full">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold leading-snug">{modulo.title}</h2>
            <span className="text-xs text-pink-300 block mt-1">{modulo.lessons.length} Temas desglosados</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {modulo.lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="p-3.5 bg-white/[0.04] border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-pink-500/30">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">{lesson.title}</h3>
                  {lesson.summary && (
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{lesson.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-black/30 border-t border-white/10">
            <Link
              href={`/dashboard/cursos/${course.id}`}
              className="block w-full text-center py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              Volver al Temario Completo
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ClasePage({
  params,
}: {
  params: Promise<{ courseTitle: string; moduleTitle: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-purple-deep">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-pink-500/30 border-t-pink-500" />
        </div>
      }
    >
      <ClaseContent paramsPromise={params} />
    </Suspense>
  );
}
