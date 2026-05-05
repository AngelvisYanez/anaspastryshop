"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import {
  LayoutDashboard, BookOpen, CreditCard,
  Users, Settings, LogOut, Tag, Activity, X,
  Radio, Star, LayoutGrid, Wallet, Video, KeyRound,
  Sun, Moon, ChevronLeft, ChevronRight,
} from "lucide-react";

type PlatformSection = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: string[];
};

function DynamicIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return <LayoutGrid size={size} />;
  return <Icon size={size} />;
}

const SYSTEM_ITEMS = [
  { name: "Inicio",            href: "/dashboard",               icon: LayoutDashboard, roles: ["ADMIN", "MENTOR", "USER"] },
  { name: "Gestionar Cursos",  href: "/dashboard/cursos",        icon: BookOpen,        roles: ["ADMIN", "MENTOR"] },
  { name: "Gestionar Lives",   href: "/dashboard/lives",         icon: Radio,           roles: ["ADMIN", "MENTOR"] },
  { name: "Webinars",          href: "/dashboard/webinars",      icon: Video,           roles: ["ADMIN"] },
  { name: "Validar Pagos",     href: "/dashboard/pagos",         icon: CreditCard,      roles: ["ADMIN"] },
  { name: "Métodos de Pago",   href: "/dashboard/metodos-pago",  icon: Wallet,          roles: ["ADMIN"] },
  { name: "Suscripciones",     href: "/dashboard/suscripciones", icon: Star,            roles: ["ADMIN"] },
  { name: "Módulos",           href: "/dashboard/modulos",       icon: LayoutGrid,      roles: ["ADMIN"] },
  { name: "Config. APIs",      href: "/dashboard/api-config",    icon: KeyRound,        roles: ["ADMIN"] },
  { name: "Usuarios",          href: "/dashboard/usuarios",      icon: Users,           roles: ["ADMIN", "MENTOR"] },
  { name: "Auditoría",         href: "/dashboard/logs",          icon: Activity,        roles: ["ADMIN"] },
  { name: "Configuración",     href: "/dashboard/settings",      icon: Settings,        roles: ["ADMIN", "MENTOR", "USER"] },
];

const EMPTY_SECTIONS: PlatformSection[] = [];

export default function Sidebar({
  user,
  onMenuClick,
  isBlockedMentor = false,
  platformSections = EMPTY_SECTIONS,
  isCollapsed = false,
  onToggleCollapse,
}: {
  user: any;
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
  platformSections?: PlatformSection[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const userRole = user.role as string;
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const systemItems = isBlockedMentor
    ? SYSTEM_ITEMS.filter((i) => i.name === "Configuración")
    : SYSTEM_ITEMS.filter((i) => i.roles.includes(userRole));

  const dynamicSections = platformSections.filter(
    (s) => s.isActive && s.roles.includes(userRole)
  );

  function isActive(href: string) {
    return pathname === href;
  }

  const itemClass = (href: string) =>
    `flex items-center gap-3 py-2.5 rounded-xl text-sm font-bold transition-all
     ${isCollapsed ? "lg:justify-center lg:px-0 px-3" : "px-3"}
     ${isActive(href)
       ? "bg-accent text-white shadow-md shadow-accent/20"
       : "text-muted hover:bg-card-hover hover:text-foreground"}`;

  const actionClass =
    `flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold transition-all w-full text-muted hover:bg-card-hover hover:text-foreground
     ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`;

  return (
    <aside className="w-full h-full bg-card border-r border-card-border flex flex-col overflow-hidden">
      <div className={`flex items-center border-b border-card-border h-16 shrink-0 px-4 ${isCollapsed ? "lg:justify-center" : "justify-between"}`}>
        <Link
          href="/dashboard"
          className={`flex items-center transition-all ${isCollapsed ? "lg:hidden" : ""}`}
        >
          <Image
            src="/logo_II.webp"
            alt="Academia Credito USA"
            width={120}
            height={36}
            className="h-8 w-auto object-contain brightness-0 dark:brightness-0 dark:invert"
            priority
          />
        </Link>

        {isCollapsed && (
          <Link href="/dashboard" className="hidden lg:flex items-center justify-center">
            <Image
              src="/logo_II.webp"
              alt="ACU"
              width={28}
              height={28}
              className="h-7 w-auto object-contain brightness-0 dark:brightness-0 dark:invert"
              priority
            />
          </Link>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-muted hover:bg-card-hover hover:text-foreground transition-colors"
            title={isCollapsed ? "Expandir" : "Colapsar"}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg text-muted hover:bg-card-hover transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 space-y-0.5">
        {systemItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMenuClick}
            className={itemClass(item.href)}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon size={17} className="shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : ""}>{item.name}</span>
          </Link>
        ))}

        {!isBlockedMentor && dynamicSections.length > 0 && (
          <>
            <div className={`pt-4 pb-1 px-3 ${isCollapsed ? "lg:hidden" : ""}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted/40">
                Plataforma
              </p>
            </div>
            {isCollapsed && <div className="my-2 h-px bg-card-border mx-2 hidden lg:block" />}
            {dynamicSections.map((section) => {
              const href = `/${section.slug}`;
              return (
                <Link
                  key={section.id}
                  href={href}
                  onClick={onMenuClick}
                  className={itemClass(href)}
                  title={isCollapsed ? section.name : undefined}
                >
                  <DynamicIcon name={section.icon} size={18} />
                  <span className={isCollapsed ? "lg:hidden" : ""}>{section.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-card-border py-3 px-2 space-y-0.5 shrink-0">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={actionClass}
            title={isCollapsed ? (theme === "dark" ? "Modo Claro" : "Modo Oscuro") : undefined}
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
            <span className={isCollapsed ? "lg:hidden" : ""}>
              {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </span>
          </button>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold transition-all w-full text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20
            ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          <span className={isCollapsed ? "lg:hidden" : ""}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
