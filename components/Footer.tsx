import Image from "next/image";
import Link from "next/link";
import logoDark from "@/public/logo-acu-white.png";
import { prisma } from "@/lib/prisma";

async function getSiteConfig() {
  try {
    return await prisma.siteConfig.findFirst();
  } catch {
    return null;
  }
}

export default async function Footer() {
  const config = await getSiteConfig();

  const instagram = config?.instagramUrl;
  const linkedin = config?.linkedinUrl;
  const tiktok = config?.tiktokUrl;

  const socialLinks = [
    { label: "Instagram", href: instagram },
    { label: "LinkedIn", href: linkedin },
    { label: "TikTok", href: tiktok },
  ].filter((s) => !!s.href);

  return (
    <footer className="bg-foreground dark:bg-card mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr] gap-14 pb-16 border-b border-white/10">
          <div>
            <Image
              src={logoDark}
              alt="Academia Credito USA"
              className="h-9 w-auto object-contain mb-6"
            />
            <p className="text-sm text-white/45 leading-relaxed max-w-xs">
              La plataforma de educación crediticia en español más completa de
              Estados Unidos. Aprende a usar el sistema a tu favor.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-5">
              Plataforma
            </p>
            <ul className="space-y-3">
              {[
                { label: "Cursos", href: "/cursos" },
                { label: "Membresía", href: "/membresia" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Iniciar sesión", href: "/auth/login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/45 hover:text-accent transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-5">
              Síguenos
            </p>
            {socialLinks.length > 0 ? (
              <ul className="space-y-3">
                {socialLinks.map((s) => (
                  <li key={s.label}>
                    <Link
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/45 hover:text-accent transition-colors font-medium"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                {["Instagram", "LinkedIn", "TikTok"].map((s) => (
                  <li key={s}>
                    <span className="text-sm text-white/20 font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10">
          <p className="text-xs text-white/25 font-medium">
            © {new Date().getFullYear()} Academia Credito USA. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            Educación Financiera · Estados Unidos
          </p>
        </div>
      </div>
    </footer>
  );
}
