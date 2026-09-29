"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavbarMobileDrawer } from "@/components/NavbarMobileDrawer";
import { NavbarDesktopNav } from "@/components/NavbarDesktopNav";
import { NavbarActions, NavbarFloatingCart } from "@/components/NavbarActions";
import { useNavbarState } from "@/components/useNavbarState";
import { getNavbarTheme } from "@/components/getNavbarTheme";

export default function Navbar({ forceSolid = false }: { forceSolid?: boolean } = {}) {
  const pathname = usePathname();
  const nav = useNavbarState();
  const theme = getNavbarTheme({
    forceSolid,
    scrolled: nav.scrolled,
    pathname,
    logoUrl: nav.siteConfig.logoUrl,
    logoDarkUrl: nav.siteConfig.logoDarkUrl,
  });

  return (
    <>
      <header
        className={`fixed z-50 transition duration-300 ${theme.navBg} ${
          theme.isSolid
            ? "top-2 inset-x-2 md:top-3 md:inset-x-6 rounded-2xl xl:inset-x-0 xl:mx-auto xl:w-full xl:max-w-7xl 2xl:max-w-[1440px]"
            : "top-0 left-0 right-0 pt-[env(safe-area-inset-top)]"
        }`}
      >
        <div
          className={`page-container grid grid-cols-[auto_1fr] items-center relative transition duration-300 ${
            nav.scrolled ? "h-16 sm:h-20" : "h-16 sm:h-20 xl:h-28"
          }`}
        >
          <Link href="/" className="flex items-center gap-3 group shrink-0 justify-self-start">
            <div
              className={`relative aspect-[594/368] transition duration-300 w-auto ${
                nav.scrolled
                  ? "h-8 sm:h-10 xl:h-16"
                  : "h-9 sm:h-11 xl:h-24"
              }`}
            >
              <Image
                src={theme.logoSrcMobile}
                alt="Ana's Pastry Shop"
                fill
                priority
                sizes="80px"
                className="object-contain object-left transition-transform duration-300 group-hover:scale-105 md:hidden"
              />
              <Image
                src={theme.logoSrcTablet}
                alt="Ana's Pastry Shop"
                fill
                priority
                sizes="120px"
                className="object-contain object-left transition-transform duration-300 group-hover:scale-105 hidden md:block xl:hidden"
              />
              <Image
                src={theme.logoSrc}
                alt="Ana's Pastry Shop"
                fill
                priority
                sizes="160px"
                className="object-contain object-left transition-transform duration-300 group-hover:scale-105 hidden xl:block"
              />
            </div>
          </Link>

          <NavbarDesktopNav
            pathname={pathname}
            linkColor={theme.linkColor}
            workshopsOpen={nav.workshopsDropdownOpen}
            coursesOpen={nav.coursesDropdownOpen}
            onWorkshopsEnter={nav.handleWorkshopsEnter}
            onWorkshopsLeave={nav.handleWorkshopsLeave}
            onCoursesEnter={nav.handleCoursesEnter}
            onCoursesLeave={nav.handleCoursesLeave}
            onCloseWorkshops={() => nav.setWorkshopsDropdownOpen(false)}
            onCloseCourses={() => nav.setCoursesDropdownOpen(false)}
            hasSession={!!nav.session}
            hasMisCursos={nav.hasMisCursos}
          />

          <NavbarActions
            session={nav.session}
            scrolled={nav.scrolled}
            cartCount={nav.cartCount}
            isCartOpen={nav.isCartOpen}
            isOpen={nav.isOpen}
            userMenuOpen={nav.userMenuOpen}
            loginBtnClass={theme.loginBtnClass}
            iconBtnClass={theme.iconBtnClass}
            onToggleUserMenu={() => nav.setUserMenuOpen(!nav.userMenuOpen)}
            onCloseUserMenu={() => nav.setUserMenuOpen(false)}
            onOpenCart={nav.openCart}
            onToggleMenu={() => nav.setIsOpen(!nav.isOpen)}
          />
        </div>

        {nav.isOpen && (
          <NavbarMobileDrawer
            hasSession={!!nav.session}
            hasMisCursos={nav.hasMisCursos}
            workshopsOpen={nav.mobileWorkshopsOpen}
            coursesOpen={nav.mobileCoursesOpen}
            onToggleWorkshops={() => nav.setMobileWorkshopsOpen(!nav.mobileWorkshopsOpen)}
            onToggleCourses={() => nav.setMobileCoursesOpen(!nav.mobileCoursesOpen)}
            onClose={() => nav.setIsOpen(false)}
          />
        )}
      </header>

      <NavbarFloatingCart
        scrolled={nav.scrolled}
        cartCount={nav.cartCount}
        isCartOpen={nav.isCartOpen}
        onOpenCart={nav.openCart}
      />
    </>
  );
}
