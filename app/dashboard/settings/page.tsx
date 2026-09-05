import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import SiteConfigForm from "./SiteConfigForm";
import { getAllApiConfigs } from "@/lib/actions/platformApi";
import ApiConfigManager from "../api-config/ApiConfigManager";
import PlatformModuleManager from "../modulos/PlatformModuleManager";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/iniciar-sesion");
  }

  const [dbUser, siteConfig, apiConfigs, sections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true },
    }),
    prisma.siteConfig.findFirst().catch(() => null),
    getAllApiConfigs(),
    prisma.platformSection.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!dbUser) redirect("/dashboard");

  const isAdmin = dbUser.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <p className="text-muted font-medium">Administra tu perfil y la configuración del sitio.</p>
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
            siteName: siteConfig?.siteName ?? "Academia Omnia",
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

      {isAdmin && <PlatformModuleManager initialSections={sections} />}

      {isAdmin && <ApiConfigManager configs={apiConfigs as any} />}
    </div>
  );
}
