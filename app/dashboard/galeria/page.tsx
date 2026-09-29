import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGalleryItems } from "@/lib/actions/gallery";
import GalleryManager from "./GalleryManager";
import { DashboardPage } from "../DashboardPage";

export default async function GaleriaPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const items = await getGalleryItems();

  return (
    <DashboardPage
      title="Galería & Instagram"
      description="Sube fotos de tus creaciones. Si la galería está vacía, Pastelería mostrará embeds de Instagram."
    >
      <GalleryManager initialItems={items} />
    </DashboardPage>
  );
}
