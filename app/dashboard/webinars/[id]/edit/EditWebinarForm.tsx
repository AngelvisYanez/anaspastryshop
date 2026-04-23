"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { updateWebinar } from "@/lib/actions/webinars";

type Webinar = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  scheduledAt: Date | null;
  maxParticipants: number | null;
};

function toDatetimeLocal(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function EditWebinarForm({ webinar }: { webinar: Webinar }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: webinar.title,
    description: webinar.description ?? "",
    thumbnail: webinar.thumbnail ?? "",
    scheduledAt: toDatetimeLocal(webinar.scheduledAt),
    maxParticipants: webinar.maxParticipants?.toString() ?? "",
  });

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("El título es requerido"); return; }
    setSaving(true);
    setError(null);
    const result = await updateWebinar(webinar.id, {
      title: form.title,
      description: form.description || undefined,
      thumbnail: form.thumbnail || undefined,
      scheduledAt: form.scheduledAt || undefined,
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0B1F3A]">Editar Webinar</h1>
        <p className="text-gray-400 font-medium">Modifica los detalles de la sesión.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold">{error}</div>}
        {saved && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold">Guardado correctamente</div>}

        <div>
          <label htmlFor="edit-webinar-title" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Título *</label>
          <input
            id="edit-webinar-title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#C9A84C] transition-all"
          />
        </div>

        <div>
          <label htmlFor="edit-webinar-desc" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Descripción</label>
          <textarea
            id="edit-webinar-desc"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#C9A84C] transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-webinar-date" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Fecha y hora</label>
            <input
              id="edit-webinar-date"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setField("scheduledAt", e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#C9A84C] transition-all"
            />
          </div>
          <div>
            <label htmlFor="edit-webinar-max" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Máx. participantes</label>
            <input
              id="edit-webinar-max"
              type="number"
              min="1"
              value={form.maxParticipants}
              onChange={(e) => setField("maxParticipants", e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#C9A84C] transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-webinar-thumb" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">URL de imagen</label>
          <input
            id="edit-webinar-thumb"
            value={form.thumbnail}
            onChange={(e) => setField("thumbnail", e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#C9A84C] transition-all"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-2xl font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-white py-3 rounded-2xl font-bold text-sm hover:bg-[#B89640] transition-all disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
