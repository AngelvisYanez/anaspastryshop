"use client";

import { useState } from "react";
import {
  Plus, Trash2, Loader2, CheckCircle, Pencil, X,
  Video, Star, Package, CreditCard, DollarSign,
  Bitcoin, Zap, Smartphone, Wallet,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createPlan, updatePlan, deletePlan, type PlanData } from "@/lib/actions/subscriptionPlans";

type Section = { id: string; name: string; icon: string; slug: string };
type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  hasLiveAccess: boolean;
  moduleIds: string[];
  paymentMethods: string[];
  isActive: boolean;
};

const PAYMENT_METHODS = [
  { key: "STRIPE",     label: "Stripe",       Icon: CreditCard,  color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { key: "PAYPAL",     label: "PayPal",        Icon: DollarSign,  color: "bg-blue-50 text-blue-600 border-blue-200" },
  { key: "BINANCE",    label: "Binance Pay",   Icon: Bitcoin,     color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  { key: "ZELLE",      label: "Zelle",         Icon: Zap,         color: "bg-purple-50 text-purple-600 border-purple-200" },
  { key: "PAGO_MOVIL", label: "Pago Móvil",    Icon: Smartphone,  color: "bg-green-50 text-green-600 border-green-200" },
  { key: "USDT",       label: "USDT / Crypto", Icon: Wallet,      color: "bg-orange-50 text-orange-600 border-orange-200" },
];

const METHOD_LABEL: Record<string, { label: string; Icon: React.ElementType; color: string }> =
  Object.fromEntries(PAYMENT_METHODS.map((m) => [m.key, m]));

function DynamicIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}

const EMPTY: PlanData = {
  name: "",
  price: 0,
  description: "",
  hasLiveAccess: false,
  moduleIds: [],
  paymentMethods: [],
  isActive: true,
};

export default function PlansManager({
  initialPlans,
  sections,
}: {
  initialPlans: Plan[];
  sections: Section[];
}) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [form, setForm] = useState<PlanData>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError(null);
  }

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      price: plan.price,
      description: plan.description ?? "",
      hasLiveAccess: plan.hasLiveAccess,
      moduleIds: plan.moduleIds,
      paymentMethods: plan.paymentMethods,
      isActive: plan.isActive,
    });
    setError(null);
  }

  function toggleModule(id: string) {
    setForm((f) => ({
      ...f,
      moduleIds: f.moduleIds.includes(id)
        ? f.moduleIds.filter((m) => m !== id)
        : [...f.moduleIds, id],
    }));
  }

  function togglePaymentMethod(key: string) {
    setForm((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(key)
        ? f.paymentMethods.filter((m) => m !== key)
        : [...f.paymentMethods, key],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.paymentMethods.length === 0) {
      setError("Selecciona al menos un método de pago");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    let result: { success?: boolean; plan?: any; error?: string };
    if (editingId) {
      result = await updatePlan(editingId, form);
      if (result.success && result.plan) {
        setPlans((prev) => prev.map((p) => (p.id === editingId ? (result.plan as Plan) : p)));
        setSuccess("Plan actualizado correctamente");
      }
    } else {
      result = await createPlan(form);
      if (result.success && result.plan) {
        setPlans((prev) => [...prev, result.plan as Plan]);
        setSuccess("Plan creado correctamente");
      }
    }

    if (result?.error) {
      setError(result.error);
    } else {
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este plan? Los suscriptores existentes no serán afectados.")) return;
    await deletePlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* FORM */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[#5A4FCF] font-bold text-sm uppercase tracking-widest">
            <Star size={16} />
            {editingId ? "Editar Plan" : "Nuevo Plan"}
          </div>
          {editingId && (
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold flex gap-2 items-center mb-4">
            <CheckCircle size={13} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-1.5">
              Nombre del Plan
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Plan Esencial"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#5A4FCF] outline-none font-bold text-[#1A1A2E]"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-1.5">
              Precio Mensual (USD)
            </label>
            <input
              required
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
              placeholder="29.00"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#5A4FCF] outline-none font-bold text-[#1A1A2E]"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Breve descripción del plan..."
              rows={2}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#5A4FCF] outline-none text-sm text-[#1A1A2E] resize-none"
            />
          </div>

          {/* MÉTODOS DE PAGO */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-3">
              Métodos de Pago Aceptados
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(({ key, label, Icon, color }) => {
                const checked = form.paymentMethods.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePaymentMethod(key)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                      checked
                        ? `${color} border-current`
                        : "border-gray-100 text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked ? "bg-current border-current" : "border-gray-300"
                      }`}
                    >
                      {checked && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <Icon size={14} />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACCESO A LIVES */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-green-600" />
              <span className="text-sm font-bold text-green-800">Acceso a Lives</span>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, hasLiveAccess: !f.hasLiveAccess }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${
                form.hasLiveAccess ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  form.hasLiveAccess ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* MÓDULOS */}
          {sections.length > 0 && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-3">
                Módulos que desbloquea
              </label>
              <div className="space-y-2">
                {sections.map((sec) => {
                  const checked = form.moduleIds.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleModule(sec.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                        checked
                          ? "border-[#5A4FCF] bg-indigo-50 text-[#5A4FCF]"
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          checked ? "bg-[#5A4FCF] border-[#5A4FCF]" : "border-gray-300"
                        }`}
                      >
                        {checked && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <DynamicIcon name={sec.icon} size={14} />
                      <span className="text-sm font-bold">{sec.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sections.length === 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-400 font-medium text-center">
              Crea módulos de plataforma primero para asignarlos a los planes.
            </div>
          )}

          {/* ACTIVO */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <span className="text-sm font-bold text-gray-600">Plan activo</span>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${
                form.isActive ? "bg-[#5A4FCF]" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  form.isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A2E] text-white py-4 rounded-[2rem] font-bold hover:bg-[#5A4FCF] transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : editingId ? (
              <Pencil size={15} />
            ) : (
              <Plus size={15} />
            )}
            {loading ? "Guardando..." : editingId ? "Guardar Cambios" : "Crear Plan"}
          </button>
        </form>
      </div>

      {/* LISTA */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Planes Actuales</h3>
        {plans.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-10 bg-gray-50 rounded-3xl">
            No hay planes creados aún.
          </p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border transition-colors ${
                  plan.isActive ? "bg-gray-50 border-transparent" : "bg-gray-50/40 border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-[#1A1A2E]">{plan.name}</p>
                    <p className="text-2xl font-black text-[#5A4FCF]">
                      ${plan.price}
                      <span className="text-xs text-gray-400 font-normal ml-1">/mes</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(plan)}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#5A4FCF] hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-xs text-gray-400 mb-3">{plan.description}</p>
                )}

                {/* Métodos de pago */}
                {plan.paymentMethods.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-1.5">
                      Métodos de pago
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.paymentMethods.map((key) => {
                        const meta = METHOD_LABEL[key];
                        if (!meta) return null;
                        const { Icon, label, color } = meta;
                        return (
                          <span
                            key={key}
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${color}`}
                          >
                            <Icon size={10} /> {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {plan.hasLiveAccess && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-1 rounded-lg">
                      <Video size={10} /> Lives
                    </span>
                  )}
                  {plan.moduleIds.length > 0 ? (
                    sections
                      .filter((s) => plan.moduleIds.includes(s.id))
                      .map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-[#5A4FCF] px-2 py-1 rounded-lg"
                        >
                          <DynamicIcon name={s.icon} size={10} /> {s.name}
                        </span>
                      ))
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Package size={11} /> Sin módulos asignados
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
