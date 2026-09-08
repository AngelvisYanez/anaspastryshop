"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Bell,
  ToggleLeft,
  ToggleRight,
  Save,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
import { sendNewsletter, deleteNewsletterSubscriber } from "@/lib/actions/newsletter";
import { updateEmailTemplate, sendTestEmail } from "@/lib/actions/email-templates";
import type { EmailTemplateData } from "@/lib/email-template-defaults";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  subscribedAt: Date;
};

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

const NEWSLETTER_TEMPLATES = [
  {
    id: "bienvenida",
    label: "Bienvenida",
    subject: "¡Bienvenido a Ana's Pastry Shop!",
    title: "Empieza tu camino en la repostería",
    preheader: "Tu pasión por la pastelería comienza aquí.",
    content: `<p>Nos alegra tenerte en nuestra comunidad de repostería. En Ana's Pastry Shop encontrarás todo lo necesario para elaborar postres y creaciones de nivel profesional.</p>
<p style="margin-top:16px;">Explora nuestros cursos online, inscríbete a nuestros workshops presenciales y aprende de la mano de chefs apasionados.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
  <tr>
    <td style="border-radius:50px;background-color:#D92080;">
      <a href="/cursos" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:50px;">Ver Cursos &rarr;</a>
    </td>
  </tr>
</table>`,
  },
  {
    id: "novedad",
    label: "Nuevo Curso o Workshop",
    subject: "Nueva formación disponible en Ana's Pastry Shop",
    title: "Nueva clase esperándote",
    preheader: "Descubre las últimas técnicas y recetas.",
    content: `<p>Hemos lanzado una nueva formación en la plataforma. Ingresa ahora para descubrir las nuevas recetas y técnicas paso a paso.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
  <tr>
    <td style="border-radius:50px;background-color:#D92080;">
      <a href="/cursos" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:50px;">Ver Formaciones &rarr;</a>
    </td>
  </tr>
</table>`,
  },
  {
    id: "workshop",
    label: "Promoción Cursos Online",
    subject: "Aprende repostería a tu propio ritmo — Ana's Pastry Shop",
    title: "Cursos online con acceso permanente",
    preheader: "Aprende paso a paso con la Chef Anaís.",
    content: `<p>Accede a nuestras clases en video paso a paso, con guías descargables e ingredientes detallados para crear los postres más deliciosos.</p>
<ul style="margin-top:8px;padding-left:20px;color:#374151;line-height:2;">
  <li>Video clases en alta definición</li>
  <li>Módulos ordenados y detallados</li>
  <li>Acceso permanente a tu ritmo</li>
</ul>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
  <tr>
    <td style="border-radius:50px;background-color:#D92080;">
      <a href="/cursos?tipo=online" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:50px;">Explorar Cursos Online &rarr;</a>
    </td>
  </tr>
</table>`,
  },
];

