import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserCourseAccess } from "@/app/cursos/[slug]/checkUserCourseAccess";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response(null, { status: 401 });

  const course = await prisma.curso.findUnique({
    where: { id },
    select: { recipePdfId: true, instructorId: true, isLive: true },
  });
  if (!course || course.isLive || !course.recipePdfId) return new Response(null, { status: 404 });

  const allowed = await checkUserCourseAccess({
    userId: session.user.id,
    role: session.user.role,
    courseId: id,
    instructorId: course.instructorId,
  });
  if (!allowed) return new Response(null, { status: 403 });

  const recipe = await prisma.courseRecipePdf.findUnique({ where: { id: course.recipePdfId } });
  if (!recipe) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(recipe.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="recetario.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
