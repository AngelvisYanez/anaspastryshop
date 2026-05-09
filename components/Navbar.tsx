"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  Menu, X, User, ChevronRight, LogOut, LayoutDashboard, Bell,
  Mail, Home, CheckCircle2, AlertCircle, Info, Clock, Settings,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { getUserImage } from "@/lib/actions/user";
import { getSections } from "@/lib/actions/platformSections";
import Image from "next/image";
import logoDark from "@/public/logo-acu-white.png";
import logoLight from "@/public/logo-acu.png";

type NavLink = { name: string; href: string };
type Notification = {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const AUTH_ONLY_SLUGS = ["/mis-cursos", "/webinars"];
const PURCHASE_REQUIRED_SLUGS = ["/mis-cursos"];
const NAV_DESIRED_ORDER = ["/nosotros", "/membresia", "/cursos", "/webinars", "/lives", "/mis-cursos"];

const iconMap = {
  success: <CheckCircle2 size={14} className="text-green-500 shrink-0" />,
  warning: <AlertCircle size={14} className="text-amber-500 shrink-0" />,
  info: <Info size={14} className="text-accent shrink-0" />,
};

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

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMisCursos, setHasMisCursos] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
      fetch("/api/notifications/count")
        .then((r) => r.ok ? r.json() : { count: 0 })
        .then((d) => setUnreadCount(d.count ?? 0))
        .catch(() => {});
      fetch("/api/user/has-courses")
        .then((r) => r.ok ? r.json() : { hasCourses: false })
        .then((d) => setHasMisCursos(d.hasCourses ?? false))
        .catch(() => {});
    } else {
      setProfileImage(null);
      setHasMisCursos(false);
    }
  }, [session]);

  useEffect(() => {
    if (!notifOpen) return;
    setNotifLoading(true);
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : { notifications: [] })
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount((data.notifications ?? []).filter((n: Notification) => !n.read).length);
      })
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, [notifOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

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
          {[
            ...navLinks,
            ...(session && !navLinks.find(l => l.href === "/webinars") ? [{ name: "Webinars", href: "/webinars" }] : []),
          ].filter((l) => {
            if (!session && AUTH_ONLY_SLUGS.includes(l.href)) return false;
            if (PURCHASE_REQUIRED_SLUGS.includes(l.href) && !hasMisCursos) return false;
            return true;
          }).sort((a, b) => {
            const ai = NAV_DESIRED_ORDER.indexOf(a.href);
            const bi = NAV_DESIRED_ORDER.indexOf(b.href);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          }).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-sm font-semibold transition-colors relative group ${linkColor}`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 z-50" suppressHydrationWarning>
          {!loading && (
            <>
              {session ? (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setNotifOpen((v) => !v)}
                      className={`relative p-2 rounded-lg transition-colors ${iconColor}`}
                      aria-label="Notificaciones"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white/30">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notifOpen && (
                        <m.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-2rem))] bg-white border border-black/[0.08] rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] overflow-hidden z-50"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
                            <h3 className="text-sm font-black text-foreground">Notificaciones</h3>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && (
                                <button
                                  onClick={() => {
                                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                                    setUnreadCount(0);
                                  }}
                                  className="text-[10px] font-bold text-accent hover:underline"
                                >
                                  Marcar todo leído
                                </button>
                              )}
                              <button
                                onClick={() => setNotifOpen(false)}
                                className="p-1 text-foreground/40 hover:text-foreground transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {notifLoading ? (
                              <div className="flex flex-col gap-2 p-4">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="h-12 bg-black/[0.04] rounded-lg animate-pulse" />
                                ))}
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="flex flex-col items-center py-10 px-4 text-center">
                                <Bell size={28} className="text-foreground/20 mb-3" />
                                <p className="text-sm font-bold text-foreground/50">Sin notificaciones</p>
                                <p className="text-[11px] text-foreground/30 mt-1">Todo está en orden por ahora</p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  className={`flex items-start gap-3 px-4 py-3 border-b border-black/[0.05] last:border-0 hover:bg-black/[0.02] transition-colors ${!n.read ? "bg-accent/[0.04]" : ""}`}
                                >
                                  <div className="mt-0.5">{iconMap[n.type]}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                                    <p className="text-[11px] text-foreground/50 line-clamp-2">{n.description}</p>
                                    <p className="text-[10px] text-foreground/30 mt-0.5 flex items-center gap-1">
                                      <Clock size={9} /> {n.time}
                                    </p>
                                  </div>
                                  {!n.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className="w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent hover:border-accent transition-all relative shadow-sm"
                      aria-label="Perfil"
                    >
                      {profileImage ? (
                        <Image src={profileImage} alt={session.user.name || "Usuario"} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0B1F3A] to-[#1A3A5C] text-white flex items-center justify-center font-bold text-sm">
                          {session.user.name ? session.user.name.substring(0, 2).toUpperCase() : <User size={16} />}
                        </div>
                      )}
                    </button>
                    <AnimatePresence>
                      {profileOpen && (
                        <m.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-44 bg-white border border-black/[0.08] rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] overflow-hidden z-50"
                        >
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-foreground hover:bg-black/[0.04] transition-colors"
                          >
                            <Settings size={14} className="text-foreground/50 shrink-0" />
                            Editar Perfil
                          </Link>
                          <div className="h-px bg-black/[0.06] mx-2" />
                          <button
                            onClick={() => { signOut({ callbackUrl: "/" }); setProfileOpen(false); }}
                            className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut size={14} className="shrink-0" />
                            Cerrar Sesión
                          </button>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                {[
                  ...navLinks,
                  ...(session && !navLinks.find(l => l.href === "/webinars") ? [{ name: "Webinars", href: "/webinars" }] : []),
                ].filter((l) => {
                  if (!session && AUTH_ONLY_SLUGS.includes(l.href)) return false;
                  if (PURCHASE_REQUIRED_SLUGS.includes(l.href) && !hasMisCursos) return false;
                  return true;
                }).sort((a, b) => {
                  const ai = NAV_DESIRED_ORDER.indexOf(a.href);
                  const bi = NAV_DESIRED_ORDER.indexOf(b.href);
                  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                }).map((link) => (
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
