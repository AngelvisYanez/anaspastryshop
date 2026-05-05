"use client";
import { Bell, Search, User as UserIcon, Menu, X, CheckCircle2, AlertCircle, Info, Clock } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/cursos": "Cursos",
  "/dashboard/pagos": "Validar Pagos",
  "/dashboard/usuarios": "Usuarios",
  "/dashboard/categorias": "Categorías",
  "/dashboard/logs": "Auditoría",
  "/dashboard/settings": "Configuración",
  "/dashboard/suscripciones": "Suscripciones",
  "/dashboard/metodos-pago": "Métodos de Pago",
  "/dashboard/modulos": "Módulos",
  "/dashboard/api-config": "Config. APIs",
  "/dashboard/webinars": "Webinars",
  "/dashboard/lives": "Lives",
  "/dashboard/mentores": "Mentores",
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
  isBlockedMentor = false,
}: {
  user: any;
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
}) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const getPageTitle = (path: string) => {
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    for (const [key, value] of Object.entries(PAGE_TITLES)) {
      if (path.startsWith(key) && key !== "/dashboard") return value;
    }
    return "Panel de Control";
  };

  const roleLabel =
    user.role === "ADMIN" ? "Administrador" :
    user.role === "MENTOR" ? "Mentor" : "Alumno";

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
      .then((r) => r.ok ? r.json() : { notifications: [] })
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount((data.notifications ?? []).filter((n: Notification) => !n.read).length);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [notifOpen]);

  useEffect(() => {
    fetch("/api/notifications/count")
      .then((r) => r.ok ? r.json() : { count: 0 })
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  const iconMap = {
    success: <CheckCircle2 size={15} className="text-green-500 shrink-0" />,
    warning: <AlertCircle size={15} className="text-amber-500 shrink-0" />,
    info: <Info size={15} className="text-accent shrink-0" />,
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-card/90 backdrop-blur-md border-b border-card-border flex items-center justify-between px-4 md:px-8 py-3.5">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 lg:hidden text-muted hover:bg-card-hover rounded-md transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="font-display text-lg font-black text-foreground tracking-tight transition-all">
            {isBlockedMentor ? "Perfil Incompleto" : getPageTitle(pathname)}
          </h2>
          {isBlockedMentor ? (
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5 animate-pulse">
              Acceso restringido: Sube tu foto
            </p>
          ) : (
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5 hidden sm:block">
              Academia Credito USA
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 pr-4 md:pr-5 border-r border-card-border">
          <button
            className="hidden sm:block p-2 text-muted hover:text-accent hover:bg-accent-subtle rounded-md transition-all"
            title="Buscar"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>

          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 text-muted hover:text-accent hover:bg-accent-subtle rounded-md transition-all"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-2rem))] bg-card border border-card-border rounded-xl shadow-[var(--shadow-card)] overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
                  <h3 className="text-sm font-black text-foreground">Notificaciones</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-accent hover:underline"
                      >
                        Marcar todo leído
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-1 text-muted hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex flex-col gap-2 p-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-section-alt rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center py-10 px-4 text-center">
                      <Bell size={28} className="text-muted/30 mb-3" />
                      <p className="text-sm font-bold text-muted">Sin notificaciones</p>
                      <p className="text-[11px] text-muted/60 mt-1">Todo está en orden por ahora</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-card-border last:border-0 hover:bg-card-hover transition-colors ${!n.read ? "bg-accent-subtle/30" : ""}`}
                      >
                        <div className="mt-0.5">{iconMap[n.type]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                          <p className="text-[11px] text-muted line-clamp-2">{n.description}</p>
                          <p className="text-[10px] text-muted/50 mt-0.5 flex items-center gap-1">
                            <Clock size={9} /> {n.time}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card-hover px-2 py-1.5 md:pr-4 rounded-lg border border-card-border hover:bg-section-alt transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-md overflow-hidden border border-card-border shadow-sm relative shrink-0">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Perfil"} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase">
                {user.name ? user.name.substring(0, 2) : <UserIcon size={14} />}
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight truncate max-w-[120px]">
              {user.name || "Usuario"}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
