import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
      className={`relative flex flex-col justify-center overflow-hidden ${gradient} text-white pt-28 pb-16 xl:pt-36 xl:pb-20 ${className}`}
    >
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 md:px-10 text-center">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={12} /> {backLabel || "Volver"}
          </Link>
        )}

        {badge && <div className="mb-6">{badge}</div>}

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-5 text-sm sm:text-lg text-white/85 max-w-prose mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
