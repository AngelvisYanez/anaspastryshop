"use client";
import { Bell, Search, User as UserIcon, Menu } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

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

  return (
    <header className="sticky top-0 z-30 w-full bg-card/80 backdrop-blur-md border-b border-card-border flex items-center justify-between px-4 md:px-8 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 lg:hidden text-muted hover:bg-card-hover rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight transition-all">
            {isBlockedMentor ? "Perfil Incompleto" : getPageTitle(pathname)}
          </h2>
          {isBlockedMentor ? (
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5 animate-pulse">
              Acceso restringido: Sube tu foto
            </p>
          ) : (
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5 opacity-80 hidden sm:block">
              Academia Credito USA
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 pr-4 md:pr-6 border-r border-card-border">
          <button className="hidden sm:block p-2.5 text-muted hover:text-accent hover:bg-accent-subtle rounded-full transition-all" title="Buscar">
            <Search size={20} />
          </button>
          <button className="relative p-2.5 text-muted hover:text-accent hover:bg-accent-subtle rounded-full transition-all" title="Notificaciones">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-card-hover p-1.5 md:pr-5 rounded-2xl border border-card-border hover:bg-card transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-card-border shadow-sm relative shrink-0">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Perfil"} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-navy text-white flex items-center justify-center font-bold text-xs uppercase">
                {user.name ? user.name.substring(0, 2) : <UserIcon size={16} />}
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-black text-foreground leading-tight truncate max-w-[120px]">
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
