"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video } from "lucide-react";
import { createWebinar } from "@/lib/actions/webinars";

export default function CreateWebinarForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    scheduledAt: "",
    maxParticipants: "",
  });

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("El título es requerido"); return; }
    setSaving(true);
    setError(null);
    const result = await createWebinar({
      title: form.title,
      description: form.description || undefined,
      thumbnail: form.thumbnail || undefined,
      scheduledAt: form.scheduledAt || undefined,
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    router.push("/dashboard/webinars");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Nuevo Webinar</h1>
        <p className="text-muted font-medium">Crea una sesión en tiempo real con RealtimeKit.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-card-border shadow-sm space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-bold">{error}</div>
        )}

        <div>
          <label htmlFor="webinar-title" className="block text-xs font-black uppercase tracking-widest text-muted mb-2">Título *</label>
          <input
            id="webinar-title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Clase magistral: Crédito en USA"
            className="w-full border border-card-border rounded-lg px-5 py-4 text-sm font-medium text-foreground outline-none focus:border-accent transition-all"
          />
        </div>

        <div>
          <label htmlFor="webinar-desc" className="block text-xs font-black uppercase tracking-widest text-muted mb-2">Descripción</label>
          <textarea
            id="webinar-desc"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Describe el contenido del webinar..."
            rows={3}
            className="w-full border border-card-border rounded-lg px-5 py-4 text-sm font-medium text-foreground outline-none focus:border-accent transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="webinar-date" className="block text-xs font-black uppercase tracking-widest text-muted mb-2">Fecha y hora</label>
            <input
              id="webinar-date"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setField("scheduledAt", e.target.value)}
              className="w-full border border-card-border rounded-lg px-5 py-4 text-sm font-medium text-foreground outline-none focus:border-accent transition-all"
            />
          </div>
          <div>
            <label htmlFor="webinar-max" className="block text-xs font-black uppercase tracking-widest text-muted mb-2">Máx. participantes</label>
            <input
              id="webinar-max"
              type="number"
              min="1"
              value={form.maxParticipants}
              onChange={(e) => setField("maxParticipants", e.target.value)}
              placeholder="100"
              className="w-full border border-card-border rounded-lg px-5 py-4 text-sm font-medium text-foreground outline-none focus:border-accent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="webinar-thumb" className="block text-xs font-black uppercase tracking-widest text-muted mb-2">URL de imagen (opcional)</label>
          <input
            id="webinar-thumb"
            value={form.thumbnail}
            onChange={(e) => setField("thumbnail", e.target.value)}
            placeholder="https://..."
            className="w-full border border-card-border rounded-lg px-5 py-4 text-sm font-medium text-foreground outline-none focus:border-accent transition-all"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-bold text-sm text-muted bg-section-alt hover:bg-section-alt transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-lg font-bold text-sm hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
            {saving ? "Creando..." : "Crear Webinar"}
          </button>
        </div>
      </form>
    </div>
  );
}
