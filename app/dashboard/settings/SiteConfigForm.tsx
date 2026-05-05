"use client";
import { useState } from "react";
import {
  Globe, Menu, AtSign, Instagram, Linkedin, Save,
  Loader2, CheckCircle, Plus, Trash2, DollarSign,
} from "lucide-react";

interface NavItem { label: string; href: string; }

interface SiteConfigData {
  siteName: string;
  logoUrl: string | null;
  ctaText: string;
  ctaUrl: string;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
  subscriptionPrice: number;
  subscriptionPriceId: string | null;
  navItems: NavItem[];
}

export default function SiteConfigForm({ initialConfig }: { initialConfig: SiteConfigData }) {
  const [tab, setTab] = useState<"general" | "header" | "social">("general");
  const [config, setConfig] = useState<SiteConfigData>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addNavItem() {
    setConfig((c) => ({ ...c, navItems: [...c.navItems, { label: "", href: "" }] }));
  }

  function removeNavItem(i: number) {
    setConfig((c) => ({ ...c, navItems: c.navItems.filter((_, idx) => idx !== i) }));
  }

  function updateNavItem(i: number, field: keyof NavItem, value: string) {
    setConfig((c) => {
      const items = [...c.navItems];
      items[i] = { ...items[i], [field]: value };
      return { ...c, navItems: items };
    });
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Error de conexión");
    }
    setLoading(false);
  }

  const inputClass = "w-full bg-background border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block ml-1";

  const TABS = [
    { id: "general", label: "General", icon: Globe },
    { id: "header", label: "Header & Menú", icon: Menu },
    { id: "social", label: "Redes Sociales", icon: AtSign },
  ] as const;

  return (
    <div className="bg-card border border-card-border rounded-lg p-8 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <Globe size={20} className="text-accent" />
        <h2 className="text-xl font-black text-foreground">Configuración del Sitio</h2>
      </div>

      <div className="flex gap-2 mb-8 bg-background p-1 rounded-lg w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm border border-card-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Nombre del Sitio</label>
            <input
              className={inputClass}
              value={config.siteName}
              onChange={(e) => setConfig((c) => ({ ...c, siteName: e.target.value }))}
              placeholder="Academia Credito USA"
            />
          </div>
          <div>
            <label className={labelClass}>Logo URL (opcional)</label>
            <input
              className={inputClass}
              value={config.logoUrl ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, logoUrl: e.target.value || null }))}
              placeholder="https://tu-dominio.com/logo.png"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Precio de Suscripción (USD/mes)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className={`${inputClass} pl-8`}
                  type="number"
                  min={0}
                  step={0.01}
                  value={config.subscriptionPrice}
                  onChange={(e) => setConfig((c) => ({ ...c, subscriptionPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="97.00"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Stripe Price ID (suscripción recurrente)</label>
              <input
                className={inputClass}
                value={config.subscriptionPriceId ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, subscriptionPriceId: e.target.value || null }))}
                placeholder="price_xxxxxxxxxxxx"
              />
            </div>
          </div>
        </div>
      )}

      {tab === "header" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Texto del Botón CTA</label>
              <input
                className={inputClass}
                value={config.ctaText}
                onChange={(e) => setConfig((c) => ({ ...c, ctaText: e.target.value }))}
                placeholder="Quiero unirme ahora"
              />
            </div>
            <div>
              <label className={labelClass}>URL del Botón CTA</label>
              <input
                className={inputClass}
                value={config.ctaUrl}
                onChange={(e) => setConfig((c) => ({ ...c, ctaUrl: e.target.value }))}
                placeholder="/planes o /checkout/subscription"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className={labelClass}>Ítems del Menú de Navegación</label>
              <button
                type="button"
                onClick={addNavItem}
                className="flex items-center gap-1.5 text-accent font-bold text-xs hover:bg-accent-subtle px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {config.navItems.length === 0 && (
                <p className="text-sm text-muted italic text-center py-6 bg-background rounded-lg">
                  No hay ítems de menú. Los dinámicos se obtienen de Módulos de Plataforma.
                </p>
              )}
              {config.navItems.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input
                    className={`${inputClass} flex-1`}
                    value={item.label}
                    onChange={(e) => updateNavItem(i, "label", e.target.value)}
                    placeholder="Etiqueta (ej. Cursos)"
                  />
                  <input
                    className={`${inputClass} flex-1`}
                    value={item.href}
                    onChange={(e) => updateNavItem(i, "href", e.target.value)}
                    placeholder="URL (ej. /cursos)"
                  />
                  <button
                    type="button"
                    onClick={() => removeNavItem(i)}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "social" && (
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Instagram URL</label>
            <div className="relative">
              <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className={`${inputClass} pl-9`}
                value={config.instagramUrl ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, instagramUrl: e.target.value || null }))}
                placeholder="https://instagram.com/academiacreditousa"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <div className="relative">
              <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className={`${inputClass} pl-9`}
                value={config.linkedinUrl ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, linkedinUrl: e.target.value || null }))}
                placeholder="https://linkedin.com/company/academiacreditousa"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>TikTok URL</label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className={`${inputClass} pl-9`}
                value={config.tiktokUrl ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, tiktokUrl: e.target.value || null }))}
                placeholder="https://tiktok.com/@academiacreditousa"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-between">
        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
            <CheckCircle size={16} /> Guardado correctamente
          </div>
        )}
        {!error && !success && <span />}
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-navy dark:bg-accent text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
