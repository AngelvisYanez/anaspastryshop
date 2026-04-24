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
  Sun, Moon,
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
  { name: "Mis Cursos",        href: "/dashboard/mis-cursos",    icon: BookOpen,        roles: ["USER"] },
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
}: {
  user: any;
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
  platformSections?: PlatformSection[];
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

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      isActive(href)
        ? "bg-accent text-white shadow-lg shadow-accent/20"
        : "text-muted hover:bg-card-hover hover:text-foreground"
    }`;

  return (
    <aside className="w-64 bg-card h-full border-r border-card-border p-6 flex flex-col relative">
      <div className="mb-10 px-2 flex justify-between items-center">
        <Link href="/dashboard" className="relative w-36 h-12">
          <Image
            src="/logo_II.webp"
            alt="Academia Credito USA"
            fill
            sizes="144px"
            className="object-contain object-left brightness-0 dark:brightness-0 dark:invert"
            priority
          />
        </Link>
        <button
          onClick={onMenuClick}
          className="p-2 lg:hidden text-muted hover:bg-card-hover rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {systemItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMenuClick}
            className={linkClass(item.href)}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}

        {!isBlockedMentor && dynamicSections.length > 0 && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted/50">
                Plataforma
              </p>
            </div>
            {dynamicSections.map((section) => {
              const href = `/${section.slug}`;
              return (
                <Link
                  key={section.id}
                  href={href}
                  onClick={onMenuClick}
                  className={linkClass(href)}
                >
                  <DynamicIcon name={section.icon} size={20} />
                  {section.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="pt-4 border-t border-card-border space-y-1">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-4 py-3 text-muted font-bold text-sm hover:bg-card-hover rounded-2xl transition-all w-full"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
          </button>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all w-full"
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
