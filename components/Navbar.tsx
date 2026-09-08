"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, Sparkles, User, LogIn, ChevronRight, ChevronDown,
  Shield, LogOut, BookOpen, Clock, HeartHandshake, MapPin,
  GraduationCap, PlayCircle, Video, ShoppingBag,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { WORKSHOPS_DATA } from "@/lib/data/workshops";
import { ONLINE_COURSES_DATA } from "@/lib/data/online-courses";
import { useCart } from "@/components/cart/CartContext";

interface SiteConfig {
  logoUrl?: string;
  logoDarkUrl?: string;
  siteName?: string;
  faviconUrl?: string;
}

export default function Navbar({ forceSolid = false }: { forceSolid?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasMisCursos, setHasMisCursos] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workshopsDropdownOpen, setWorkshopsDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [mobileWorkshopsOpen, setMobileWorkshopsOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({});
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items: cartItems, openCart } = useCart();
  const cartCount = cartItems.length;

  const workshopsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coursesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDarkHero =
    !forceSolid &&
    (pathname === "/" ||
      pathname === "/cursos" ||
      pathname.startsWith("/cursos/") ||
      pathname === "/workshops" ||
      pathname.startsWith("/workshops/") ||
      pathname.startsWith("/workshop/") ||
      pathname === "/nosotros" ||
      pathname === "/pasteleria" ||
      pathname.startsWith("/clases/"));

  useEffect(() => {
    fetch("/api/settings/site-config")
      .then((r) => r.json())
      .then((d) => setSiteConfig(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/has-courses")
        .then((r) => r.json())
        .then((d) => setHasMisCursos(!!d.hasCourses))
        .catch(() => setHasMisCursos(false));
    } else {
      setHasMisCursos(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#user-menu-container")) {
        setUserMenuOpen(false);
      }
      if (!target.closest("#workshops-dropdown-container")) {
        setWorkshopsDropdownOpen(false);
      }
      if (!target.closest("#courses-dropdown-container")) {
        setCoursesDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Workshop dropdown hover handlers
  const handleWorkshopsEnter = () => {
    if (workshopsTimeoutRef.current) clearTimeout(workshopsTimeoutRef.current);
    if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
    setCoursesDropdownOpen(false);
    setWorkshopsDropdownOpen(true);
  };

  const handleWorkshopsLeave = () => {
    workshopsTimeoutRef.current = setTimeout(() => {
      setWorkshopsDropdownOpen(false);
    }, 180);
  };

  // Courses dropdown hover handlers
  const handleCoursesEnter = () => {
    if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
    if (workshopsTimeoutRef.current) clearTimeout(workshopsTimeoutRef.current);
    setWorkshopsDropdownOpen(false);
    setCoursesDropdownOpen(true);
  };

  const handleCoursesLeave = () => {
    coursesTimeoutRef.current = setTimeout(() => {
      setCoursesDropdownOpen(false);
    }, 180);
  };

  const logoSrc = isDarkHero
    ? siteConfig.logoDarkUrl || "/logo-anas-pastry-shop-white.png"
    : siteConfig.logoUrl || "/logo-anas-pastry-shop.png";

  const navBg = forceSolid
    ? "bg-background/95 backdrop-blur-xl border-b border-card-border shadow-sm"
    : scrolled
    ? isDarkHero
      ? "bg-[#1C0425]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-950/40"
      : "bg-background/90 backdrop-blur-xl border-b border-card-border shadow-sm"
    : "bg-transparent border-b border-transparent";

  const linkColor = isDarkHero
    ? "text-white/80 hover:text-white"
    : "text-foreground/75 hover:text-foreground";

  const isWorkshopsActive =
    pathname === "/workshops" ||
    pathname.startsWith("/workshops/") ||
    pathname.startsWith("/workshop/");

  const isCursosActive =
    (pathname === "/cursos" || pathname.startsWith("/cursos/")) && !isWorkshopsActive;

  return (
    <>
<header className={`fixed z-50 transition-all duration-300 ${navBg} ${
      scrolled ? "top-2 inset-x-2 md:top-3 md:inset-x-6 rounded-2xl" : "top-0 left-0 right-0"
    }`}>
  <div className={`max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 grid grid-cols-[auto_1fr_auto] items-center relative transition-all duration-300 ${scrolled ? "h-20" : "h-32"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0 justify-self-start">
          <div className="relative h-32 w-80 sm:w-96 xl:w-80 2xl:w-96">
            <Image
              src={logoSrc}
              alt="Ana's Pastry Shop"
              fill
              priority
              className="object-contain object-left transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          <Link
            href="/"
            className={`font-display text-sm font-semibold transition-colors relative group ${linkColor} ${
              pathname === "/" ? "text-accent font-bold" : ""
            }`}
          >
            Inicio
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Workshops Presenciales Dropdown */}
          <div
            id="workshops-dropdown-container"
            className="relative"
            onMouseEnter={handleWorkshopsEnter}
            onMouseLeave={handleWorkshopsLeave}
          >
            <Link
              href="/workshops"
              className={`font-display text-sm font-semibold transition-colors relative group flex items-center gap-1.5 ${linkColor} ${
                isWorkshopsActive ? "text-accent font-bold" : ""
              }`}
            >
              Workshops Presenciales
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  workshopsDropdownOpen ? "rotate-180 text-accent" : "opacity-70"
                }`}
              />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* Workshops Dropdown Menu */}
            {workshopsDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-card border border-card-border rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-3 py-2 border-b border-card-border mb-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                      <Sparkles size={13} /> Workshops Presenciales
                    </p>
                    <p className="text-[11px] text-muted">Caracas, Las Mercedes · Práctica 100% en vivo</p>
                  </div>
                  <Link
                    href="/workshops"
                    onClick={() => setWorkshopsDropdownOpen(false)}
                    className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    Ver Cartelera &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {WORKSHOPS_DATA.map((w) => (
                    <Link
                      key={w.slug}
                      href={`/workshop/${w.slug}`}
                      onClick={() => setWorkshopsDropdownOpen(false)}
                      className="p-2.5 rounded-2xl hover:bg-card-hover transition-colors group flex flex-col justify-between border border-transparent hover:border-accent/20"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/20 px-2 py-0.5 rounded-md">
                            {w.spots} Cupos
                          </span>
                          <span className="text-[11px] font-black text-foreground font-mono">
                            ${w.price} USD
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                          {w.shortTitle}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted mt-1 truncate">
                        {w.schedule.split("(")[0].trim()} · {w.startTime}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-[11px] text-muted px-2">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-accent" /> Reserva con el 50%
                  </span>
                  <Link
                    href="/workshops"
                    onClick={() => setWorkshopsDropdownOpen(false)}
                    className="font-bold text-foreground hover:text-accent"
                  >
                    Ver los 8 Talleres Completos
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cursos Online Dropdown */}
          <div
            id="courses-dropdown-container"
            className="relative"
            onMouseEnter={handleCoursesEnter}
            onMouseLeave={handleCoursesLeave}
          >
            <Link
              href="/cursos"
              className={`font-display text-sm font-semibold transition-colors relative group flex items-center gap-1.5 ${linkColor} ${
                isCursosActive ? "text-accent font-bold" : ""
              }`}
            >
              Cursos Online
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  coursesDropdownOpen ? "rotate-180 text-accent" : "opacity-70"
                }`}
              />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* Courses Dropdown Menu */}
            {coursesDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[460px] bg-card border border-card-border rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-3 py-2 border-b border-card-border mb-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                      <GraduationCap size={14} /> Cursos Online
                    </p>
                    <p className="text-[11px] text-muted">Aprende a tu propio ritmo · Clases en video HD</p>
                  </div>
                  <Link
                    href="/cursos"
                    onClick={() => setCoursesDropdownOpen(false)}
                    className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    Ver Todos &rarr;
                  </Link>
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {ONLINE_COURSES_DATA.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cursos/${c.id}`}
                      onClick={() => setCoursesDropdownOpen(false)}
                      className="p-3 rounded-2xl hover:bg-card-hover transition-colors group flex items-center justify-between border border-transparent hover:border-accent/20"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          {c.badge && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/20 px-2 py-0.5 rounded-md">
                              {c.badge}
                            </span>
                          )}
                          <span className="text-[11px] text-muted font-medium">
                            {c.totalClasses} clases · {c.totalHours} hrs
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                          {c.shortTitle}
                        </p>
                        <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                          {c.subtitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-foreground font-mono block">
                          ${c.price} USD
                        </span>
                        <span className="text-[9px] font-bold text-accent">
                          Ver Curso &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* Promo coupon link in dropdown */}
                  <Link
                    href="/cursos"
                    onClick={() => setCoursesDropdownOpen(false)}
                    className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/5 border border-pink-500/20 flex items-center justify-between group hover:border-pink-500/40 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                        <Sparkles size={13} className="text-accent" /> Promoción Cupón Especial
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Aplica el cupón <strong className="text-accent">TODOSLOSCURSOS</strong> al inscribirte
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-accent group-hover:underline">
                      Explorar &rarr;
                    </span>
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-[11px] text-muted px-2">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} className="text-accent" /> Acceso Inmediato 24/7
                  </span>
                  <Link
                    href="/cursos"
                    onClick={() => setCoursesDropdownOpen(false)}
                    className="font-bold text-foreground hover:text-accent"
                  >
                    Ver Todos los Cursos Online
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Pastelería & Tortas */}
          <Link
            href="/pasteleria"
            className={`font-display text-sm font-semibold transition-colors relative group ${linkColor} ${
              pathname === "/pasteleria" ? "text-accent font-bold" : ""
            }`}
          >
            Pastelería & Tortas
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Sobre Anais */}
          <Link
            href="/nosotros"
            className={`font-display text-sm font-semibold transition-colors relative group ${linkColor} ${
              pathname === "/nosotros" ? "text-accent font-bold" : ""
            }`}
          >
            Sobre Anais
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Mis Cursos (Auth only) */}
          {session && hasMisCursos && (
            <Link
              href="/mis-cursos"
              className={`font-display text-sm font-semibold transition-colors relative group ${linkColor} ${
                pathname === "/mis-cursos" ? "text-accent font-bold" : ""
              }`}
            >
              Mis Cursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          )}

          {session && (
            <Link
              href="/dashboard"
              className={`font-display text-sm font-semibold transition-colors relative group ${linkColor} ${
                pathname === "/dashboard" ? "text-accent font-bold" : ""
              }`}
            >
              Mi Panel
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          )}
        </nav>

        {/* Right CTA & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-self-end" suppressHydrationWarning>
          {session ? (
            <div id="user-menu-container" className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full bg-accent/15 border border-accent/30 hover:bg-accent/25 transition-all text-white"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-black text-xs text-white">
                  {session.user?.name?.[0]?.toUpperCase() || "A"}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-card border border-card-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-card-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{session.user?.name}</p>
                    <p className="text-[11px] text-muted truncate">{session.user?.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
                  >
                    <User size={14} className="text-accent" /> Panel de Usuario
                  </Link>

                  <Link
                    href="/mis-cursos"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
                  >
                    <BookOpen size={14} className="text-accent" /> Mis Cursos
                  </Link>

                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/dashboard/pagos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
                    >
                      <Shield size={14} className="text-accent" /> Administrar Pagos
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors mt-1 border-t border-card-border pt-2"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/iniciar-sesion">
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isDarkHero
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-foreground hover:bg-muted/20"
                  }`}
                >
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/registro">
                <button className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/25">
                  Registrarse
                </button>
              </Link>
            </div>
          )}

          {/* Bag / Cart button (se oculta del header al scrollear) */}
          {!scrolled && (
            <button
              onClick={openCart}
              className={`relative p-2.5 rounded-xl border transition-all ${
                isDarkHero
                  ? "text-white border-white/20 hover:bg-white/10"
                  : "text-foreground border-card-border hover:bg-card-hover"
              }`}
              aria-label="Ver bolsa de compras"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center border-2 border-card shadow-md shadow-pink-600/30">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`xl:hidden p-2 rounded-xl border transition-all ${
              isDarkHero
                ? "text-white border-white/20 hover:bg-white/10"
                : "text-foreground border-card-border hover:bg-card-hover"
            }`}
            aria-label="Abrir menú"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-card/95 backdrop-blur-xl border-b border-card-border px-6 py-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
            >
              <span>Inicio</span>
              <ChevronRight size={16} className="text-muted" />
            </Link>

            {/* Mobile Workshops Presenciales Accordion */}
            <div className="rounded-xl border border-card-border/70 overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-section-alt">
                <Link
                  href="/workshops"
                  onClick={() => setIsOpen(false)}
                  className="font-black text-sm text-pink-600 dark:text-pink-400 flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Workshops Presenciales
                </Link>
                <button
                  onClick={() => setMobileWorkshopsOpen(!mobileWorkshopsOpen)}
                  className="p-1 text-muted hover:text-foreground"
                  aria-label="Desplegar workshops"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileWorkshopsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {mobileWorkshopsOpen && (
                <div className="p-2 space-y-1 bg-card border-t border-card-border/60">
                  <Link
                    href="/workshops"
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded-lg text-xs font-bold text-accent hover:bg-card-hover"
                  >
                    &rarr; Ver Cartelera Completa de Workshops
                  </Link>
                  {WORKSHOPS_DATA.map((w) => (
                    <Link
                      key={w.slug}
                      href={`/workshop/${w.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-xs text-foreground hover:bg-card-hover"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[9px] font-black text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">
                          {w.spots}p
                        </span>
                        <span className="truncate">{w.shortTitle}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-accent shrink-0 ml-2">
                        ${w.price}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Cursos Online Accordion */}
            <div className="rounded-xl border border-card-border/70 overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-section-alt">
                <Link
                  href="/cursos"
                  onClick={() => setIsOpen(false)}
                  className="font-black text-sm text-foreground flex items-center gap-1.5"
                >
                  <GraduationCap size={14} className="text-accent" /> Cursos Online
                </Link>
                <button
                  onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                  className="p-1 text-muted hover:text-foreground"
                  aria-label="Desplegar cursos online"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileCoursesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {mobileCoursesOpen && (
                <div className="p-2 space-y-1 bg-card border-t border-card-border/60">
                  <Link
                    href="/cursos"
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded-lg text-xs font-bold text-accent hover:bg-card-hover"
                  >
                    &rarr; Ver Catálogo Completo de Cursos Online
                  </Link>
                  {ONLINE_COURSES_DATA.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cursos/${c.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-xs text-foreground hover:bg-card-hover"
                    >
                      <div className="truncate">
                        <span className="block truncate font-semibold">{c.shortTitle}</span>
                        <span className="text-[11px] text-muted">{c.totalClasses} clases · {c.totalHours}h</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-accent shrink-0 ml-2">
                        ${c.price}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pastelería & Tortas */}
            <Link
              href="/pasteleria"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
            >
              <span>Pastelería & Tortas</span>
              <ChevronRight size={16} className="text-muted" />
            </Link>

            {/* Sobre Anais */}
            <Link
              href="/nosotros"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
            >
              <span>Sobre Anais</span>
              <ChevronRight size={16} className="text-muted" />
            </Link>

            {session && hasMisCursos && (
              <Link
                href="/mis-cursos"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
              >
                <span>Mis Cursos</span>
                <ChevronRight size={16} className="text-muted" />
              </Link>
            )}

            {session && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
              >
                <span>Mi Panel</span>
                <ChevronRight size={16} className="text-muted" />
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-card-border space-y-3">
            {session ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            ) : (
              <>
                <Link href="/iniciar-sesion" onClick={() => setIsOpen(false)} className="block">
                  <button className="w-full bg-card border border-card-border text-foreground py-3 rounded-xl font-bold text-xs hover:bg-card-hover transition-colors">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/registro" onClick={() => setIsOpen(false)} className="block">
                  <button className="w-full bg-accent text-white py-3 rounded-xl font-bold text-xs hover:bg-accent-hover transition-colors shadow-md shadow-pink-600/30">
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Bolsa flotante al scrollear */}
    {scrolled && (
      <button
        onClick={openCart}
        aria-label="Abrir bolsa de compras"
        className="fixed bottom-5 right-5 z-50 lg:bottom-7 lg:right-7"
      >
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white shadow-xl shadow-pink-600/40 border-2 border-white/20 hover:scale-105 transition-transform">
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-white text-accent text-[11px] font-black flex items-center justify-center border-2 border-accent shadow-md">
              {cartCount}
            </span>
          )}
        </span>
      </button>
    )}
    </>
  );
}
