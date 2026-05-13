"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, CreditCard,
  Users, Settings, LogOut, Activity, X,
  Radio, Star, Wallet, Video,
  Home, Mail,
} from "lucide-react";

const SYSTEM_ITEMS = [
  { name: "Inicio",            href: "/dashboard",               icon: LayoutDashboard, roles: ["ADMIN", "MENTOR", "USER"] },
  { name: "Cursos",             href: "/dashboard/mis-cursos",    icon: BookOpen,        roles: ["USER"] },
  { name: "Lives",             href: "/dashboard/lives",         icon: Radio,           roles: ["USER"] },
  { name: "Webinars",          href: "/dashboard/webinars",      icon: Video,           roles: ["USER"] },
  { name: "Gestionar Cursos",  href: "/dashboard/cursos",        icon: BookOpen,        roles: ["ADMIN", "MENTOR"] },
  { name: "Gestionar Lives",   href: "/dashboard/lives",         icon: Radio,           roles: ["ADMIN", "MENTOR"] },
  { name: "Webinars",          href: "/dashboard/webinars",      icon: Video,           roles: ["ADMIN"] },
  { name: "Pagos",              href: "/dashboard/pagos",         icon: CreditCard,      roles: ["ADMIN"] },
  { name: "Métodos de Pago",   href: "/dashboard/metodos-pago",  icon: Wallet,          roles: ["ADMIN"] },
  { name: "Suscripciones",     href: "/dashboard/suscripciones", icon: Star,            roles: ["ADMIN"] },
  { name: "Usuarios",          href: "/dashboard/usuarios",      icon: Users,           roles: ["ADMIN", "MENTOR"] },
  { name: "Emails",              href: "/dashboard/emails",        icon: Mail,            roles: ["ADMIN"] },
  { name: "Registro de Eventos", href: "/dashboard/logs",          icon: Activity,        roles: ["ADMIN"] },
  { name: "Configuración",     href: "/dashboard/settings",      icon: Settings,        roles: ["ADMIN", "MENTOR", "USER"] },
];

export default function Sidebar({
  user,
  onMenuClick,
  isBlockedMentor = false,
  isCollapsed = false,
}: {
  user: any;
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
  platformSections?: any[];
  isCollapsed?: boolean;
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
      <div className="flex items-center justify-between lg:justify-center border-b border-card-border h-16 shrink-0 px-4">
        <Link
          href="/dashboard"
          className={`flex items-center transition-all ${isCollapsed ? "lg:hidden" : ""}`}
        >
          <Image
            src="/logo-acu.png"
            alt="Academia Credito USA"
            width={160}
            height={44}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        {isCollapsed && (
          <Link href="/dashboard" className="hidden lg:flex items-center justify-center">
            <Image
              src="/favicon.png"
              alt="ACU"
              width={32}
              height={32}
              className="h-7 w-7 object-contain"
              priority
            />
          </Link>
        )}

        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-muted hover:bg-card-hover transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={16} />
        </button>
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
