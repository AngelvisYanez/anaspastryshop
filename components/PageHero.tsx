import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ScrollIndicator from "@/components/ScrollIndicator";

export default function PageHero({
  backHref,
  backLabel,
  badge,
  title,
  subtitle,
  variant = "default",
  className = "",
}: {
  backHref?: string;
  backLabel?: string;
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: "default" | "deep";
  className?: string;
}) {
  const gradient =
    variant === "deep"
      ? "bg-gradient-to-b from-brand-purple-deep to-brand-purple"
      : "bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep";

  return (
    <section
      className={`relative min-h-screen flex flex-col justify-center overflow-hidden ${gradient} text-white pt-32 pb-24 sm:pt-40 sm:pb-32 rounded-b-3xl ${className}`}
    >
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#E82D8A_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 md:px-10 text-center">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/55 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={12} /> {backLabel || "Volver"}
          </Link>
        )}

        {badge && <div className="mb-6">{badge}</div>}

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-6 text-base sm:text-lg text-white/85 max-w-prose mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <ScrollIndicator label="Continuar" />
    </section>
  );
}