function NewsletterTab({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent?: number; failed?: number; error?: string } | null>(null);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function applyTemplate(templateId: string) {
    const t = NEWSLETTER_TEMPLATES.find((t) => t.id === templateId);
    if (!t) return;
    setSubject(t.subject);
    setTitle(t.title);
    setPreheader(t.preheader);
    setContent(t.content);
  }

  async function handleSend() {
    if (!subject.trim() || !title.trim() || !content.trim()) return;
    setSending(true);
    setResult(null);
    const res = await sendNewsletter(subject, title, preheader, content);
    setSending(false);
    if (res.error) setResult({ error: res.error });
    else setResult({ sent: res.sent, failed: res.failed });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteNewsletterSubscriber(id);
    setDeletingId(null);
    router.refresh();
  }

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Total</p>
          <p className="text-3xl font-black text-foreground">{subscribers.length}</p>
          <p className="text-xs text-muted font-medium mt-1">suscriptores registrados</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Activos</p>
          <p className="text-3xl font-black text-accent">{activeCount}</p>
          <p className="text-xs text-muted font-medium mt-1">recibirán el próximo envío</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-card-border shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-1">Inactivos</p>
          <p className="text-3xl font-black text-foreground">{subscribers.filter((s) => !s.isActive).length}</p>
          <p className="text-xs text-muted font-medium mt-1">cancelaron suscripción</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-card-border shadow-sm p-6">
          <h2 className="text-base font-black text-foreground mb-4">Redactar Campaña</h2>

          <div className="mb-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-2">Plantilla rápida</p>
            <div className="flex flex-wrap gap-2">
              {NEWSLETTER_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className="px-3 py-1.5 text-xs font-bold bg-section-alt hover:bg-accent hover:text-white text-foreground rounded-md transition-all border border-card-border"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Asunto *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Nuevas recetas de temporada — Ana's Pastry Shop"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Título Principal *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Hay novedades esperándote en la cocina"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Texto de Previsualización</label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Texto corto visible en el preview del email"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Contenido HTML *</label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Escribe el contenido aquí...</p>"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
              />
            </div>
          </div>

          {result && (
            <div className={`mt-4 rounded-lg p-3 flex items-start gap-3 ${result.error ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"}`}>
              {result.error ? (
                <><XCircle size={15} className="text-red-500 mt-0.5 shrink-0" /><p className="text-sm font-bold text-red-600 dark:text-red-400">{result.error}</p></>
              ) : (
                <><CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" /><p className="text-sm font-bold text-green-700 dark:text-green-400">Enviado: {result.sent} exitosos, {result.failed} fallidos.</p></>
              )}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !title.trim() || !content.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-black py-3 px-6 rounded-lg transition-all shadow-sm"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending ? "Enviando..." : `Enviar a ${activeCount} suscriptor${activeCount !== 1 ? "es" : ""} activo${activeCount !== 1 ? "s" : ""}`}
          </button>
        </div>

        <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSubscribers((v) => !v)}
            className="w-full flex items-center justify-between p-6 hover:bg-card-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users size={16} className="text-accent" />
              <h2 className="text-base font-black text-foreground">Suscriptores ({subscribers.length})</h2>
            </div>
            {showSubscribers ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
          </button>

          {showSubscribers && (
            <div className="border-t border-card-border divide-y divide-card-border max-h-[460px] overflow-y-auto custom-scrollbar">
              {subscribers.length === 0 ? (
                <div className="p-8 text-center"><p className="text-muted font-bold">No hay suscriptores aún.</p></div>
              ) : (
                subscribers.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-3 hover:bg-section-alt transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{s.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.name && <p className="text-xs text-muted font-medium">{s.name}</p>}
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-100 dark:bg-green-950/30 text-green-600" : "bg-red-100 dark:bg-red-950/30 text-red-500"}`}>
                          {s.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="ml-4 p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all disabled:opacity-50"
                    >
                      {deletingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: EmailTemplateData }) {
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

  async function handleToggle() {
    setToggling(true);
    setEnabled((v) => !v);
    await updateEmailTemplate(template.type, { isEnabled: !enabled });
    setToggling(false);
    startTransition(() => router.refresh());
  }

  async function handleSave() {
    setSaving(true);
    await updateEmailTemplate(template.type, { subject, preheader });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    startTransition(() => router.refresh());
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const res = await sendTestEmail(template.type);
    setTesting(false);
    setTestResult(res.success ? "ok" : "err");
    setTimeout(() => setTestResult(null), 3000);
  }

  return (
    <div className={`bg-card rounded-xl border shadow-sm transition-all ${enabled ? "border-card-border" : "border-card-border opacity-60"}`}>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <ChevronRight size={14} className={`text-muted shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-black text-foreground">{template.label}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${RECIPIENT_COLORS[template.recipient] ?? "bg-gray-100 text-gray-600"}`}>
                  {RECIPIENT_LABELS[template.recipient] ?? template.recipient
                }</span>
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
          <span className={enabled ? "text-accent" : "text-muted"}>{enabled ? "Activo" : "Inactivo"}</span>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-card-border px-5 pb-5 pt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Asunto del Email</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Texto de Previsualización</label>
            <input
              type="text"
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              placeholder="Texto corto visible en el preview del email"
              className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 bg-section-alt hover:bg-card-hover border border-card-border disabled:opacity-50 text-foreground font-bold py-2 px-4 rounded-lg text-sm transition-all"
              title="Enviar prueba"
            >
              {testing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : testResult === "ok" ? (
                <CheckCircle2 size={13} className="text-green-500" />
              ) : testResult === "err" ? (
                <XCircle size={13} className="text-red-500" />
              ) : (
                <FlaskConical size={13} className="text-muted" />
              )}
              {testing ? "Enviando..." : testResult === "ok" ? "Enviado" : testResult === "err" ? "Error" : "Enviar prueba"}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-black py-2 px-5 rounded-lg text-sm transition-all shadow-sm"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={13} />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsTab({ templates }: { templates: EmailTemplateData[] }) {
  const userTemplates = templates.filter((t) => t.recipient === "USER");
  const otherTemplates = templates.filter((t) => t.recipient !== "USER");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-4">Emails a Usuarios</p>
        <div className="space-y-3">
          {userTemplates.map((t) => (
            <TemplateCard key={t.type} template={t} />
          ))}
        </div>
      </div>

      {otherTemplates.length > 0 && (
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-4">Otros Emails</p>
          <div className="space-y-3">
            {otherTemplates.map((t) => (
              <TemplateCard key={t.type} template={t} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-section-alt rounded-xl p-5 border border-card-border">
        <p className="text-xs font-bold text-muted leading-relaxed">
          Los cambios en el asunto y previsualización se aplican a los próximos emails enviados. Desactivar un tipo impide su envío automático.
        </p>
      </div>
    </div>
  );
}

const TABS = [
  { id: "newsletter", label: "Newsletter", icon: Send },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
] as const;

export default function EmailsClient({
  subscribers,
  templates,
}: {
  subscribers: Subscriber[];
  templates: EmailTemplateData[];
}) {
  const [activeTab, setActiveTab] = useState<"newsletter" | "notificaciones">("newsletter");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-card-border pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                active
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-muted hover:text-foreground hover:bg-section-alt"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "newsletter" && <NewsletterTab subscribers={subscribers} />}
      {activeTab === "notificaciones" && <NotificationsTab templates={templates} />}
    </div>
  );
}
