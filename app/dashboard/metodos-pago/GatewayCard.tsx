"use client";

import { useState, useRef } from "react";
import {
  ChevronDown, Eye, EyeOff, Save, Loader2, CheckCircle,
  Upload, Image as ImageIcon, X,
} from "lucide-react";
import { saveGatewayConfig } from "@/lib/actions/gateway";
import Image from "next/image";
import {
  type GatewayConfig,
  type GatewayDef,
  COLOR_MAP,
} from "./gatewayShared";

type FormState = {
  isEnabled: boolean;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  extra: Record<string, string>;
};

function buildInitialState(def: GatewayDef, cfg?: GatewayConfig): FormState {
  const extraFields = def.fields.filter((f) => f.extra);
  const extra: Record<string, string> = {};
  for (const f of extraFields) {
    extra[f.key] = (cfg?.extraConfig as any)?.[f.key] ?? "";
  }
  return {
    isEnabled: cfg?.isEnabled ?? false,
    publicKey: cfg?.publicKey ?? "",
    secretKey: cfg?.secretKey ?? "",
    webhookSecret: cfg?.webhookSecret ?? "",
    extra,
  };
}

export function GatewayCard({
  def,
  initialConfig,
}: {
  def: GatewayDef;
  initialConfig?: GatewayConfig;
}) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(def, initialConfig));
  const [open, setOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null);

  const colorClass = COLOR_MAP[def.color] ?? COLOR_MAP.indigo;
  const { Icon } = def;

  function toggleSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setField(key: string, value: string, isExtra = false) {
    if (isExtra) {
      setForm((f) => ({ ...f, extra: { ...f.extra, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [key as keyof FormState]: value } as FormState));
    }
  }

  async function handleImageUpload(fieldKey: string, file: File) {
    setUploadingField(fieldKey);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudflare/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al subir la imagen");
      } else if (data.url) {
        setField(fieldKey, data.url, true);
      } else {
        setError(data.error || "Error al subir la imagen");
      }
    } catch {
      setError("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const result = await saveGatewayConfig(def.provider, {
        isEnabled: form.isEnabled,
        publicKey: form.publicKey || undefined,
        secretKey: form.secretKey || undefined,
        webhookSecret: form.webhookSecret || undefined,
        extraConfig: Object.keys(form.extra).length > 0 ? form.extra : undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden transition">
      <div className="flex items-center px-4 sm:px-8 py-4 sm:py-5 hover:bg-card-hover transition-colors relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between flex-1 text-left cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${colorClass}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="font-bold text-foreground text-sm sm:text-base">{def.label}</p>
                <span
                  className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    def.type === "automatic"
                      ? "bg-accent/10 text-accent"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {def.type === "automatic" ? "Automático" : "Comprobante"}
                </span>
              </div>
              <p className="text-xs text-muted font-medium mt-0.5">{def.description}</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-muted transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={form.isEnabled}
          aria-label={`${form.isEnabled ? "Desactivar" : "Activar"} ${def.label}`}
          onClick={() => setForm((f) => ({ ...f, isEnabled: !f.isEnabled }))}
          className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ml-4 ${
            form.isEnabled ? "bg-accent" : "bg-muted/25"
          }`}
          title={form.isEnabled ? "Desactivar" : "Activar"}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
              form.isEnabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 border-t border-card-border pt-6 bg-section-alt/40 space-y-4">
          {error && (
            <div role="alert" className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {def.fields.map((field) => {
            const isSecret = field.secret;
            const isExtra = field.extra;
            const value = isExtra ? form.extra[field.key] ?? "" : (form as any)[field.key] ?? "";
            const visible = showSecrets[field.key];
            const isImage = field.isImage;

            return (
              <div key={field.key} className="space-y-1.5">
                <label htmlFor={`gw-${def.provider}-${field.key}`} className="block text-xs font-bold text-foreground">{field.label}</label>

                {isImage ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        id={`gw-${def.provider}-${field.key}`}
                        type="text"
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value, isExtra)}
                        placeholder={field.placeholder}
                        className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-accent transition font-mono text-foreground placeholder:font-sans placeholder:text-muted"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-${def.provider}-${field.key}`}
                        className="sr-only peer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(field.key, file);
                        }}
                      />
                      <label
                        htmlFor={`file-${def.provider}-${field.key}`}
                        className="flex items-center gap-2 bg-card border border-card-border hover:border-accent peer-focus-visible:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 text-foreground px-4 py-3 rounded-xl cursor-pointer text-xs font-bold transition shrink-0"
                      >
                        {uploadingField === field.key ? (
                          <Loader2 size={16} className="animate-spin text-accent" />
                        ) : (
                          <Upload size={16} className="text-accent" />
                        )}
                        <span>{uploadingField === field.key ? "Subiendo..." : "Subir QR"}</span>
                      </label>
                    </div>

                    {value && (
                      <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-card-border w-fit">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-card-border bg-white flex items-center justify-center">
                          <img
                            src={value}
                            alt="Vista previa QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-foreground">Vista previa del QR</p>
                          <p className="text-[11px] text-muted">Este QR se mostrará en el checkout</p>
                          <button
                            type="button"
                            onClick={() => setField(field.key, "", isExtra)}
                            className="text-red-500 hover:underline text-[11px] font-bold mt-1 flex items-center gap-1"
                          >
                            <X size={12} /> Quitar imagen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id={`gw-${def.provider}-${field.key}`}
                      type={isSecret && !visible ? "password" : "text"}
                      value={value}
                      onChange={(e) => setField(field.key, e.target.value, isExtra)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition font-mono text-foreground placeholder:font-sans placeholder:text-muted"
                    />
                    {isSecret && (
                      <button
                        type="button"
                        onClick={() => toggleSecret(field.key)}
                        aria-label={visible ? `Ocultar ${field.label}` : `Mostrar ${field.label}`}
                        className="px-4 bg-card border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
                      >
                        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span role="status" className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle size={15} /> Guardado correctamente
              </span>
            )}
            {!saved && <span />}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent-solid text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-solid-hover shadow-md shadow-accent/20 transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
