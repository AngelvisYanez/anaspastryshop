"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  Bell,
} from "lucide-react";
import { sendNewsletter, deleteNewsletterSubscriber } from "@/lib/actions/newsletter";
import type { EmailTemplateData } from "@/lib/email-template-defaults";
import { NewsletterStats } from "@/components/NewsletterStats";
import { NewsletterResultBanner } from "@/components/NewsletterResultBanner";
import { TemplateCard } from "./EmailTemplateCard";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  subscribedAt: Date;
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
    <td style="border-radius:50px;background-color:#C51E75;">
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
    <td style="border-radius:50px;background-color:#C51E75;">
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
    <td style="border-radius:50px;background-color:#C51E75;">
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
    try {
      const res = await sendNewsletter(subject, title, preheader, content);
      if (res.error) setResult({ error: res.error });
      else setResult({ sent: res.sent, failed: res.failed });
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteNewsletterSubscriber(id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <NewsletterStats
        total={subscribers.length}
        active={activeCount}
        inactive={subscribers.filter((s) => !s.isActive).length}
      />

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
                  className="px-3 py-1.5 text-xs font-bold bg-section-alt hover:bg-accent-solid hover:text-white text-foreground rounded-md transition border border-card-border"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="email-subject" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Asunto *</label>
              <input
                id="email-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Nuevas recetas de temporada — Ana's Pastry Shop"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label htmlFor="email-title" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Título Principal *</label>
              <input
                id="email-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Hay novedades esperándote en la cocina"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label htmlFor="email-preheader" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Texto de Previsualización</label>
              <input
                id="email-preheader"
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Texto corto visible en el preview del email"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label htmlFor="email-content" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">Contenido HTML *</label>
              <textarea
                id="email-content"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Escribe el contenido aquí...</p>"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
              />
            </div>
          </div>

          <NewsletterResultBanner result={result} />

          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !title.trim() || !content.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-accent-solid hover:bg-accent-solid-hover disabled:opacity-50 text-white font-black py-3 px-6 rounded-lg transition shadow-sm"
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
                      aria-label={`Eliminar suscripción de ${s.email}`}
                      className="ml-4 p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition disabled:opacity-50"
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                active
                  ? "bg-accent-solid text-white shadow-md shadow-accent/20"
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
