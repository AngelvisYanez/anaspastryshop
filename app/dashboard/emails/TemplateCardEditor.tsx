"use client";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  FlaskConical,
  Eye,
} from "lucide-react";

function TestButtonIcon({
  testing,
  testResult,
}: {
  testing: boolean;
  testResult: "ok" | "err" | null;
}) {
  if (testing) return <Loader2 size={13} className="animate-spin" />;
  if (testResult === "ok") return <CheckCircle2 size={13} className="text-green-500" />;
  if (testResult === "err") return <XCircle size={13} className="text-red-500" />;
  return <FlaskConical size={13} className="text-muted" />;
}

function SaveButtonIcon({ saving, saved }: { saving: boolean; saved: boolean }) {
  if (saving) return <Loader2 size={13} className="animate-spin" />;
  if (saved) return <CheckCircle2 size={13} />;
  return <Save size={13} />;
}

export function TemplateCardEditor({
  templateId,
  subject,
  preheader,
  saving,
  saved,
  testing,
  testResult,
  previewing,
  onSubjectChange,
  onPreheaderChange,
  onPreview,
  onTest,
  onSave,
}: {
  templateId: string;
  subject: string;
  preheader: string;
  saving: boolean;
  saved: boolean;
  testing: boolean;
  testResult: "ok" | "err" | null;
  previewing: boolean;
  onSubjectChange: (value: string) => void;
  onPreheaderChange: (value: string) => void;
  onPreview: () => void;
  onTest: () => void;
  onSave: () => void;
}) {
  return (
    <div className="border-t border-card-border px-5 pb-5 pt-4 space-y-3">
      <div>
        <label
          htmlFor={`tpl-subject-${templateId}`}
          className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5"
        >
          Asunto del Email
        </label>
        <input
          id={`tpl-subject-${templateId}`}
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>
      <div>
        <label
          htmlFor={`tpl-preheader-${templateId}`}
          className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5"
        >
          Texto de Previsualización
        </label>
        <input
          id={`tpl-preheader-${templateId}`}
          type="text"
          value={preheader}
          onChange={(e) => onPreheaderChange(e.target.value)}
          placeholder="Texto corto visible en el preview del email"
          className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={previewing}
            className="flex items-center gap-2 bg-section-alt hover:bg-card-hover border border-card-border disabled:opacity-50 text-foreground font-bold py-2 px-4 rounded-lg text-sm transition"
          >
            {previewing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Eye size={13} className="text-accent" />
            )}
            {previewing ? "Cargando..." : "Previsualizar"}
          </button>
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            className="flex items-center gap-2 bg-section-alt hover:bg-card-hover border border-card-border disabled:opacity-50 text-foreground font-bold py-2 px-4 rounded-lg text-sm transition"
            title="Enviar prueba"
          >
            <TestButtonIcon testing={testing} testResult={testResult} />
            {testing
              ? "Enviando..."
              : testResult === "ok"
                ? "Enviado"
                : testResult === "err"
                  ? "Error"
                  : "Enviar prueba"}
          </button>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-accent-solid hover:bg-accent-solid-hover disabled:opacity-50 text-white font-black py-2 px-5 rounded-lg text-sm transition shadow-sm"
        >
          <SaveButtonIcon saving={saving} saved={saved} />
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
