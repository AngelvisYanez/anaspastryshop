"use client";

import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="w-full bg-brand-plum-deep border-t border-white/10 text-white relative z-20">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-48">
                <Image
                  src="/logo-anas-pastry-shop-white.png"
                  alt="Ana's Pastry Shop"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Workshops presenciales de pastelería y repostería en Caracas, y cursos online diseñados desde cero por la Chef Anais Flores.
            </p>
            <p className="text-xs text-pink-300 italic font-medium">
              &ldquo;El conocimiento nos hace responsables. Invertir en conocimientos produce siempre los mejores beneficios.&rdquo;
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pink-300 mb-5">
              Navegación
            </p>
            <ul className="space-y-3">
              {[
                { label: "Workshops & Cursos", href: "/cursos" },
                { label: "Servicio de Pastelería", href: "/pasteleria" },
                { label: "Sobre Anais", href: "/nosotros" },
                { label: "Iniciar Sesión", href: "/iniciar-sesion" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-pink-300 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pink-300 mb-5">
              Contacto & Redes
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com/anaspastryshop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-pink-300 transition-colors font-medium flex items-center gap-2"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/?text=Hola%20Anais!%20Deseo%20informaci%C3%B3n%20sobre%20tus%20workshops%20y%20servicios%20de%20pasteler%C3%ADa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-pink-300 transition-colors font-medium flex items-center gap-2"
                >
                  WhatsApp Directo
                </a>
              </li>
              <li>
                <a
                  href="mailto:contacto@anaspastryshop.com"
                  className="text-sm text-white/60 hover:text-pink-300 transition-colors font-medium flex items-center gap-2"
                >
                  contacto@anaspastryshop.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pink-300 mb-5">
              Comunidad Dulce
            </p>
            <h2 className="text-base font-black text-white mb-2">Recibe próximas fechas y novedades</h2>
            <p className="text-sm text-white/60 mb-5">
              Sé la primera en enterarte de nuevos workshops presenciales, recetas y fechas de pedidos especiales.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 Ana&apos;s Pastry Shop. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/cursos" className="hover:text-white transition-colors">
              Workshops Presenciales
            </Link>
            <Link href="/nosotros" className="hover:text-white transition-colors">
              Sobre la Instructora
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
