"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, CreditCard,
  Users, Settings, LogOut, Activity, X,
  Radio, Wallet, Mail, Compass, ChefHat, Images,
} from "lucide-react";

const SYSTEM_ITEMS = [
  { name: "Inicio",                     href: "/dashboard",               icon: LayoutDashboard, roles: ["ADMIN", "USER"] },
  { name: "Mis Cursos & Workshops",     href: "/dashboard/mis-cursos",    icon: BookOpen,        roles: ["USER"] },
  { name: "Explorar Formaciones",       href: "/cursos",                  icon: Compass,         roles: ["USER"] },
  { name: "Lives",                      href: "/dashboard/lives",         icon: Radio,           roles: ["USER"] },
  { name: "Cursos & Workshops",         href: "/dashboard/cursos",        icon: BookOpen,        roles: ["ADMIN"] },
  { name: "Gestionar Lives",            href: "/dashboard/lives",         icon: Radio,           roles: ["ADMIN"] },
  { name: "Galería & Instagram",        href: "/dashboard/galeria",       icon: Images,          roles: ["ADMIN"] },
  { name: "Usuarios",                   href: "/dashboard/usuarios",      icon: Users,           roles: ["ADMIN"] },
  { name: "Pagos",                      href: "/dashboard/pagos",         icon: CreditCard,      roles: ["ADMIN"] },
  { name: "Métodos de Pago",            href: "/dashboard/metodos-pago",  icon: Wallet,          roles: ["ADMIN"] },
  { name: "Emails",                     href: "/dashboard/emails",        icon: Mail,            roles: ["ADMIN"] },
  { name: "Registro de Eventos",        href: "/dashboard/logs",          icon: Activity,        roles: ["ADMIN"] },
  { name: "Configuración",              href: "/dashboard/settings",      icon: Settings,        roles: ["ADMIN", "USER"] },
];

export default function Sidebar({
  user,
  onMenuClick,
  isCollapsed = false,
}: {
  user: any;
  onMenuClick?: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const role = user?.role || "USER";

  const systemItems = SYSTEM_ITEMS.filter((item) =>
    item.roles.includes(role),
  );

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside
      className={`fixed md:sticky top-0 h-screen z-40 flex flex-col justify-between border-r border-card-border bg-card transition-all duration-300 ${
        isCollapsed ? "lg:w-20 w-64" : "w-64"
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-card-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              <Image
                src="/logo-anas-pastry-shop.png"
                alt="Ana's Pastry Shop"
                width={36}
                height={36}
                className="w-9 h-9 object-contain dark:hidden"
                priority
              />
              <Image
                src="/logo-anas-pastry-shop-white.png"
                alt="Ana's Pastry Shop"
                width={36}
                height={36}
                className="w-9 h-9 object-contain hidden dark:block"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-black text-sm text-foreground leading-none tracking-tight">
                  Ana&apos;s Pastry
                </span>
                <span className="text-[11px] text-accent font-black tracking-widest uppercase mt-0.5">
                  Shop
                </span>
              </div>
            )}
          </Link>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-1.5 text-muted hover:text-foreground rounded-lg md:hidden"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {systemItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMenuClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  active
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "text-muted hover:text-foreground hover:bg-card-hover"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-card-border space-y-2">
        {!isCollapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-section-alt flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black shrink-0 overflow-hidden">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.name || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{user.name || "Usuario"}</p>
              <p className="text-[11px] text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
