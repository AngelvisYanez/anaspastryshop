"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Tag,
  Activity,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MENTOR", "USER"],
  },
  {
    name: "Mis Cursos",
    href: "/dashboard/mis-cursos",
    icon: BookOpen,
    roles: ["USER"],
  },
  {
    name: "Gestionar Talleres",
    href: "/dashboard/talleres",
    icon: Calendar,
    roles: ["ADMIN", "MENTOR"],
  },
  {
    name: "Gestionar Cursos",
    href: "/dashboard/cursos",
    icon: BookOpen,
    roles: ["ADMIN", "MENTOR"],
  },
  {
    name: "Validar Pagos",
    href: "/dashboard/pagos",
    icon: CreditCard,
    roles: ["ADMIN"],
  },
  {
    name: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    roles: ["ADMIN", "MENTOR"],
  },
  {
    name: "Categorías",
    href: "/dashboard/categorias",
    icon: Tag,
    roles: ["ADMIN"],
  },
  {
    name: "Auditoría",
    href: "/dashboard/logs",
    icon: Activity,
    roles: ["ADMIN"],
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN", "MENTOR", "USER"],
  },
];

export default function Sidebar({ 
  user, 
  onMenuClick,
  isBlockedMentor = false
}: { 
  user: any; 
  onMenuClick?: () => void;
  isBlockedMentor?: boolean;
}) {
  const userRole = user.role;
  const pathname = usePathname();

  // Si el mentor está bloqueado, solo puede ver Configuración
  const filteredItems = isBlockedMentor 
    ? MENU_ITEMS.filter(item => item.name === "Configuración")
    : MENU_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white h-full border-r border-gray-100 p-6 flex flex-col relative">
      <div className="mb-10 px-2 flex justify-between items-center">
        <Link href="/dashboard" className="relative w-36 h-12">
          <Image 
            src="/logo_II.webp" 
            alt="ARTICADEMY" 
            fill 
            className="object-contain object-left"
            priority
          />
        </Link>
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {filteredItems.map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMenuClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                pathname === item.href
                  ? "bg-[#5A4FCF] text-white shadow-lg shadow-indigo-100"
                  : "text-gray-400 hover:bg-gray-50 hover:text-[#1A1A2E]"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ),
        )}
      </nav>

      <button 
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all w-full"
      >
        <LogOut size={20} /> Cerrar Sesión
      </button>
    </aside>
  );
}
