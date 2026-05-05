import { getNewsletterSubscribers } from "@/lib/actions/newsletter";
import NewsletterPanel from "./NewsletterPanel";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default async function NewsletterPage() {
  const result = await getNewsletterSubscribers();
  const subscribers = result.subscribers ?? [];

  return (
    <div>
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6 text-xs font-black uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={14} /> Volver al Dashboard
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2.5 bg-accent-subtle text-accent rounded-lg">
            <Mail size={24} />
          </div>
          <h1 className="text-3xl font-black text-foreground">Newsletter</h1>
        </div>
        <p className="text-muted font-medium">
          Gestiona los suscriptores y envía newsletters con la línea gráfica de la Academia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Total</p>
          <p className="text-4xl font-black text-foreground">{subscribers.length}</p>
          <p className="text-xs text-muted font-medium mt-1">suscriptores registrados</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Activos</p>
          <p className="text-4xl font-black text-accent">
            {subscribers.filter((s) => s.isActive).length}
          </p>
          <p className="text-xs text-muted font-medium mt-1">recibirán el próximo envío</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-card-border shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Inactivos</p>
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
