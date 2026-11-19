"use client";

import { useState } from "react";
import SectionTabs from "../SectionTabs";
import { SubscriberList, type Subscriber } from "./SubscriberList";
import { sendNewsletter } from "@/lib/actions/newsletter";
import { Loader2, Send } from "lucide-react";
import { NewsletterStats } from "@/components/NewsletterStats";
import { NewsletterResultBanner } from "@/components/NewsletterResultBanner";



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

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent?: number; failed?: number; whatsappQueued?: number; error?: string } | null>(null);

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
      else setResult({ sent: res.sent, failed: res.failed, whatsappQueued: res.whatsappQueued });
    } finally {
      setSending(false);
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

      <SectionTabs label="Secciones de newsletter" tabs={[
        { label: "Campaña", content: (
          <div className="bg-card rounded-xl border border-card-border shadow-sm p-4 sm:p-6">
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
              : `Enviar boletín por email y WhatsApp`}
          </button>
        </div>
        ) },
        { label: "Suscriptores", count: subscribers.length, content: <SubscriberList subscribers={subscribers} /> },
      ]} />
    </div>
  );
}
