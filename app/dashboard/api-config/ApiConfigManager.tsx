"use client";

import { useState } from "react";
import { Eye, EyeOff, Save, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { saveApiConfig } from "@/lib/actions/platformApi";

type ApiConfigRecord = { provider: string; label: string; config: Record<string, string> };

type FieldDef = { key: string; label: string; placeholder: string; secret?: boolean; hint?: string };

type ApiDef = {
  provider: string;
  label: string;
  description: string;
  color: string;
  fields: FieldDef[];
};

/** Sin proveedores externos de media por ahora (Cloudflare eliminado). */
const API_PROVIDERS: ApiDef[] = [];

const COLOR_MAP: Record<string, string> = {
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
};

function ApiCard({ def, initial }: { def: ApiDef; initial?: ApiConfigRecord }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(
    () => Object.fromEntries(def.fields.map((f) => [f.key, initial?.config?.[f.key] ?? ""]))
  );
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorClass = COLOR_MAP[def.color] ?? COLOR_MAP.orange;
  const hasValues = def.fields.some((f) => form[f.key]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const result = await saveApiConfig(def.provider, def.label, form);
      if (result.error) { setError(result.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`bg-card rounded-xl border shadow-sm overflow-hidden transition ${hasValues ? "border-card-border" : "border-card-border"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-card-hover transition"
      >
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorClass}`}>
          <span className="text-xs font-black">{def.label.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-foreground text-sm">{def.label}</p>
          <p className="text-xs text-muted truncate">{def.description}</p>
        </div>
        <ChevronDown size={18} className={`text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-card-border pt-4">
          {def.fields.map((field) => {
            const visible = showSecrets[field.key];
            return (
              <div key={field.key} className="space-y-1.5">
                <label htmlFor={`api-${def.provider}-${field.key}`} className="block text-xs font-bold text-foreground">
                  {field.label}
                </label>
                <div className="flex gap-2">
                  <input
                    id={`api-${def.provider}-${field.key}`}
                    type={field.secret && !visible ? "password" : "text"}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition font-mono text-foreground placeholder:font-sans placeholder:text-muted"
                  />
                  {field.secret && (
                    <button
                      type="button"
                      onClick={() => setShowSecrets((s) => ({ ...s, [field.key]: !s[field.key] }))}
                      aria-label={visible ? `Ocultar ${field.label}` : `Mostrar ${field.label}`}
                      className="px-4 bg-card border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
                    >
                      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {field.hint && <p className="text-[11px] text-muted">{field.hint}</p>}
              </div>
            );
          })}

          {error && (
            <p role="alert" className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span role="status" className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <CheckCircle size={15} /> Guardado
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent-solid text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-solid-hover transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiConfigManager({ configs }: { configs: ApiConfigRecord[] }) {
  if (API_PROVIDERS.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-8 text-center space-y-2">
        <h1 className="text-xl font-black text-foreground">APIs de plataforma</h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          No hay integraciones de media configuradas. Las credenciales de Cloudflare fueron eliminadas del proyecto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-foreground">APIs de plataforma</h1>
        <p className="text-sm text-muted mt-1">Credenciales de servicios externos.</p>
      </div>
      {API_PROVIDERS.map((def) => (
        <ApiCard
          key={def.provider}
          def={def}
          initial={configs.find((c) => c.provider === def.provider)}
        />
      ))}
    </div>
  );
}
