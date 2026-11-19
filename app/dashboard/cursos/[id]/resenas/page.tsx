import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Reseñas del curso | Dashboard" };

const dateFormat = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeZone: "America/Caracas",
});

export default async function CourseReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const [session, { id }] = await Promise.all([auth(), params]);
  if (!session?.user?.id) redirect("/iniciar-sesion");
  if (session.user.role !== "ADMIN") notFound();

  const course = await prisma.curso.findUnique({
    where: { id },
    select: {
      title: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href={`/dashboard/cursos/${id}`} className="inline-block text-sm font-bold text-accent">
        Volver al curso
      </Link>
      <header>
        <h1 className="text-2xl font-black text-foreground">Reseñas del curso</h1>
        <p className="mt-1 text-sm text-muted">{course.title}</p>
      </header>
      {course.reviews.length ? (
        <ul className="space-y-3">
          {course.reviews.map((review) => (
            <li key={review.id} id={review.id} className="scroll-mt-24 rounded-2xl border border-card-border bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold text-foreground">{review.user.name || review.user.email}</p>
                <time dateTime={review.createdAt.toISOString()} className="text-xs text-muted">
                  {dateFormat.format(review.createdAt)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap wrap-anywhere text-sm text-foreground">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-card-border bg-card p-5 text-sm text-muted">
          Este curso todavía no tiene reseñas.
        </p>
      )}
    </div>
  );
}
