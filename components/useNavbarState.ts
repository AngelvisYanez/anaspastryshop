"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/cart/CartContext";

interface SiteConfig {
  logoUrl?: string;
  logoDarkUrl?: string;
  siteName?: string;
  faviconUrl?: string;
}

export function useNavbarState() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasMisCursos, setHasMisCursos] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workshopsDropdownOpen, setWorkshopsDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [mobileWorkshopsOpen, setMobileWorkshopsOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({});
  const { data: session } = useSession();
  const { items: cartItems, openCart, isOpen: isCartOpen } = useCart();

  const workshopsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coursesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- the navbar is shared across every route (including cached/partial ones), so site config is fetched client-side on mount rather than per-page
  useEffect(() => {
    fetch("/api/settings/site-config")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP error"))))
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

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- the "Mis cursos" link depends on the client session, which is only known after hydration
  useEffect(() => {
    if (!session?.user?.id) {
      setHasMisCursos(false);
      return;
    }
    fetch("/api/user/has-courses")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP error"))))
      .then((d) => setHasMisCursos(!!d.hasCourses))
      .catch(() => setHasMisCursos(false));
  }, [session?.user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#user-menu-container")) setUserMenuOpen(false);
      if (!target.closest("#workshops-dropdown-container")) setWorkshopsDropdownOpen(false);
      if (!target.closest("#courses-dropdown-container")) setCoursesDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleWorkshopsEnter = () => {
    if (workshopsTimeoutRef.current) clearTimeout(workshopsTimeoutRef.current);
    if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
    setCoursesDropdownOpen(false);
    setWorkshopsDropdownOpen(true);
  };

  const handleWorkshopsLeave = () => {
    workshopsTimeoutRef.current = setTimeout(() => setWorkshopsDropdownOpen(false), 180);
  };

  const handleCoursesEnter = () => {
    if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
    if (workshopsTimeoutRef.current) clearTimeout(workshopsTimeoutRef.current);
    setWorkshopsDropdownOpen(false);
    setCoursesDropdownOpen(true);
  };

  const handleCoursesLeave = () => {
    coursesTimeoutRef.current = setTimeout(() => setCoursesDropdownOpen(false), 180);
  };

  return {
    isOpen,
    setIsOpen,
    scrolled,
    hasMisCursos,
    userMenuOpen,
    setUserMenuOpen,
    workshopsDropdownOpen,
    setWorkshopsDropdownOpen,
    coursesDropdownOpen,
    setCoursesDropdownOpen,
    mobileWorkshopsOpen,
    setMobileWorkshopsOpen,
    mobileCoursesOpen,
    setMobileCoursesOpen,
    siteConfig,
    session,
    cartCount: cartItems.length,
    openCart,
    isCartOpen,
    handleWorkshopsEnter,
    handleWorkshopsLeave,
    handleCoursesEnter,
    handleCoursesLeave,
  };
}
