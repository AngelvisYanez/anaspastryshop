import { prisma } from "@/lib/prisma";

export async function getCourseReviewProgress(courseId: string, userId: string) {
  const [modules, review] = await Promise.all([
    prisma.courseModuleCompletion.findMany({
      where: { userId, module: { cursoId: courseId } },
      select: { moduleId: true },
    }),
    prisma.courseReview.findUnique({
      where: { cursoId_userId: { cursoId: courseId, userId } },
      select: { id: true },
    }),
  ]);
  return { completedModuleIds: modules.map(({ moduleId }) => moduleId), reviewed: !!review };
}

export type CourseReviewProgress = Awaited<ReturnType<typeof getCourseReviewProgress>>;

export async function getCourseReviewsReadAt(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { courseReviewsReadAt: true },
  });
  return user?.courseReviewsReadAt ?? new Date(0);
}
