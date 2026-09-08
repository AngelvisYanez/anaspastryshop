import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CourseCreateClient from "./CourseCreateClient";

export default async function CreateCoursePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <CourseCreateClient isAdmin />;
}
