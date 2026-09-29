import type { ReactNode } from "react";

export function DashboardPage({
  title,
  description,
  actions,
  children,
  wide = true,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`w-full mx-auto ${wide ? "max-w-7xl" : "max-w-5xl"} space-y-5 sm:space-y-6 lg:space-y-8 ${className}`}
    >
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted font-medium mt-1 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0 flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
