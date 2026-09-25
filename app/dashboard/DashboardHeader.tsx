"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import {
  Menu, Bell, Moon, Sun, User, Settings, LogOut,
  ChevronDown, CheckCircle2, AlertTriangle, Info,
} from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/cursos": "Cursos & Workshops",
  "/dashboard/usuarios": "Usuarios",
  "/dashboard/pagos": "Pagos",
  "/dashboard/emails": "Emails",
  "/dashboard/logs": "Registro de Eventos",
  "/dashboard/settings": "Configuración",
  "/dashboard/metodos-pago": "Métodos de Pago",
  "/dashboard/modulos": "Módulos",
  "/dashboard/api-config": "Config. APIs",
  "/dashboard/mis-cursos": "Mis Cursos",
};

type Notification = {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: {
  user: any;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const getPageTitle = (path: string) => {
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    for (const [key, value] of Object.entries(PAGE_TITLES)) {
      if (path.startsWith(key) && key !== "/dashboard") return value;
    }
    return "Panel de Control";
  };

  const roleLabel =
    user.role === "ADMIN" ? "Administrador" : "Alumno";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount((data.notifications ?? []).filter((n: Notification) => !n.read).length);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [notifOpen]);

  useEffect(() => {
    fetch("/api/notifications/count")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const markAllAsRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const notifIcon = (type: Notification["type"]) => {
    if (type === "success") return <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />;
    if (type === "warning") return <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />;
    return <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />;
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-card-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-muted hover:text-foreground hover:bg-card-hover rounded-lg md:hidden transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground leading-none">
            {getPageTitle(pathname)}
          </h1>
          <span className="text-[11px] text-muted font-medium hidden sm:block mt-0.5">
            Ana&apos;s Pastry Shop
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notificaciones */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 text-muted hover:text-foreground hover:bg-card-hover rounded-lg transition-colors"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-card animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-card-border rounded-xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
              <div className="p-4 border-b border-card-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-foreground">Notificaciones</p>
                  <p className="text-[11px] text-muted font-medium">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-accent hover:underline"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-card-border">
                {loading ? (
                  <div className="p-8 text-center text-xs text-muted">Cargando...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto text-muted/30 mb-2" />
                    <p className="text-xs font-medium text-muted">No tienes notificaciones</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex gap-3 hover:bg-card-hover transition-colors ${
                        !n.read ? "bg-accent/5" : ""
                      }`}
                    >
                      {notifIcon(n.type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground leading-snug">{n.title}</p>
                        <p className="text-[11px] text-muted leading-relaxed mt-0.5">{n.description}</p>
                        <p className="text-[11px] text-muted/50 mt-1">{timeAgo(new Date(n.time))}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-muted hover:text-foreground hover:bg-card-hover rounded-lg transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <div className="h-5 w-px bg-card-border mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-card-hover transition-colors"
            aria-label="Menú de usuario"
          >
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black shadow-sm overflow-hidden shrink-0">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.name || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-xs font-bold text-foreground hidden sm:block max-w-[120px] truncate">
              {user.name || "Mi Cuenta"}
            </span>
            <ChevronDown size={14} className="text-muted hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card border border-card-border rounded-xl shadow-xl z-50 overflow-hidden text-left py-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-card-border">
                <p className="text-xs font-bold text-foreground truncate">{user.name || "Usuario"}</p>
                <p className="text-[11px] text-muted truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-accent-subtle text-accent rounded-full">
                  {roleLabel}
                </span>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
              >
                <User size={14} className="text-muted" />
                Mi Perfil
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
              >
                <Settings size={14} className="text-muted" />
                Configuración
              </Link>

              <div className="h-px bg-card-border my-1" />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut size={14} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
