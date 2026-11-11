import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import SiteConfigForm from "./SiteConfigForm";
import { getAllApiConfigs } from "@/lib/actions/platformApi";
import ApiConfigManager from "../api-config/ApiConfigManager";
import PlatformModuleManager from "../modulos/PlatformModuleManager";
import { DashboardPage } from "../DashboardPage";
import WhatsAppSettings from "./WhatsAppSettings";
import { listDashboardModules } from "@/lib/dashboard-module-list";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/iniciar-sesion");
  }

  const [dbUser, siteConfig, sections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true, whatsappNumber: true, whatsappMarketing: true },
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
      <nav aria-label="Secciones de configuración" className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold sm:text-sm">
        <a href="#perfil" className="shrink-0 rounded-xl border border-card-border bg-card px-3 py-2.5">Perfil</a>
        {isAdmin && <><a href="#sitio" className="shrink-0 rounded-xl border border-card-border bg-card px-3 py-2.5">Sitio web</a><a href="#modulos" className="shrink-0 rounded-xl border border-card-border bg-card px-3 py-2.5">Módulos</a><a href="#integraciones" className="shrink-0 rounded-xl border border-card-border bg-card px-3 py-2.5">Integraciones</a></>}
      </nav>
      <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${isAdmin ? "xl:grid-cols-12" : ""}`}>
        <div id="perfil" className={`${isAdmin ? "xl:col-span-5" : "max-w-2xl"} min-w-0 scroll-mt-4`}>
          <ProfileForm
            initialUser={{
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.image,
              whatsappNumber: dbUser.whatsappNumber,
              whatsappMarketing: dbUser.whatsappMarketing,
            }}
          />
        </div>

        {isAdmin && (
          <div id="sitio" className="min-w-0 scroll-mt-4 xl:col-span-7">
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
        <div id="modulos" className="min-w-0 scroll-mt-4 bg-card border border-card-border rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm">
          <PlatformModuleManager initialSections={listDashboardModules(sections)} />
        </div>
      )}

      {isAdmin && <div id="integraciones" className="min-w-0 scroll-mt-4 space-y-5 sm:space-y-6"><ApiConfigManager configs={apiConfigs as any} /><WhatsAppSettings /></div>}
    </DashboardPage>
  );
}
