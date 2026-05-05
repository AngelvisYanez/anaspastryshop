import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, BarChart2, ArrowRight, Star, PlayCircle } from "lucide-react";

export default async function MisCursosPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "USER") redirect("/dashboard");

  const [subscription, allCourses] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.curso.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        level: true,
        totalHours: true,
        _count: { select: { courseModules: true } },
        instructor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasActiveSub = subscription?.status === "ACTIVE";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">
            {hasActiveSub ? "Membresía activa" : "Sin membresía"}
          </p>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Mis Cursos</h1>
          <p className="text-muted font-medium mt-1">
            {hasActiveSub
              ? "Acceso completo a todos los cursos de la plataforma."
              : "Activa tu membresía para desbloquear todos los cursos."}
          </p>
        </div>
        {hasActiveSub && (
          <div className="hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800">
            <Star size={14} />
            <span className="text-xs font-black uppercase tracking-widest">Membresía Activa</span>
          </div>
        )}
      </div>

      {!hasActiveSub ? (
        <div className="bg-card border border-card-border rounded-lg p-16 text-center">
          <BookOpen className="mx-auto text-muted/30 mb-4" size={48} />
          <p className="text-foreground font-bold text-lg mb-2">
            Activa tu membresía para acceder
          </p>
          <p className="text-muted font-medium mb-8 max-w-md mx-auto leading-relaxed">
            Con la membresía mensual obtienes acceso ilimitado a todos los cursos,
            sesiones en vivo y material exclusivo de la academia.
          </p>
          <Link
            href="/checkout/membresia"
            className="inline-flex items-center gap-2 bg-navy dark:bg-accent text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            Activar Membresía <ArrowRight size={16} />
          </Link>
        </div>
      ) : allCourses.length === 0 ? (
        <div className="bg-card border border-card-border rounded-lg p-16 text-center">
          <PlayCircle className="mx-auto text-muted/30 mb-4" size={48} />
          <p className="text-muted font-bold">Aún no hay cursos publicados en la plataforma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allCourses.map((curso) => (
            <Link key={curso.id} href={`/cursos/${curso.id}`}>
              <div className="bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all group flex flex-col h-full">
                {curso.image ? (
                  <div className="relative w-full h-40 bg-section-alt overflow-hidden">
                    <Image
                      src={curso.image}
                      alt={curso.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-section-alt flex items-center justify-center">
                    <PlayCircle size={36} className="text-muted/30" />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-accent-subtle text-accent px-2 py-0.5 rounded-md w-fit mb-3">
                    {curso.level}
                  </span>

                  <h3 className="text-base font-bold text-foreground mb-1 leading-snug line-clamp-2 flex-1">
                    {curso.title}
                  </h3>

                  <p className="text-xs text-muted font-medium mb-4">
                    {curso.instructor.name}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-accent" />
                      {curso.totalHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart2 size={12} className="text-accent" />
                      {curso._count.courseModules} módulos
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
