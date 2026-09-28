import { isDarkHeroPath } from "@/lib/utils/isDarkHeroPath";

export function getNavbarTheme({
  forceSolid,
  scrolled,
  pathname,
  logoUrl,
  logoDarkUrl,
}: {
  forceSolid: boolean;
  scrolled: boolean;
  pathname: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}) {
  const isDarkHero = !forceSolid && isDarkHeroPath(pathname);
  const overDark = !scrolled && isDarkHero;
  const isSolid = scrolled || forceSolid;

  const logoSrc = isSolid
    ? logoUrl || "/logo-anas-pastry-shop.png"
    : overDark
      ? logoDarkUrl || "/logo-anas-pastry-shop-white.png"
      : logoUrl || "/logo-anas-pastry-shop.png";

  const navBg = isSolid
    ? "bg-background/95 backdrop-blur-xl border border-card-border shadow-lg dark:bg-brand-purple-deep/90 dark:border-white/10"
    : "bg-transparent border-b border-transparent";

  const linkColor = overDark
    ? "text-white/85 hover:text-white"
    : "text-foreground/75 hover:text-foreground";

  const loginBtnClass = overDark
    ? "bg-white/10 text-white border-white/20 hover:bg-white/20 active:bg-white/25"
    : "bg-white text-foreground border-card-border hover:bg-accent-solid hover:border-accent-solid hover:text-white active:bg-accent-solid-hover active:border-accent-solid-hover active:text-white dark:bg-white dark:text-foreground dark:hover:bg-accent-solid dark:hover:border-accent-solid dark:hover:text-white dark:active:bg-accent-solid-hover dark:active:border-accent-solid-hover dark:active:text-white";

  const iconBtnClass = overDark
    ? "text-white border-white/20 hover:bg-white/10"
    : "text-foreground border-card-border hover:bg-card-hover";

  return { isSolid, logoSrc, navBg, linkColor, loginBtnClass, iconBtnClass };
}
