import Link from "next/link";
import { Globe, LayoutGrid, MessageCircle, Plug, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllApiConfigs } from "@/lib/actions/platformApi";
import { listDashboardModules } from "@/lib/dashboard-module-list";
import { DashboardPage } from "../DashboardPage";
import ApiConfigManager from "../api-config/ApiConfigManager";
import PlatformModuleManager from "../modulos/PlatformModuleManager";
import ProfileForm from "./ProfileForm";
import SiteConfigForm from "./SiteConfigForm";
import WhatsAppSettings from "./WhatsAppSettings";

const sections = [
  { id: "perfil", label: "Mi cuenta", icon: UserRound },
  { id: "sitio", label: "Sitio web", icon: Globe },
  { id: "modulos", label: "Módulos del panel", icon: LayoutGrid },
  { id: "integraciones", label: "Integraciones", icon: Plug },
  { id: "whatsapp", label: "WhatsApp del negocio", icon: MessageCircle },
] as const;

export default async function SettingsPage({ searchParams }: {
  searchParams: Promise<{ seccion?: string | string[] }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/iniciar-sesion");

  const [dbUser, params] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true, whatsappNumber: true, whatsappMarketing: true },
    }),
    searchParams,
  ]);
  if (!dbUser) redirect("/dashboard");

  const isAdmin = dbUser.role === "ADMIN" && session.user.role === "ADMIN";
  const availableSections = isAdmin ? sections : sections.slice(0, 1);
  const active = availableSections.find(({ id }) => id === params.seccion)?.id ?? "perfil";

  let content;
  switch (active) {
    case "sitio": {
      const config = await prisma.siteConfig.findFirst().catch(() => null);
      content = <SiteConfigForm initialConfig={{
        siteName: config?.siteName ?? "Ana's Pastry Shop",
        logoUrl: config?.logoUrl ?? null,
        ctaText: config?.ctaText ?? "Quiero unirme ahora",
        ctaUrl: config?.ctaUrl ?? "/cursos",
        instagramUrl: config?.instagramUrl ?? null,
        linkedinUrl: config?.linkedinUrl ?? null,
        tiktokUrl: config?.tiktokUrl ?? null,
        navItems: (config?.navItems as { label: string; href: string }[]) ?? [],
      }} />;
      break;
    }
    case "modulos": {
      const modules = await prisma.platformSection.findMany({ orderBy: { order: "asc" } });
      content = <PlatformModuleManager initialSections={listDashboardModules(modules)} />;
      break;
    }
    case "integraciones": {
      const configs = await getAllApiConfigs();
      content = <ApiConfigManager configs={configs.map((config) => ({
        ...config, config: config.config as Record<string, string>,
      }))} />;
      break;
    }
    case "whatsapp":
      content = <WhatsAppSettings />;
      break;
    default:
      content = <ProfileForm initialUser={dbUser} />;
  }

  return (
    <DashboardPage title="Configuración" description={isAdmin
      ? "Administra tu cuenta y las herramientas del negocio."
      : "Gestiona tu perfil, tu contraseña y tus preferencias de contacto."}>
      <div className={isAdmin ? "grid min-w-0 items-start gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8" : "max-w-4xl"}>
        {isAdmin && (
          <nav aria-label="Secciones de configuración" className="flex flex-wrap gap-1.5 rounded-2xl border border-card-border bg-card p-2 lg:sticky lg:top-4 lg:flex-col">
            {availableSections.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={id === "perfil" ? "/dashboard/settings" : `/dashboard/settings?seccion=${id}`}
                aria-current={id === active ? "page" : undefined}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-section-alt hover:text-foreground aria-[current=page]:bg-accent-subtle aria-[current=page]:text-accent sm:text-sm"
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        )}
        <div key={active} className="min-w-0">{content}</div>
      </div>
    </DashboardPage>
  );
}
