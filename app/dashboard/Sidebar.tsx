"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, X } from "lucide-react";
import { DynamicIcon } from "./modulos/DynamicIcon";
import { moduleHref, type ModuleRecord } from "@/lib/dashboard-module-list";

export default function Sidebar({
  user,
  onMenuClick,
  isCollapsed = false,
  platformSections = [],
}: {
  user: any;
  onMenuClick?: () => void;
  isCollapsed?: boolean;
  platformSections?: ModuleRecord[];
}) {
  const pathname = usePathname();
  const role = user?.role || "USER";

  const systemItems = platformSections.filter((item) =>
    item.isActive && item.roles.includes(role),
  );

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside
      className={`h-full w-full flex flex-col justify-between bg-card transition duration-300 ${
        isCollapsed ? "lg:w-20" : "w-full"
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-card-border px-4 ${
          isCollapsed ? "justify-between lg:justify-center lg:px-2" : "justify-between"
        }`}>
          <Link href="/dashboard" className="flex items-center justify-center" aria-label="Ana's Pastry Shop">
            <div className={`relative h-9 w-auto flex items-center ${isCollapsed ? "lg:hidden" : ""}`}>
              <Image
                src="/logo-anas-pastry-shop.png"
                alt="Ana's Pastry Shop"
                width={140}
                height={36}
                className="h-9 w-auto object-contain dark:hidden"
                priority
              />
              <Image
                src="/logo-anas-pastry-shop-white.png"
                alt="Ana's Pastry Shop"
                width={140}
                height={36}
                className="h-9 w-auto object-contain hidden dark:block"
                priority
              />
            </div>
            {isCollapsed && (
              <Image
                src="/favicon.png"
                alt="Ana's Pastry Shop"
                width={32}
                height={32}
                className="hidden lg:block w-8 h-8 object-contain"
                priority
              />
            )}
          </Link>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-1.5 text-muted hover:text-foreground rounded-lg lg:hidden"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {systemItems.map((item) => {
            const href = moduleHref(item.slug);
            const active = isActive(href);
            return (
              <Link
                key={item.slug}
                href={href}
                onClick={onMenuClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  active
                    ? "bg-accent-solid text-white shadow-md shadow-accent/20"
                    : "text-muted hover:text-foreground hover:bg-card-hover"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="shrink-0"><DynamicIcon name={item.icon} size={18} /></span>
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-card-border space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3">
        {!isCollapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-section-alt flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-solid text-white flex items-center justify-center text-xs font-black shrink-0 overflow-hidden">
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
