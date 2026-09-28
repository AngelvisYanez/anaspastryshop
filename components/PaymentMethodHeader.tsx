"use client";

export function PaymentMethodHeader({
  icon,
  iconClassName,
  title,
  badge,
  subtitle,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  badge?: { text: string; className: string };
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconClassName}`}
      >
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-black text-foreground text-base">{title}</h3>
          {badge && (
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${badge.className}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        <p className="text-xs text-muted font-medium">{subtitle}</p>
      </div>
    </div>
  );
}