"use client";
import { Bell, Search, User as UserIcon, Menu } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function DashboardHeader({ 
  user, 
  onMenuClick,
  isBlockedMentor = false
}: { 
  user: any; 
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
}) {
  const pathname = usePathname();

  // Mapeo simple de títulos según la ruta
  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Inicio";
    if (path.includes("/cursos")) return "Cursos";
    if (path.includes("/pagos")) return "Pagos";
    if (path.includes("/usuarios")) return "Usuarios";
    if (path.includes("/categorias")) return "Categorías";
    if (path.includes("/logs")) return "Auditoría";
    if (path.includes("/settings")) return "Configuración";
    return "Panel de Control";
  };

  const roleLabel = user.role === "ADMIN" ? "Administrador" : user.role === "MENTOR" ? "Mentor" : "Alumno";

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 py-4">
      {/* Lado Izquierdo: Menú Móvil + Título */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] tracking-tight transition-all">
            {isBlockedMentor ? "Perfil Incompleto" : getPageTitle(pathname)}
          </h2>
          {isBlockedMentor ? (
             <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5 animate-pulse">
                Acceso restringido: Sube tu foto
             </p>
          ) : (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 opacity-80 hidden sm:block">
              ARTICADEMY
            </p>
          )}
        </div>
      </div>

      {/* Lado Derecho: Acciones y Perfil */}
      <div className="flex items-center gap-6">
        {/* Buscador e Iconos */}
        <div className="flex items-center gap-2 pr-4 md:pr-6 border-r border-gray-100">
          <button className="hidden sm:block p-2.5 text-gray-500 hover:text-[#C9A84C] hover:bg-amber-50 rounded-full transition-all" title="Buscar">
            <Search size={20} />
          </button>
          <button className="relative p-2.5 text-gray-500 hover:text-[#C9A84C] hover:bg-amber-50 rounded-full transition-all" title="Notificaciones">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Tarjeta de Usuario (User Card) */}
        <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 md:pr-5 rounded-2xl border border-gray-100/50 hover:bg-gray-100/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-sm relative shrink-0">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Perfil"} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                {user.name ? user.name.substring(0, 2) : <UserIcon size={16} />}
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-black text-[#0B1F3A] leading-tight truncate max-w-[120px]">
              {user.name || "Usuario"}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              {user.email || roleLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
