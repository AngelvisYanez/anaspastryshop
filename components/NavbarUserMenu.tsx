"use client";

import Link from "next/link";
import { User, BookOpen, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function NavbarUserMenu({
  open,
  onToggle,
  onClose,
  name,
  email,
  initial,
  isAdmin,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  name?: string | null;
  email?: string | null;
  initial: string;
  isAdmin: boolean;
}) {
  return (
    <div id="user-menu-container" className="relative hidden xl:block">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 rounded-full bg-accent/15 border border-accent/30 hover:bg-accent/25 transition text-white"
      >
        <div className="w-8 h-8 rounded-full bg-accent-solid flex items-center justify-center font-black text-xs text-white">
          {initial}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-card border border-card-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-card-border mb-1">
            <p className="text-xs font-bold text-foreground truncate">{name}</p>
            <p className="text-[11px] text-muted truncate">{email}</p>
          </div>

          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
          >
            <User size={14} className="text-accent" /> Panel de Usuario
          </Link>

          <Link
            href="/mis-cursos"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
          >
            <BookOpen size={14} className="text-accent" /> Mis Cursos
          </Link>

          {isAdmin && (
            <Link
              href="/dashboard/pagos"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
            >
              <Shield size={14} className="text-accent" /> Administrar Pagos
            </Link>
          )}

          <button
            onClick={() => {
              onClose();
              signOut();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors mt-1 border-t border-card-border pt-2"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
