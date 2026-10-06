import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import SiteConfigForm from "./SiteConfigForm";
import { getAllApiConfigs } from "@/lib/actions/platformApi";
import ApiConfigManager from "../api-config/ApiConfigManager";
import PlatformModuleManager from "../modulos/PlatformModuleManager";
import { DashboardPage } from "../DashboardPage";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/iniciar-sesion");
  }

  const [dbUser, siteConfig, sections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true },
    }),
    prisma.siteConfig.findFirst().catch(() => null),
    prisma.platformSection.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!dbUser) redirect("/dashboard");

  const isAdmin = dbUser.role === "ADMIN";
  const apiConfigs = isAdmin ? await getAllApiConfigs() : [];

  return (
    <DashboardPage
      title="Configuración"
      description={
        isAdmin
          ? "Perfil, sitio público, módulos del panel e integraciones."
          : "Actualiza tu perfil y la seguridad de tu cuenta."
      }
    >
      <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${isAdmin ? "xl:grid-cols-12" : ""}`}>
        <div className={isAdmin ? "xl:col-span-5" : "max-w-2xl"}>
          <ProfileForm
            initialUser={{
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.image,
            }}
          />
        </div>

        {isAdmin && (
          <div className="xl:col-span-7">
            <SiteConfigForm
              initialConfig={{
                siteName: siteConfig?.siteName ?? "Ana's Pastry Shop",
                logoUrl: siteConfig?.logoUrl ?? null,
                ctaText: siteConfig?.ctaText ?? "Quiero unirme ahora",
                ctaUrl: siteConfig?.ctaUrl ?? "/cursos",
                instagramUrl: siteConfig?.instagramUrl ?? null,
                linkedinUrl: siteConfig?.linkedinUrl ?? null,
                tiktokUrl: siteConfig?.tiktokUrl ?? null,
                navItems: (siteConfig?.navItems as { label: string; href: string }[]) ?? [],
              }}
            />
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-card border border-card-border rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
          <PlatformModuleManager initialSections={sections} />
        </div>
      )}

      {isAdmin && <ApiConfigManager configs={apiConfigs as any} />}
    </DashboardPage>
  );
}
