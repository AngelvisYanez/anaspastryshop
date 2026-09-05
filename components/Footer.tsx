import Image from "next/image";
import Link from "next/link";
import logoDark from "@/public/logo-acu-white.png";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-foreground dark:bg-card mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-12">

        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1.8fr] gap-14 pb-16 border-b border-white/10">
          <div>
            <Image
              src={logoDark}
              alt="Academia Omnia"
              className="h-9 w-auto object-contain mb-6"
            />
            <p className="text-sm text-white/45 leading-relaxed max-w-xs">
              La plataforma de educación digital en español para dominar las
              herramientas que mueven el mundo actual. Aprende a tu favor.
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
                { label: "Iniciar sesión", href: "/iniciar-sesion" },
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
            <ul className="space-y-3">
              {["Instagram", "LinkedIn", "TikTok"].map((s) => (
                <li key={s}>
                  <span className="text-sm text-white/20 font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-5">
              Newsletter
            </p>
            <h3 className="text-base font-black text-white mb-2">Recibe nuestras novedades</h3>
            <p className="text-sm text-white/45 mb-5">
              Tips y contenido exclusivo directo a tu correo.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10">
          <p className="text-xs text-white/25 font-medium">
            © 2026 Academia Omnia. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            Educación Financiera · Estados Unidos
          </p>
        </div>
      </div>
    </footer>
  );
}
