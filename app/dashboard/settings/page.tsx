import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/auth/login");
  }

  // Buscamos los datos frescos del usuario en la BD
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
    },
  });

  if (!dbUser) {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <ProfileForm 
        initialUser={{
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
        }} 
      />
    </div>
  );
}
