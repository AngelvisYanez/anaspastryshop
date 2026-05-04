import Image from "next/image";
import Link from "next/link";
import logoLight from "@/public/logo-acu.png";
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

  return (
    <footer className="border-t border-card-border pt-20 pb-12 px-6 md:px-10 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <Image
            src={logoLight}
            alt="Academia Credito USA"
            className="h-9 w-auto object-contain block dark:hidden"
          />
          <Image
            src={logoDark}
            alt="Academia Credito USA"
            className="h-9 w-auto object-contain hidden dark:block"
          />
        </div>

        <p className="text-sm text-muted font-medium text-center">
          © {new Date().getFullYear()} Academia Credito USA. Todos los derechos reservados.
        </p>

        <div className="flex gap-6">
          {instagram && (
            <Link href={instagram} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-muted hover:text-accent transition-colors uppercase tracking-widest">
              Instagram
            </Link>
          )}
          {linkedin && (
            <Link href={linkedin} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-muted hover:text-accent transition-colors uppercase tracking-widest">
              LinkedIn
            </Link>
          )}
          {tiktok && (
            <Link href={tiktok} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-muted hover:text-accent transition-colors uppercase tracking-widest">
              TikTok
            </Link>
          )}
          {!instagram && !linkedin && !tiktok && (
            <>
              {["Instagram", "LinkedIn", "TikTok"].map((s) => (
                <span key={s} className="text-sm font-semibold text-muted/40 uppercase tracking-widest">{s}</span>
              ))}
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
