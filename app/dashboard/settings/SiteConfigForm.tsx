"use client";
import { useState } from "react";
import {
  Globe, Menu, AtSign, Instagram, Linkedin, Save,
  Loader2, CheckCircle, Plus, Trash2,
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
  navItems: NavItem[];
}

export default function SiteConfigForm({ initialConfig }: { initialConfig: SiteConfigData }) {
  const [tab, setTab] = useState<"general" | "header" | "social">("general");
  const [config, setConfig] = useState<SiteConfigData>(initialConfig);
  const [navKeys, setNavKeys] = useState<string[]>(() =>
    initialConfig.navItems.map(() => crypto.randomUUID())
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addNavItem() {
    setConfig((c) => ({ ...c, navItems: [...c.navItems, { label: "", href: "" }] }));
    setNavKeys((k) => [...k, crypto.randomUUID()]);
  }

  function removeNavItem(i: number) {
    setConfig((c) => ({ ...c, navItems: c.navItems.filter((_, idx) => idx !== i) }));
    setNavKeys((k) => k.filter((_, idx) => idx !== i));
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

  const inputClass =
    "w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition text-foreground placeholder:text-muted text-sm font-medium";
  const labelClass = "text-[11px] font-black uppercase tracking-widest text-muted mb-1.5 block ml-1";

  const TABS = [
    { id: "general", label: "General", icon: Globe },
    { id: "header", label: "Menú", icon: Menu },
    { id: "social", label: "Redes", icon: AtSign },
  ] as const;

  return (
    <section className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center shrink-0">
            <Globe size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-foreground">Sitio web</h2>
            <p className="text-sm text-muted font-medium mt-0.5">
              Nombre, menú y redes de la página pública
            </p>
          </div>
        </div>

        <div className="mb-5 -mx-1 px-1 overflow-x-auto">
          <div className="flex gap-1.5 bg-section-alt p-1 rounded-xl w-full sm:w-fit min-w-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-10 ${
                  tab === id
                    ? "bg-card text-foreground shadow-sm border border-card-border"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {tab === "general" && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="site-name" className={labelClass}>Nombre del sitio</label>
                <input
                  id="site-name"
                  className={inputClass}
                  value={config.siteName}
                  onChange={(e) => setConfig((c) => ({ ...c, siteName: e.target.value }))}
                  placeholder="Ana's Pastry Shop"
                />
              </div>
              <div>
                <label htmlFor="site-logo-url" className={labelClass}>Logo URL (opcional)</label>
                <input
                  id="site-logo-url"
                  className={inputClass}
                  value={config.logoUrl ?? ""}
                  onChange={(e) => setConfig((c) => ({ ...c, logoUrl: e.target.value || null }))}
                  placeholder="/logo-anas-pastry-shop.png"
                />
              </div>
            </div>
          )}

          {tab === "header" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="site-cta-text" className={labelClass}>Texto del botón CTA</label>
                  <input
                    id="site-cta-text"
                    className={inputClass}
                    value={config.ctaText}
                    onChange={(e) => setConfig((c) => ({ ...c, ctaText: e.target.value }))}
                    placeholder="Ver Talleres Presenciales"
                  />
                </div>
                <div>
                  <label htmlFor="site-cta-url" className={labelClass}>Enlace del botón CTA</label>
                  <input
                    id="site-cta-url"
                    className={inputClass}
                    value={config.ctaUrl}
                    onChange={(e) => setConfig((c) => ({ ...c, ctaUrl: e.target.value }))}
                    placeholder="/cursos"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground">Enlaces del menú</p>
                    <p className="text-xs text-muted">Aparecen en el header junto a las secciones</p>
                  </div>
                  <button
                    type="button"
                    onClick={addNavItem}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-subtle text-accent rounded-xl text-xs font-bold hover:opacity-80 transition-opacity shrink-0 min-h-10"
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>

                {config.navItems.length === 0 ? (
                  <p className="text-xs text-muted italic py-6 text-center border border-dashed border-card-border rounded-xl">
                    No hay enlaces personalizados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {config.navItems.map((item, i) => (
                      <div key={navKeys[i]} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <label htmlFor={`nav-label-${navKeys[i]}`} className="sr-only">
                          Texto del enlace {i + 1}
                        </label>
                        <input
                          id={`nav-label-${navKeys[i]}`}
                          className={`${inputClass} flex-1`}
                          value={item.label}
                          onChange={(e) => updateNavItem(i, "label", e.target.value)}
                          placeholder="Texto (ej. Blog)"
                        />
                        <label htmlFor={`nav-href-${navKeys[i]}`} className="sr-only">
                          URL del enlace {i + 1}
                        </label>
                        <input
                          id={`nav-href-${navKeys[i]}`}
                          className={`${inputClass} flex-1`}
                          value={item.href}
                          onChange={(e) => updateNavItem(i, "href", e.target.value)}
                          placeholder="URL (ej. /blog)"
                        />
                        <button
                          type="button"
                          onClick={() => removeNavItem(i)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors self-end sm:self-auto"
                          title="Eliminar"
                          aria-label={`Eliminar enlace ${item.label || i + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "social" && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="site-instagram" className={labelClass}>Instagram</label>
                <div className="relative">
                  <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="site-instagram"
                    className={`${inputClass} pl-11`}
                    value={config.instagramUrl ?? ""}
                    onChange={(e) => setConfig((c) => ({ ...c, instagramUrl: e.target.value || null }))}
                    placeholder="https://instagram.com/anaspastryshop"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="site-tiktok" className={labelClass}>TikTok</label>
                <input
                  id="site-tiktok"
                  className={inputClass}
                  value={config.tiktokUrl ?? ""}
                  onChange={(e) => setConfig((c) => ({ ...c, tiktokUrl: e.target.value || null }))}
                  placeholder="https://tiktok.com/@anaspastryshop"
                />
              </div>
              <div>
                <label htmlFor="site-linkedin" className={labelClass}>LinkedIn (opcional)</label>
                <div className="relative">
                  <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="site-linkedin"
                    className={`${inputClass} pl-11`}
                    value={config.linkedinUrl ?? ""}
                    onChange={(e) => setConfig((c) => ({ ...c, linkedinUrl: e.target.value || null }))}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-card-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-h-[1.25rem]">
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            {success && (
              <p role="status" className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5">
                <CheckCircle size={14} /> Guardado
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 bg-accent-solid text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-accent-solid-hover transition-colors disabled:opacity-50 shadow-md shadow-accent-solid/20 w-full sm:w-auto"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar sitio
          </button>
        </div>
      </div>
    </section>
  );
}
