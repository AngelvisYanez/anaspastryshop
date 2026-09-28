"use client";

export function PaymentMethodsGrid({
  methods,
  selectedKey,
  onSelect,
}: {
  methods: { key: string; label: string; badge: string; Icon: React.ElementType }[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="bg-card border border-card-border rounded-3xl p-2.5 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-2 px-2 pt-1">
        Selecciona tu método de pago
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {methods.map((m) => {
          const { Icon } = m;
          const isSelected = selectedKey === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelect(m.key)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition text-center ${
                isSelected
                  ? "bg-accent/10 border-accent text-accent shadow-sm"
                  : "bg-section-alt/50 border-transparent text-muted hover:border-card-border hover:text-foreground"
              }`}
            >
              <Icon size={18} className="mb-1" />
              <span className="text-xs font-bold leading-tight">{m.label}</span>
              <span className="text-[9px] font-semibold opacity-70 mt-0.5">{m.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}