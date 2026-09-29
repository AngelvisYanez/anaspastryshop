"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

type PlatformSection = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: string[];
};

const EMPTY_SECTIONS: PlatformSection[] = [];

export default function DashboardShell({
  user,
  children,
  platformSections = EMPTY_SECTIONS,
}: {
  user: any;
  children: React.ReactNode;
  platformSections?: PlatformSection[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        relative
        fixed inset-y-0 left-0 z-50 w-64
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        transition duration-300 ease-in-out
        lg:relative lg:flex-shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          user={user}
          onMenuClick={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
        />

        <button
          onClick={() => setIsCollapsed((c) => !c)}
          className="hidden lg:flex absolute right-0 top-8 translate-x-1/2 -translate-y-1/2 z-50 w-7 h-7 items-center justify-center bg-card border border-card-border rounded-full text-foreground ring-2 ring-background hover:bg-card-hover transition-colors shadow-md cursor-pointer"
          title={isCollapsed ? "Expandir" : "Colapsar"}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DashboardHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {user?.role === "USER" && (
          <div className="bg-gradient-to-r from-brand-purple via-brand-purple-mid to-brand-purple-deep text-white px-3 sm:px-5 md:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0 border-b border-pink-900/40">
            <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs font-medium text-pink-100 min-w-0">
              <span className="inline-flex items-center gap-1 bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded-full font-black text-[11px] uppercase tracking-wider border border-pink-500/30 w-fit shrink-0">
                <Tag size={10} /> Cupón
              </span>
              <span className="leading-snug">
                Código <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded tracking-wider">TODOSLOSCURSOS</strong> · 40% OFF en ambos cursos online.
              </span>
            </div>
            <Link href="/cursos" className="shrink-0 w-full sm:w-auto">
              <span className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1 transition w-full sm:w-auto min-h-9">
                Ver Catálogo <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto w-full overscroll-contain bg-background">
          <div className="w-full min-h-full p-4 sm:p-5 md:p-6 lg:p-8 pb-8 sm:pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
