import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGalleryItems } from "@/lib/actions/gallery";
import GalleryManager from "./GalleryManager";

export default async function GaleriaPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const items = await getGalleryItems();

  return (
    <div>
      <p className="text-muted font-medium mb-8">
        Sube las fotos de tus creaciones. Si la galería está vacía, la página de Pastelería mostrará automáticamente embeds oficiales de Instagram.
      </p>
      <GalleryManager initialItems={items} />
    </div>
  );
}