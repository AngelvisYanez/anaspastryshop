"use client";
import { useState } from "react";
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
  isBlockedMentor = false,
  platformSections = EMPTY_SECTIONS,
}: {
  user: any;
  children: React.ReactNode;
  isBlockedMentor?: boolean;
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
        fixed inset-y-0 left-0 z-50 w-64
        ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        transition-all duration-300 ease-in-out
        lg:static lg:flex-shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          user={user}
          onMenuClick={() => setIsSidebarOpen(false)}
          isBlockedMentor={isBlockedMentor}
          platformSections={platformSections}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((c) => !c)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DashboardHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          isBlockedMentor={isBlockedMentor}
        />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
