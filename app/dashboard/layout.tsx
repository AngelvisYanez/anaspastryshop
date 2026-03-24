import { auth } from "@/lib/auth";
import Sidebar from "./Sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fijo */}
      <Sidebar userRole={session.user.role as string} />
      
      {/* Contenido Principal */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
