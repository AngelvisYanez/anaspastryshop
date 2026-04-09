import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseCreateClient from "./CourseCreateClient";

export default async function CreateCoursePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    redirect("/dashboard");
  }

  const isAdmin = session.user.role === "ADMIN";
  let mentors: Array<{ id: string, name: string | null, email: string }> = [];

  if (isAdmin) {
    mentors = await prisma.user.findMany({
      where: { role: "MENTOR", isApproved: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    });
  }

  return <CourseCreateClient mentors={mentors} isAdmin={isAdmin} />;
}
