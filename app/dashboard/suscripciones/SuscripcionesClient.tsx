"use client";

import { useState } from "react";
import { Star, Users, Video, BookOpen } from "lucide-react";
import PlansManager from "./PlansManager";

type Suscripcion = {
  id: string;
  plan: string;
  status: string;
  startDate: Date;
  user: { name: string | null; email: string };
  hasLiveAccess?: boolean;
};

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  hasLiveAccess: boolean;
  hasWebinarAccess: boolean;
  moduleIds: string[];
  paymentMethods: string[];
  isActive: boolean;
};

type Section = { id: string; name: string; icon: string; slug: string };

export default function SuscripcionesClient({
  suscripciones,
  initialPlans,
  sections,
}: {
  suscripciones: Suscripcion[];
  initialPlans: Plan[];
  sections: Section[];
}) {
  const [tab, setTab] = useState<"planes" | "suscriptores">("planes");

  const activas = suscripciones.filter((s) => s.status === "ACTIVE").length;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Suscripciones</h1>
          <p className="text-muted font-medium">Gestiona planes y suscriptores.</p>
        </div>
        <div className="flex bg-section-alt rounded-lg p-1 gap-1 border border-card-border">
          <button
            onClick={() => setTab("planes")}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all flex items-center gap-2 ${
              tab === "planes"
                ? "bg-card text-foreground shadow-sm border border-card-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Star size={14} /> Planes
          </button>
          <button
            onClick={() => setTab("suscriptores")}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all flex items-center gap-2 ${
              tab === "suscriptores"
                ? "bg-card text-foreground shadow-sm border border-card-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Users size={14} /> Suscriptores
            {suscripciones.length > 0 && (
              <span className="bg-accent-subtle text-accent text-[10px] font-black px-2 py-0.5 rounded-md">
                {suscripciones.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === "planes" && (
        <PlansManager initialPlans={initialPlans} sections={sections} />
      )}

      {tab === "suscriptores" && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Total</p>
              <p className="text-3xl font-black text-foreground">{suscripciones.length}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Activas</p>
              <p className="text-3xl font-black text-green-500">{activas}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Canceladas</p>
              <p className="text-3xl font-black text-red-400">{suscripciones.length - activas}</p>
            </div>
          </div>

          {suscripciones.length === 0 ? (
            <div className="bg-card rounded-xl p-16 text-center border border-dashed border-card-border">
              <Star className="mx-auto text-muted/20 mb-4" size={40} />
              <p className="text-muted font-bold">No hay suscripciones registradas aún.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-3.5 border-b border-card-border text-[10px] font-black uppercase tracking-widest text-muted bg-section-alt">
                <span>Usuario</span>
                <span>Email</span>
                <span>Plan</span>
                <span>Lives</span>
                <span>Estado</span>
              </div>
              {suscripciones.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-card-border last:border-0 items-center hover:bg-card-hover transition-colors"
                >
                  <span className="font-bold text-foreground text-sm truncate">
                    {sub.user.name || "Sin nombre"}
                  </span>
                  <span className="text-muted text-sm truncate">{sub.user.email}</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent-subtle px-3 py-1 rounded-md w-fit">
                    <BookOpen size={12} /> {sub.plan}
                  </span>
                  <span className="flex items-center justify-center">
                    <Video
                      size={15}
                      className={sub.hasLiveAccess ? "text-green-500" : "text-muted/30"}
                    />
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${
                      sub.status === "ACTIVE"
                        ? "bg-green-50 dark:bg-green-950/20 text-green-600"
                        : "bg-red-50 dark:bg-red-950/20 text-red-400"
                    }`}
                  >
                    {sub.status === "ACTIVE" ? "Activa" : "Cancelada"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
