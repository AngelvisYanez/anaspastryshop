"use client";

import { useState } from "react";
import { Eye, EyeOff, Save, Loader2, CheckCircle, ChevronDown, Cloud, Zap } from "lucide-react";
import { saveApiConfig } from "@/lib/actions/platformApi";

type ApiConfigRecord = { provider: string; label: string; config: Record<string, string> };

type FieldDef = { key: string; label: string; placeholder: string; secret?: boolean; hint?: string };

type ApiDef = {
  provider: string;
  label: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  fields: FieldDef[];
};

const API_PROVIDERS: ApiDef[] = [
  {
    provider: "CLOUDFLARE_RTK",
    label: "Cloudflare RealtimeKit",
    description: "Credenciales para las salas de video en tiempo real (Webinars & Meetings).",
    Icon: Cloud,
    color: "orange",
    fields: [
      { key: "accountId", label: "Account ID", placeholder: "54c446e340ef..." },
      { key: "appId", label: "App ID", placeholder: "af37bcfa-5205-..." },
      { key: "apiToken", label: "API Token", placeholder: "cfut_...", secret: true, hint: "Requiere permiso Realtime → Admin" },
    ],
  },
  {
    provider: "CLOUDFLARE_STREAM",
    label: "Cloudflare Stream",
    description: "Credenciales para streaming RTMPS (Lives con OBS).",
    Icon: Zap,
    color: "blue",
    fields: [
      { key: "accountId", label: "Account ID", placeholder: "54c446e340ef..." },
      { key: "apiToken", label: "API Token", placeholder: "cfut_...", secret: true },
    ],
  },
];

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

  const { Icon } = def;
  const colorClass = COLOR_MAP[def.color] ?? COLOR_MAP.orange;
  const hasValues = def.fields.some((f) => form[f.key]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await saveApiConfig(def.provider, def.label, form);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className={`bg-card rounded-xl border shadow-sm overflow-hidden transition-all ${hasValues ? "border-card-border" : "border-card-border"}`}>
      <button
        type="button"
        className="flex items-center justify-between px-8 py-5 cursor-pointer hover:bg-card-hover transition-colors w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="font-bold text-foreground">{def.label}</p>
              {hasValues && (
                <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-green-50 text-green-600">
                  Configurado
                </span>
              )}
            </div>
            <p className="text-xs text-muted font-medium mt-0.5">{def.description}</p>
          </div>
        </div>
        <ChevronDown size={18} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-8 pb-8 border-t border-card-border pt-6 bg-section-alt/30 space-y-4">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold">{error}</div>}

          {def.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                {field.label}
                {field.hint && <span className="text-muted font-medium ml-2">— {field.hint}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type={field.secret && !showSecrets[field.key] ? "password" : "text"}
                  value={form[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-all font-mono text-foreground placeholder:font-sans placeholder:text-muted"
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets((s) => ({ ...s, [field.key]: !s[field.key] }))}
                    className="px-4 bg-card border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
                  >
                    {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="flex items-center gap-2 text-green-600 text-xs font-bold">
                <CheckCircle size={14} /> Guardado correctamente
              </span>
            ) : <span />}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-accent-hover shadow-md shadow-accent/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiConfigManager({ configs }: { configs: ApiConfigRecord[] }) {
  const configMap = Object.fromEntries(configs.map((c) => [c.provider, c]));

  return (
    <div className="max-w-3xl">
      <p className="text-muted font-medium mb-8">Gestiona las credenciales de los servicios externos de la plataforma. Los valores guardados aquí tienen prioridad sobre las variables de entorno.</p>
      <div className="space-y-4">
        {API_PROVIDERS.map((def) => (
          <ApiCard key={def.provider} def={def} initial={configMap[def.provider]} />
        ))}
      </div>

      <div className="mt-8 bg-accent-subtle rounded-xl p-6 border border-accent/20">
        <p className="text-xs font-black uppercase tracking-widest text-accent mb-2">Nota de seguridad</p>
        <p className="text-sm text-foreground/80 font-medium leading-relaxed">
          Las credenciales se almacenan cifradas en la base de datos. Nunca se exponen al cliente. Para mayor seguridad en producción, usa variables de entorno en el servidor.
        </p>
      </div>
    </div>
  );
}
