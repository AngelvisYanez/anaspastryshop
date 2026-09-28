"use client";

export function NewsletterStats({
  total,
  active,
  inactive,
}: {
  total: number;
  active: number;
  inactive: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Total</p>
        <p className="text-3xl font-black text-foreground">{total}</p>
        <p className="text-xs text-muted font-medium mt-1">suscriptores registrados</p>
      </div>
      <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Activos</p>
        <p className="text-3xl font-black text-accent">{active}</p>
        <p className="text-xs text-muted font-medium mt-1">recibirán el próximo envío</p>
      </div>
      <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Inactivos</p>
        <p className="text-3xl font-black text-foreground">{inactive}</p>
        <p className="text-xs text-muted font-medium mt-1">cancelaron suscripción</p>
      </div>
    </div>
  );
}