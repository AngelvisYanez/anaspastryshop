"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Menu, X, User, ChevronRight, LogOut, LayoutDashboard, Bell, Mail, Home } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { getUserImage } from "@/lib/actions/user";
import { getSections } from "@/lib/actions/platformSections";
import Image from "next/image";
import logoDark from "@/public/logo-acu-white.png";
import logoLight from "@/public/logo-acu.png";

type NavLink = { name: string; href: string };

const AUTH_ONLY_SLUGS = ["/mis-cursos"];

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [ctaText, setCtaText] = useState("Únete ahora");
  const [ctaUrl, setCtaUrl] = useState("/membresia");
  const { setTheme } = useTheme();
  const loading = status === "loading";

  useEffect(() => { setTheme("light"); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getSections().then((sections) => {
      const links = sections
        .filter((s) => s.isActive && s.roles.includes("USER"))
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ name: s.name, href: `/${s.slug}` }));
      setNavLinks(links);
    });
    fetch("/api/settings/site-config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.ctaText) setCtaText(cfg.ctaText);
        if (cfg.ctaUrl) setCtaUrl(cfg.ctaUrl);
        if (cfg.navItems?.length) {
          setNavLinks((prev) => [
            ...prev,
            ...(cfg.navItems as NavLink[]).map((i: any) => ({ name: i.label, href: i.href })),
          ]);
        }
      })
      .catch(() => {});
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

  const isTransparent = !scrolled;

  const containerBg = isTransparent
    ? "bg-transparent border-transparent shadow-none"
    : "bg-white border-black/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]";

  const linkColor = isTransparent
    ? "text-white/80 hover:text-white"
    : "text-foreground/65 hover:text-foreground";

  const iconColor = isTransparent
    ? "text-white/70 hover:text-white hover:bg-white/[0.1]"
    : "text-foreground/50 hover:text-foreground hover:bg-black/[0.06]";

  const currentLogo = isTransparent ? logoDark : logoLight;

  return (
    <m.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-[100] px-2 md:px-2 py-2"
    >
      <div className={`max-w-7xl mx-auto backdrop-blur-xl border rounded-2xl px-3 md:px-5 py-2.5 flex justify-between items-center relative transition-all duration-300 ${containerBg}`}>
        <Link href="/" className="flex items-center gap-2 group z-50">
          <Image
            src={currentLogo}
            alt="Academia Credito USA"
            className="h-11 w-auto object-contain transition-all group-hover:scale-105"
          />
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="/"
            className={`transition-colors rounded-lg p-1.5 ${iconColor}`}
            aria-label="Inicio"
          >
            <Home size={18} />
          </Link>
          {navLinks.filter((l) => session || !AUTH_ONLY_SLUGS.includes(l.href)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-sm font-semibold transition-colors relative group ${linkColor}`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {session && (
            <Link href="/webinars" className={`font-display text-sm font-semibold transition-colors relative group ${linkColor}`}>
              Webinars
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 z-50" suppressHydrationWarning>
          {!loading && (
            <>
              {session ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button className={`relative p-2 rounded-lg transition-colors ${iconColor}`} aria-label="Notificaciones">
                    <Bell size={20} aria-hidden="true" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white/20" aria-hidden="true" />
                  </button>
                  <Link href="/dashboard" className="w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent hover:border-accent transition-all relative shadow-sm">
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
                <Link href={ctaUrl} className="hidden sm:flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-hover hover:scale-105 transition-all shadow-lg shadow-accent/25">
                  <User size={14} /> {ctaText}
                </Link>
              )}
            </>
          )}

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex p-2.5 rounded-lg transition-colors ${iconColor}`}
            aria-label="Instagram"
          >
            <InstagramIcon size={18} />
          </a>

          <a
            href="mailto:contacto@academiacreditousa.com"
            className={`hidden sm:flex p-2.5 rounded-lg transition-colors ${iconColor}`}
            aria-label="Correo"
          >
            <Mail size={18} />
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2.5 rounded-lg transition-colors ${iconColor}`}
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
              className="absolute top-[calc(100%+12px)] left-0 right-0 bg-card rounded-2xl p-8 shadow-2xl border border-card-border md:hidden flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-card-hover text-xl font-bold text-foreground group transition-colors"
                >
                  Inicio
                  <Home size={20} className="text-muted group-hover:text-accent transition-colors" />
                </Link>
                {navLinks.filter((l) => session || !AUTH_ONLY_SLUGS.includes(l.href)).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-card-hover text-xl font-bold text-foreground group transition-colors"
                  >
                    {link.name}
                    <ChevronRight size={20} className="text-muted group-hover:text-accent transition-colors" />
                  </Link>
                ))}
                {session && (
                  <Link href="/webinars" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-card-hover text-xl font-bold text-foreground group transition-colors">
                    Webinars
                    <ChevronRight size={20} className="text-muted group-hover:text-accent transition-colors" />
                  </Link>
                )}
              </div>

              <div className="h-px bg-card-border my-2" />

              {!session ? (
                <>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="w-full bg-foreground text-background py-5 rounded-xl font-bold flex items-center justify-center gap-2 text-base shadow-xl shadow-accent/10">
                    <User size={18} /> Empezar Registro
                  </Link>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-center py-2">
                    <span className="text-sm font-bold text-muted">¿Ya tienes cuenta? </span>
                    <span className="text-sm font-bold text-accent">Inicia Sesión</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-foreground text-background py-5 rounded-xl font-bold flex items-center justify-center gap-2 text-base shadow-xl shadow-accent/10">
                      <LayoutDashboard size={18} /> Ir al Panel
                    </button>
                  </Link>
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="w-full bg-red-50 dark:bg-red-950/30 text-red-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
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
