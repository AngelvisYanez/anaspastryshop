"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardShell({ 
  user, 
  children,
  isBlockedMentor = false
}: { 
  user: any; 
  children: React.ReactNode;
  isBlockedMentor?: boolean;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Móvil Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Contenedor Fijo en Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex-shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(false)} 
          isBlockedMentor={isBlockedMentor}
        />
      </div>

      {/* Contenido Principal con su propio Scroll */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          isBlockedMentor={isBlockedMentor}
        />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
