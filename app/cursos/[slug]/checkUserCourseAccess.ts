import { prisma } from "@/lib/prisma";

export async function checkUserCourseAccess({
  userId,
  role,
  courseId,
  instructorId,
}: {
  userId?: string | null;
  role?: string | null;
  courseId: string;
  instructorId?: string | null;
}) {
  if (!userId) return false;
  if (role === "ADMIN" || instructorId === userId) return true;

  const inscription = await prisma.inscription.findFirst({
    where: { userId, cursoId: courseId, status: "APPROVED" },
  });
  if (inscription) return true;

  const purchase = await prisma.coursePurchase.findFirst({
    where: { userId, cursoId: courseId, status: "COMPLETED" },
  });
  return !!purchase;
}
