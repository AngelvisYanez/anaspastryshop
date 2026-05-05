import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoryManager from "./CategoryManager";

export default async function CategoriesPage() {
  const session = await auth();

  // @ts-ignore
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // @ts-ignore
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
