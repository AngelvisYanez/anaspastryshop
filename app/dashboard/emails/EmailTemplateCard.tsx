"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { updateEmailTemplate, sendTestEmail } from "@/lib/actions/email-templates";
import type { EmailTemplateData } from "@/lib/email-template-defaults";
import { TemplateCardEditor } from "./TemplateCardEditor";

const RECIPIENT_LABELS: Record<string, string> = {
  USER: "Usuario",
  ADMIN: "Admin",
  SUBSCRIBER: "Suscriptor",
};

const RECIPIENT_COLORS: Record<string, string> = {
  USER: "bg-section-alt text-foreground",
  ADMIN: "bg-purple-100 dark:bg-purple-950/30 text-purple-600",
  SUBSCRIBER: "bg-green-100 dark:bg-green-950/30 text-green-600",
};

export function TemplateCard({ template }: { template: EmailTemplateData }) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [enabled, setEnabled] = useState(template.isEnabled);
  const [subject, setSubject] = useState(template.subject);
  const [preheader, setPreheader] = useState(template.preheader);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "err" | null>(null);
  const [syncedAt, setSyncedAt] = useState({
    enabled: template.isEnabled,
    subject: template.subject,
    preheader: template.preheader,
  });

  if (
    syncedAt.enabled !== template.isEnabled ||
    syncedAt.subject !== template.subject ||
    syncedAt.preheader !== template.preheader
  ) {
    setSyncedAt({
      enabled: template.isEnabled,
      subject: template.subject,
      preheader: template.preheader,
    });
    setEnabled(template.isEnabled);
    setSubject(template.subject);
    setPreheader(template.preheader);
  }

  async function handleToggle() {
    const next = !enabled;
    setToggling(true);
    setEnabled(next);
    try {
      await updateEmailTemplate(template.type, { isEnabled: next });
    } finally {
      setToggling(false);
    }
    startTransition(() => router.refresh());
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateEmailTemplate(template.type, { subject, preheader });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
    startTransition(() => router.refresh());
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await sendTestEmail(template.type);
      setTestResult(res.success ? "ok" : "err");
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      className={`bg-card rounded-xl border shadow-sm transition ${
        enabled ? "border-card-border" : "border-card-border opacity-60"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <ChevronRight
              size={14}
              className={`text-muted shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-black text-foreground">{template.label}</p>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    RECIPIENT_COLORS[template.recipient] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {RECIPIENT_LABELS[template.recipient] ?? template.recipient}
                </span>
              </div>
              <p className="text-xs text-muted font-medium truncate mt-0.5">{subject}</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleToggle}
          disabled={toggling}
          className="ml-4 shrink-0 flex items-center gap-1.5 text-xs font-bold transition-colors disabled:opacity-50"
        >
          {toggling ? (
            <Loader2 size={18} className="animate-spin text-muted" />
          ) : enabled ? (
            <ToggleRight size={22} className="text-accent" />
          ) : (
            <ToggleLeft size={22} className="text-muted" />
          )}
          <span className={enabled ? "text-accent" : "text-muted"}>
            {enabled ? "Activo" : "Inactivo"}
          </span>
        </button>
      </div>

      {expanded && (
        <TemplateCardEditor
          templateId={template.id}
          subject={subject}
          preheader={preheader}
          saving={saving}
          saved={saved}
          testing={testing}
          testResult={testResult}
          onSubjectChange={setSubject}
          onPreheaderChange={setPreheader}
          onTest={handleTest}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
