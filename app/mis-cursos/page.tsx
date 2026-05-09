import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, BarChart2, PlayCircle, ShoppingBag } from "lucide-react";

export default async function MisCursosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [purchases, inscriptions] = await Promise.all([
    prisma.coursePurchase.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      include: {
        curso: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { courseModules: true } },
          },
        },
      },
    }),
    prisma.inscription.findMany({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        NOT: { cursoId: null },
      },
      include: {
        curso: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { courseModules: true } },
          },
        },
      },
    }),
  ]);

  const courseMap = new Map<string, any>();
  for (const p of purchases) {
    if (p.curso) courseMap.set(p.cursoId, p.curso);
  }
  for (const i of inscriptions) {
    if (i.curso && i.cursoId) courseMap.set(i.cursoId, i.curso);
  }
  const courses = Array.from(courseMap.values());

  if (courses.length === 0) redirect("/cursos");

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">
              Cursos adquiridos
            </p>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Mis Cursos</h1>
            <p className="text-muted font-medium mt-1">
              Acceso completo a los cursos que has comprado.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-accent-subtle text-accent px-4 py-2 rounded-xl border border-accent/20">
            <ShoppingBag size={14} />
            <span className="text-xs font-black uppercase tracking-widest">
              {courses.length} {courses.length === 1 ? "Curso" : "Cursos"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((curso: any) => (
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
      </div>
      <Footer />
    </main>
  );
}
