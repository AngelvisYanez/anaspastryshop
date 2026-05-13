"use client";

import { useState } from "react";
import { Star, Users, Video, BookOpen, Trash2, RefreshCw, X, AlertCircle } from "lucide-react";
import PlansManager from "./PlansManager";

type Suscripcion = {
  id: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
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

function formatDate(date: Date | null) {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SuscripcionesClient({
  suscripciones: initialSuscripciones,
  initialPlans,
  sections,
}: {
  suscripciones: Suscripcion[];
  initialPlans: Plan[];
  sections: Section[];
}) {
  const [tab, setTab] = useState<"planes" | "suscriptores">("planes");
  const [suscripciones, setSuscripciones] = useState(initialSuscripciones);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const activas = suscripciones.filter((s) => s.status === "ACTIVE").length;

  async function confirmDelete() {
    if (!deletingId) return;
    setLoadingAction(true);
    await fetch(`/api/suscripciones/${deletingId}`, { method: "DELETE" });
    setSuscripciones((prev) => prev.filter((s) => s.id !== deletingId));
    setDeletingId(null);
    setLoadingAction(false);
  }

  async function handleChangePlan() {
    if (!changingId || !selectedPlan) return;
    setLoadingAction(true);
    const res = await fetch(`/api/suscripciones/${changingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan }),
    });
    if (res.ok) {
      setSuscripciones((prev) =>
        prev.map((s) => (s.id === changingId ? { ...s, plan: selectedPlan } : s))
      );
    }
    setLoadingAction(false);
    setChangingId(null);
    setSelectedPlan("");
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-muted font-medium mb-4">Gestiona planes y suscriptores.</p>
        <div className="flex bg-section-alt rounded-lg p-1 gap-1 border border-card-border w-fit">
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
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3.5 border-b border-card-border text-[10px] font-black uppercase tracking-widest text-muted bg-section-alt">
                <span>Usuario</span>
                <span>Email</span>
                <span>Plan</span>
                <span>Lives</span>
                <span>Caduca</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {suscripciones.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-card-border last:border-0 items-center hover:bg-card-hover transition-colors"
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
                  <span className="text-xs text-muted font-medium whitespace-nowrap">
                    {formatDate(sub.endDate)}
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
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setChangingId(sub.id);
                        setSelectedPlan(sub.plan);
                      }}
                      title="Cambiar membresía"
                      className="p-1.5 rounded-md text-muted hover:text-accent hover:bg-accent-subtle transition-colors"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingId(sub.id)}
                      disabled={loadingAction}
                      title="Eliminar suscripción"
                      className="p-1.5 rounded-md text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-center text-foreground mb-2">¿Eliminar Suscripción?</h3>
            <p className="text-sm text-center text-muted mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={loadingAction}
                className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-sm font-bold text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={loadingAction}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70"
              >
                <Trash2 size={14} /> {loadingAction ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {changingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-card-border shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-foreground text-lg">Cambiar Membresía</h2>
              <button
                onClick={() => setChangingId(null)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-section-alt transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-2">
              Plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-section-alt border border-card-border rounded-lg px-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent mb-5"
            >
              <option value="">Seleccionar plan...</option>
              {initialPlans.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setChangingId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-sm font-bold text-muted hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePlan}
                disabled={loadingAction || !selectedPlan}
                className="flex-1 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loadingAction ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
