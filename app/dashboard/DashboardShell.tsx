"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import PendingPaymentDialog from "@/components/PendingPaymentDialog";

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
  hasPendingPayment = false,
}: {
  user: any;
  children: React.ReactNode;
  isBlockedMentor?: boolean;
  platformSections?: PlatformSection[];
  hasPendingPayment?: boolean;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {hasPendingPayment && <PendingPaymentDialog />}
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
        ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        transition-all duration-300 ease-in-out
        lg:relative lg:flex-shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          user={user}
          onMenuClick={() => setIsSidebarOpen(false)}
          isBlockedMentor={isBlockedMentor}
          platformSections={platformSections}
          isCollapsed={isCollapsed}
        />

        <button
          onClick={() => setIsCollapsed((c) => !c)}
          className="hidden lg:flex absolute right-0 top-8 translate-x-1/2 -translate-y-1/2 z-10 w-5 h-5 items-center justify-center bg-card border border-card-border rounded-full text-muted hover:text-foreground transition-colors shadow-sm"
          title={isCollapsed ? "Expandir" : "Colapsar"}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
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
