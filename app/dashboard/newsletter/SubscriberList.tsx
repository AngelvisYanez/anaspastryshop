"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteNewsletterSubscriber } from "@/lib/actions/newsletter";
import { DataView } from "../data-view/DataView";

export type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  subscribedAt: Date;
};

export function SubscriberList({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");
    try {
      const result = await deleteNewsletterSubscriber(id);
      if (!result.success) setError("No se pudo eliminar la suscripción.");
      else router.refresh();
    } catch {
      setError("No se pudo eliminar la suscripción.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <DataView title="Suscriptores" items={subscribers} dateLabel="Fecha de suscripción"
        row={(s) => ({ date: s.subscribedAt, values: [s.email, s.name, s.isActive ? "Activo" : "Inactivo"] })}>
        {(visible) => <div className="dashboard-data-cards">
          {visible.map((s) => (
            <div key={s.id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-card-border bg-card p-3 sm:px-4">
              <div className="min-w-0">
                <p className="break-all text-sm font-bold text-foreground">{s.email}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {s.name && <p>{s.name}</p>}
                  <span className={`rounded-md px-2 py-0.5 font-bold ${s.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-section-alt"}`}>
                    {s.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => handleDelete(s.id)} disabled={deletingId !== null}
                aria-label={`Eliminar suscripción de ${s.email}`}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50">
                {deletingId === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          ))}
        </div>}
      </DataView>
    </div>
  );
}
