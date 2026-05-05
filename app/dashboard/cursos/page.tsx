import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Video, Users, Tag } from "lucide-react";
import CourseActions from "./CourseActions";
import CategoryManager from "../categorias/CategoryManager";

export default async function CursosDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMIN";
  const filter = isAdmin ? {} : { instructorId: session.user.id };

  const [cursos, categories] = await Promise.all([
    prisma.curso.findMany({
      where: filter,
      include: {
        instructor: true,
        _count: { select: { inscritos: true, courseModules: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    isAdmin
      ? prisma.category.findMany({ orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">
            Cursos & Contenido
          </h1>
          <p className="text-muted mt-1 font-medium">
            Gestiona tus programas educativos pre-grabados y en vivo.
          </p>
        </div>
        <Link
          href="/dashboard/cursos/create"
          className="bg-accent text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-accent-hover transition-colors"
        >
          <PlusCircle size={18} />
          Crear Curso
        </Link>
      </div>

      {cursos.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center border border-card-border shadow-sm flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-accent-subtle rounded-lg flex items-center justify-center mb-4">
            <Video className="text-accent" size={28} />
          </div>
          <h3 className="text-xl font-bold text-foreground">No tienes cursos publicados</h3>
          <p className="text-muted mt-2 mb-6">El catálogo está vacío. Comienza tu primer curso ahora.</p>
          <Link
            href="/dashboard/cursos/create"
            className="bg-navy dark:bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:opacity-90"
          >
            Publicar Curso
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {cursos.map((c) => (
            <div key={c.id} className="relative bg-card rounded-xl border border-card-border p-5 flex flex-col hover:shadow-lg transition-all h-full group">
              <CourseActions courseId={c.id} hasEnrolled={c._count.inscritos > 0} />
              {c.image ? (
                <div className="relative w-full h-36 bg-card-hover rounded-lg mb-4 overflow-hidden">
                  <Image src={c.image} alt={c.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-36 bg-accent-subtle rounded-lg mb-4 flex items-center justify-center">
                  <Video className="text-accent/40" size={28} />
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-foreground leading-tight line-clamp-2">{c.title}</h3>
                  <span className="font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-0.5 rounded-md text-xs whitespace-nowrap">
                    ${c.price}
                  </span>
                </div>
                <p className="text-xs text-muted mb-4 line-clamp-2">{c.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted bg-section-alt p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Video size={14} className="text-muted" />
                    <span className="font-medium">{c._count.courseModules} Mods</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-muted" />
                    <span className="font-medium">{c._count.inscritos}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-card-border flex items-center justify-between">
                <div className="text-xs text-muted font-medium bg-section-alt px-3 py-1 rounded-md border border-card-border">
                  {c.isLive ? "En Vivo + VOD" : "VOD (Grabado)"}
                </div>
                <Link href={`/cursos/${c.id}`} className="text-accent font-bold text-sm hover:underline">
                  Ver Público →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="border-t border-card-border pt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-accent-subtle rounded-md flex items-center justify-center">
              <Tag size={15} className="text-accent" />
            </div>
            <h2 className="text-xl font-black text-foreground">Categorías de Cursos</h2>
          </div>
          <CategoryManager initialCategories={categories} />
        </div>
      )}
    </div>
  );
}
