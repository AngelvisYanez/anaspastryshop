"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Menu, X, User, ChevronRight, LogOut, LayoutDashboard, Bell, Sun, Moon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { getUserImage } from "@/lib/actions/user";
import { getSections } from "@/lib/actions/platformSections";
import Image from "next/image";
import logo from "@/public/logo_II.webp";

type NavLink = { name: string; href: string };

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const loading = status === "loading";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    getSections().then((sections) => {
      const links = sections
        .filter((s) => s.isActive && s.roles.includes("USER"))
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ name: s.name, href: `/${s.slug}` }));
      setNavLinks(links);
    });
  }, []);

  useEffect(() => {
    if (session?.user) {
      const fetchImage = async () => {
        const cached = localStorage.getItem(`user-img-${session.user.id}`);
        if (cached) { setProfileImage(cached); return; }
        const img = await getUserImage();
        if (img) {
          setProfileImage(img);
          localStorage.setItem(`user-img-${session.user.id}`, img);
        }
      };
      fetchImage();
    } else {
      setProfileImage(null);
    }
  }, [session]);

  return (
    <m.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-[100] px-4 md:px-6 py-4"
    >
      <div className="max-w-7xl mx-auto bg-card/70 backdrop-blur-xl border border-card-border rounded-full px-6 md:px-8 py-3 flex justify-between items-center shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative">
        <Link href="/" className="flex items-center gap-2 group z-50">
          <Image
            src={logo}
            alt="ARTICADEMY"
            className="h-8 w-auto object-contain brightness-0 dark:brightness-0 dark:invert transition-all group-hover:scale-110"
          />
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-muted hover:text-accent transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {session && (
            <Link href="/webinars" className="text-sm font-bold text-muted hover:text-accent transition-colors relative group">
              Webinars
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 z-50" suppressHydrationWarning>
          {!loading && (
            <>
              {session ? (
                <div className="hidden sm:flex items-center gap-4">
                  <button className="relative p-2 text-muted hover:text-accent hover:bg-amber-50 rounded-full transition-colors" title="Notificaciones">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  </button>
                  <Link href="/dashboard" className="w-10 h-10 rounded-[14px] overflow-hidden border-2 border-transparent hover:border-accent transition-all relative shadow-sm">
                    {profileImage ? (
                      <Image src={profileImage} alt={session.user.name || "Usuario"} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B1F3A] to-[#1A3A5C] text-white flex items-center justify-center font-bold text-sm">
                        {session.user.name ? session.user.name.substring(0, 2).toUpperCase() : <User size={16} />}
                      </div>
                    )}
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/auth/signup" className="hidden sm:flex items-center gap-2 bg-accent text-white px-7 py-2.5 rounded-full text-xs font-bold hover:bg-accent/80 hover:scale-105 transition-all shadow-lg shadow-accent/30">
                    <User size={14} /> Únete ahora
                  </Link>
                </>
              )}
            </>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 text-muted hover:text-accent hover:bg-accent-subtle rounded-full transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 text-muted hover:bg-card-hover rounded-full transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+12px)] left-0 right-0 bg-card rounded-[2.5rem] p-8 shadow-2xl border border-card-border md:hidden flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-card-hover text-xl font-bold text-foreground group transition-colors"
                  >
                    {link.name}
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-accent transition-colors" />
                  </Link>
                ))}
                {session && (
                  <Link href="/webinars" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-card-hover text-xl font-bold text-foreground group transition-colors">
                    Webinars
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-accent transition-colors" />
                  </Link>
                )}
              </div>

              <div className="h-px bg-gray-100 my-2" />

              {!session ? (
                <>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="w-full bg-navy text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 text-base shadow-xl shadow-accent/10">
                    <User size={18} /> Empezar Registro
                  </Link>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-center py-2">
                    <span className="text-sm font-bold text-gray-400">¿Ya tienes cuenta? </span>
                    <span className="text-sm font-bold text-accent">Inicia Sesión</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-navy text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 text-base shadow-xl shadow-accent/10">
                      <LayoutDashboard size={18} /> Ir al Panel
                    </button>
                  </Link>
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.nav>
  );
}
