import Image from "next/image";
import logo from "@/public/logo_II.webp";

export default function Footer() {
  return (
    <footer className="border-t border-card-border pt-20 pb-12 px-6 md:px-10 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="ARTICADEMY"
            className="h-9 w-auto object-contain brightness-0 dark:brightness-0 dark:invert"
          />
        </div>

        <p className="text-sm text-muted font-medium">
          © {new Date().getFullYear()} Articademy — 4101 Media & Artica Group. Latinoamérica.
        </p>

        <div className="flex gap-8">
          {["Instagram", "LinkedIn", "YouTube"].map((social) => (
            <button
              key={social}
              type="button"
              className="text-sm font-semibold text-muted hover:text-accent transition-colors uppercase tracking-widest"
            >
              {social}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
