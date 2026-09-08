import { getNewsletterSubscribers } from "@/lib/actions/newsletter";
import NewsletterPanel from "./NewsletterPanel";

export default async function NewsletterPage() {
  const result = await getNewsletterSubscribers();
  const subscribers = result.subscribers ?? [];

  return (
    <div>
      <p className="text-muted font-medium mb-8">Gestiona los suscriptores y envía newsletters con la línea gráfica de la Academia.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Total</p>
          <p className="text-4xl font-black text-foreground">{subscribers.length}</p>
          <p className="text-xs text-muted font-medium mt-1">suscriptores registrados</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Activos</p>
          <p className="text-4xl font-black text-accent">
            {subscribers.filter((s) => s.isActive).length}
          </p>
          <p className="text-xs text-muted font-medium mt-1">recibirán el próximo envío</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Inactivos</p>
          <p className="text-4xl font-black text-foreground">
            {subscribers.filter((s) => !s.isActive).length}
          </p>
          <p className="text-xs text-muted font-medium mt-1">cancelaron suscripción</p>
        </div>
      </div>

      <NewsletterPanel subscribers={subscribers} />
    </div>
  );
}
