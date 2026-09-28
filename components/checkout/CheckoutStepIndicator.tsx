"use client";

export type CheckoutStep = 1 | 2 | 3;

export function CheckoutStepIndicator({ step }: { step: CheckoutStep }) {
  const steps = [
    { num: 1 as const, label: "Crear Cuenta" },
    { num: 2 as const, label: "Realizar Pago" },
    { num: 3 as const, label: "Confirmación" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {steps.map((s, idx) => {
        const isDone = step > s.num;
        const isCurrent = step === s.num;
        return (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                isDone
                  ? "bg-green-500 text-white"
                  : isCurrent
                    ? "bg-accent-solid text-white shadow-md shadow-accent-solid/30"
                    : "bg-section-alt text-muted"
              }`}
            >
              {isDone ? "✓" : s.num}
            </div>
            <span className={`text-xs font-bold ${isCurrent ? "text-foreground" : "text-muted"}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 rounded-full transition-colors ${
                  step > s.num ? "bg-green-500" : "bg-card-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
