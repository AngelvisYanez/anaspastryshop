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
          <h1 className="text-3xl font-black text-[#1A1A2E]">Suscripciones</h1>
          <p className="text-gray-400 font-medium">Gestiona planes y suscriptores.</p>
        </div>
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setTab("planes")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              tab === "planes"
                ? "bg-white text-[#1A1A2E] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Star size={15} /> Planes
          </button>
          <button
            onClick={() => setTab("suscriptores")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              tab === "suscriptores"
                ? "bg-white text-[#1A1A2E] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Users size={15} /> Suscriptores
            {suscripciones.length > 0 && (
              <span className="bg-indigo-100 text-[#5A4FCF] text-[10px] font-black px-2 py-0.5 rounded-full">
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
            <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-black text-[#1A1A2E]">{suscripciones.length}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Activas</p>
              <p className="text-3xl font-black text-green-500">{activas}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Canceladas</p>
              <p className="text-3xl font-black text-red-400">{suscripciones.length - activas}</p>
            </div>
          </div>

          {suscripciones.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
              <Star className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-bold">No hay suscripciones registradas aún.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-8 py-4 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Usuario</span>
                <span>Email</span>
                <span>Plan</span>
                <span>Lives</span>
                <span>Estado</span>
              </div>
              {suscripciones.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-8 py-5 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-bold text-[#1A1A2E] text-sm truncate">
                    {sub.user.name || "Sin nombre"}
                  </span>
                  <span className="text-gray-400 text-sm truncate">{sub.user.email}</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#5A4FCF] bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                    <BookOpen size={12} /> {sub.plan}
                  </span>
                  <span className="flex items-center justify-center">
                    <Video
                      size={16}
                      className={sub.hasLiveAccess ? "text-green-500" : "text-gray-200"}
                    />
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                      sub.status === "ACTIVE"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-400"
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
