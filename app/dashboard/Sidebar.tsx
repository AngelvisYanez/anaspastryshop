"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, CreditCard,
  Users, Settings, LogOut, Activity, X,
  Radio, Star, LayoutGrid, Wallet, Video, KeyRound,
  Home, ChevronLeft, ChevronRight, Mail,
} from "lucide-react";

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
  { name: "Newsletter",         href: "/dashboard/newsletter",    icon: Mail,            roles: ["ADMIN"] },
  { name: "Auditoría",         href: "/dashboard/logs",          icon: Activity,        roles: ["ADMIN"] },
  { name: "Configuración",     href: "/dashboard/settings",      icon: Settings,        roles: ["ADMIN", "MENTOR", "USER"] },
];

export default function Sidebar({
  user,
  onMenuClick,
  isBlockedMentor = false,
  isCollapsed = false,
  onToggleCollapse,
}: {
  user: any;
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
  platformSections?: any[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const userRole = user.role as string;
  const pathname = usePathname();

  const systemItems = isBlockedMentor
    ? SYSTEM_ITEMS.filter((i) => i.name === "Configuración")
    : SYSTEM_ITEMS.filter((i) => i.roles.includes(userRole));

  function isActive(href: string) {
    return pathname === href;
  }

  const itemClass = (href: string) =>
    `flex items-center gap-3 py-2 rounded-md text-sm font-bold transition-all
     ${isCollapsed ? "lg:justify-center lg:px-0 px-3" : "px-3"}
     ${isActive(href)
       ? "bg-accent text-white shadow-sm shadow-accent/20"
       : "text-muted hover:bg-card-hover hover:text-foreground"}`;

  const actionClass =
    `flex items-center gap-3 py-2 px-3 rounded-md text-sm font-bold transition-all w-full text-muted hover:bg-card-hover hover:text-foreground
     ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`;

  return (
    <aside className="w-full h-full bg-card border-r border-card-border flex flex-col overflow-hidden">
      <div className={`flex items-center border-b border-card-border h-14 shrink-0 px-4 ${isCollapsed ? "lg:justify-center" : "justify-between"}`}>
        <Link
          href="/dashboard"
          className={`flex items-center transition-all ${isCollapsed ? "lg:hidden" : ""}`}
        >
          <Image
            src="/logo-acu.png"
            alt="Academia Credito USA"
            width={130}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {isCollapsed && (
          <Link href="/dashboard" className="hidden lg:flex items-center justify-center">
            <Image
              src="/logo-acu.png"
              alt="ACU"
              width={32}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md text-muted hover:bg-card-hover hover:text-foreground transition-colors"
            title={isCollapsed ? "Expandir" : "Colapsar"}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-md text-muted hover:bg-card-hover transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={16} />
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
            <item.icon size={16} className="shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : ""}>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-card-border py-3 px-2 space-y-0.5 shrink-0">
        <Link
          href="/"
          className={actionClass}
          title={isCollapsed ? "Ver Homepage" : undefined}
        >
          <Home size={16} className="shrink-0" />
          <span className={isCollapsed ? "lg:hidden" : ""}>Ver Homepage</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm font-bold transition-all w-full text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20
            ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          <span className={isCollapsed ? "lg:hidden" : ""}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
