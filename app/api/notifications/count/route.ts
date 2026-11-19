import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseReviewsReadAt } from "@/lib/data/course-reviews";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const role = (session.user as any).role as string;
  let count = 0;

  try {
    if (role === "ADMIN") {
      const [pendingPayments, unreadReviews] = await Promise.all([
        prisma.inscription.count({ where: { status: "PENDING" } }),
        getCourseReviewsReadAt(session.user.id).then((readAt) =>
          prisma.courseReview.count({ where: { createdAt: { gt: readAt } } }),
        ),
      ]);
      count = pendingPayments + unreadReviews;
    }
  } catch {
    count = 0;
  }

  return NextResponse.json({ count });
}
