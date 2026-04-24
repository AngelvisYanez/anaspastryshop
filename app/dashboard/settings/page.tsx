import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import SiteConfigForm from "./SiteConfigForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/auth/login");
  }

  const [dbUser, siteConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true },
    }),
    prisma.siteConfig.findFirst().catch(() => null),
  ]);

  if (!dbUser) redirect("/dashboard");

  const isAdmin = dbUser.role === "ADMIN";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tighter">Configuración</h1>
        <p className="text-muted font-medium mt-1">Administra tu perfil y la configuración del sitio.</p>
      </div>

      <ProfileForm
        initialUser={{
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
        }}
      />

      {isAdmin && (
        <SiteConfigForm
          initialConfig={{
            siteName: siteConfig?.siteName ?? "Academia Credito USA",
            logoUrl: siteConfig?.logoUrl ?? null,
            ctaText: siteConfig?.ctaText ?? "Quiero unirme ahora",
            ctaUrl: siteConfig?.ctaUrl ?? "/planes",
            instagramUrl: siteConfig?.instagramUrl ?? null,
            linkedinUrl: siteConfig?.linkedinUrl ?? null,
            tiktokUrl: siteConfig?.tiktokUrl ?? null,
            subscriptionPrice: siteConfig?.subscriptionPrice ?? 97,
            subscriptionPriceId: siteConfig?.subscriptionPriceId ?? null,
            navItems: (siteConfig?.navItems as { label: string; href: string }[]) ?? [],
          }}
        />
      )}
    </div>
  );
}
