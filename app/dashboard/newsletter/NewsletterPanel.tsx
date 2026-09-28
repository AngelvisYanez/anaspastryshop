"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendNewsletter, deleteNewsletterSubscriber } from "@/lib/actions/newsletter";
import {
  Send, Loader2, Trash2,
  ChevronDown, ChevronUp, Users,
} from "lucide-react";
import { NewsletterStats } from "@/components/NewsletterStats";
import { NewsletterResultBanner } from "@/components/NewsletterResultBanner";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  subscribedAt: Date;
};

const TEMPLATES = [
  {
    id: "bienvenida",
    label: "Bienvenida",
    subject: "¡Bienvenido a Ana's Pastry Shop!",
    title: "Empieza tu camino en la repostería fina",
    preheader: "Tu pasión por la pastelería comienza aquí.",
    content: `<p>Nos alegra tenerte en nuestra comunidad de repostería. En Ana's Pastry Shop encontrarás recetas profesionales, técnicas de vitrina y workshops intensivos de la mano de la Chef Anais Flores.</p>
<p style="margin-top:16px;">Explora nuestros cursos online, únete a las masterclasses en vivo y aprende a elaborar postres irresistibles a tu propio ritmo.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
  <tr>
    <td style="border-radius:50px;background-color:#C51E75;">
      <a href="https://anaspastryshop.com/cursos" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:50px;">Ver Cursos &rarr;</a>
    </td>
  </tr>
</table>`,
  },
  {
    id: "novedad",
    label: "Nuevo Contenido",
    subject: "Nueva formación disponible en Ana's Pastry Shop",
    title: "Hay nuevas recetas esperándote",
    preheader: "Descubre las últimas clases y workshops de Ana's Pastry Shop.",
    content: `<p>Hemos añadido nuevas formaciones a la plataforma. Entra ahora y descubre técnicas avanzadas, recetas explicadas al detalle y secretos de vitrina.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
  <tr>
    <td style="border-radius:50px;background-color:#C51E75;">
      <a href="https://anaspastryshop.com/dashboard" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:50px;">Ver Novedades &rarr;</a>
    </td>
  </tr>
</table>`,
  },
];

export default function NewsletterPanel({ subscribers }: { subscribers: Subscriber[] }) {
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
    const t = TEMPLATES.find((t) => t.id === templateId);
    if (!t) return;
    setSubject(t.subject);
    setTitle(t.title);
    setPreheader(t.preheader);
    setContent(t.content);
    setResult(null);
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
            <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-2">
              Plantilla rápida
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
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
              <label htmlFor="nl-subject" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">
                Asunto *
              </label>
              <input
                id="nl-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Nuevas recetas de temporada — Ana's Pastry Shop"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label htmlFor="nl-title" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">
                Título Principal *
              </label>
              <input
                id="nl-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Hay novedades esperándote en la cocina"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label htmlFor="nl-preheader" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">
                Texto de Previsualización
              </label>
              <input
                id="nl-preheader"
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Texto corto visible en el preview del email"
                className="w-full bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label htmlFor="nl-content" className="block text-[11px] font-black uppercase tracking-widest text-muted mb-1.5">
                Contenido HTML *
              </label>
              <textarea
                id="nl-content"
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
            className="mt-4 w-full flex items-center justify-center gap-2 bg-accent-solid hover:bg-accent-solid-hover disabled:opacity-50 text-white font-black py-3 px-6 rounded-lg transition shadow-md shadow-accent-solid/20"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending
              ? "Enviando..."
              : `Enviar a ${activeCount} suscriptor${activeCount !== 1 ? "es" : ""} activo${activeCount !== 1 ? "s" : ""}`}
          </button>
        </div>

        <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSubscribers((v) => !v)}
            className="w-full flex items-center justify-between p-6 hover:bg-card-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users size={16} className="text-accent" />
              <h2 className="text-base font-black text-foreground">
                Suscriptores ({subscribers.length})
              </h2>
            </div>
            {showSubscribers ? (
              <ChevronUp size={15} className="text-muted" />
            ) : (
              <ChevronDown size={15} className="text-muted" />
            )}
          </button>

          {showSubscribers && (
            <div className="border-t border-card-border divide-y divide-card-border max-h-[460px] overflow-y-auto custom-scrollbar">
              {subscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted font-bold">No hay suscriptores aún.</p>
                </div>
              ) : (
                subscribers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-section-alt transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{s.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.name && <p className="text-xs text-muted font-medium">{s.name}</p>}
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            s.isActive
                              ? "bg-green-100 dark:bg-green-950/30 text-green-600"
                              : "bg-red-100 dark:bg-red-950/30 text-red-500"
                          }`}
                        >
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
                      {deletingId === s.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
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
