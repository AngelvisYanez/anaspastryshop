"use client";

import Link from "next/link";
import { Menu, X, Instagram, ShoppingBag, User } from "lucide-react";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";

type SessionLike = {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
} | null;

export function NavbarActions({
  session,
  scrolled,
  cartCount,
  isCartOpen,
  isOpen,
  userMenuOpen,
  loginBtnClass,
  iconBtnClass,
  onToggleUserMenu,
  onCloseUserMenu,
  onOpenCart,
  onToggleMenu,
}: {
  session: SessionLike;
  scrolled: boolean;
  cartCount: number;
  isCartOpen: boolean;
  isOpen: boolean;
  userMenuOpen: boolean;
  loginBtnClass: string;
  iconBtnClass: string;
  onToggleUserMenu: () => void;
  onCloseUserMenu: () => void;
  onOpenCart: () => void;
  onToggleMenu: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 shrink-0 justify-self-end"
      suppressHydrationWarning
    >
      {session ? (
        <NavbarUserMenu
          open={userMenuOpen}
          onToggle={onToggleUserMenu}
          onClose={onCloseUserMenu}
          name={session.user?.name}
          email={session.user?.email}
          initial={session.user?.name?.[0]?.toUpperCase() || "A"}
          isAdmin={session.user?.role === "ADMIN"}
        />
      ) : (
        <div className="hidden xl:flex items-center gap-3">
          <Link
            href="/registro"
            className="inline-flex h-11 items-center justify-center bg-accent-solid hover:bg-accent-solid-hover active:bg-accent-solid-hover text-white px-5 rounded-xl text-xs font-bold transition-colors active:scale-[0.97] shadow-md shadow-accent-solid/25"
          >
            Registrarse
          </Link>
          <Link
            href="/iniciar-sesion"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors active:scale-[0.97] ${loginBtnClass}`}
            aria-label="Iniciar sesión"
            title="Iniciar sesión"
          >
            <User size={20} aria-hidden="true" />
          </Link>
        </div>
      )}

      {!scrolled && (
        <button
          onClick={onOpenCart}
          className="group hidden xl:inline-flex relative h-11 w-11 items-center justify-center rounded-xl border border-transparent bg-white text-foreground hover:bg-accent-solid hover:border-accent-solid hover:text-white active:bg-accent-solid-hover active:border-accent-solid-hover active:text-white transition-colors active:scale-[0.97] dark:bg-white dark:text-foreground dark:hover:bg-accent-solid dark:hover:border-accent-solid dark:hover:text-white dark:active:bg-accent-solid-hover dark:active:border-accent-solid-hover dark:active:text-white"
          aria-label="Ver bolsa de compras"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-accent-solid group-hover:bg-white group-hover:text-accent-solid group-active:bg-white group-active:text-accent-solid-hover text-white text-[10px] font-black flex items-center justify-center border-2 border-card shadow-md shadow-accent-solid/30 transition-colors">
              {cartCount}
            </span>
          )}
        </button>
      )}

      <div className="xl:hidden flex items-center gap-2">
        <a
          href="https://www.instagram.com/anaspastryshopve/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Ana's Pastry Shop (abre en otra pestaña)"
          className={`flex min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 items-center justify-center p-2 rounded-xl border transition-colors active:scale-[0.97] ${iconBtnClass}`}
        >
          <Instagram size={18} aria-hidden="true" />
        </a>
        <a
          href="https://wa.me/584121658015"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp (abre en otra pestaña)"
          className={`flex min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 items-center justify-center p-2 rounded-xl border transition-colors active:scale-[0.97] ${iconBtnClass}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.52 3.48A11.91 11.91 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.25-1.64a11.94 11.94 0 0 0 5.78 1.47h.01C18.62 23.83 24 18.48 24 11.9c0-3.18-1.24-6.17-3.48-8.42ZM12.04 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.87 9.87 0 0 1-1.51-5.26c0-5.47 4.45-9.92 9.93-9.92a9.85 9.85 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.91 7.02c0 5.47-4.46 9.86-9.99 9.86Zm5.44-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.47-1.77-1.64-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
          </svg>
        </a>
      </div>

      <button
        onClick={onToggleMenu}
        className={`xl:hidden flex min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 items-center justify-center p-2 rounded-xl border transition-colors active:scale-[0.97] ${iconBtnClass} ${
          isOpen
            ? "bg-accent-solid text-white border-accent-solid hover:bg-accent-solid-hover hover:text-white"
            : ""
        }`}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
    </div>
  );
}

export function NavbarFloatingCart({
  scrolled,
  cartCount,
  isCartOpen,
  onOpenCart,
}: {
  scrolled: boolean;
  cartCount: number;
  isCartOpen: boolean;
  onOpenCart: () => void;
}) {
  if (isCartOpen) return null;

  return (
    <button
      onClick={onOpenCart}
      aria-label="Abrir bolsa de compras"
      className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-40 xl:bottom-7 xl:right-7 ${
        scrolled ? "" : "xl:hidden"
      }`}
    >
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-accent-solid text-white shadow-xl shadow-accent-solid/40 border-2 border-white/20 hover:scale-105 transition-transform">
        <ShoppingBag size={22} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-white text-accent text-[11px] font-black flex items-center justify-center border-2 border-accent shadow-md">
            {cartCount}
          </span>
        )}
      </span>
    </button>
  );
}
