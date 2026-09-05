"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Radio, Eye, EyeOff, Copy, Check } from "lucide-react";
import Link from "next/link";
import { createLive } from "@/lib/actions/lives";

export default function CreateLiveForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [rtmpsUrl, setRtmpsUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [playbackId, setPlaybackId] = useState("");

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createLive({
      title,
      description: description || undefined,
      scheduledAt: scheduledAt || undefined,
      rtmpsUrl: rtmpsUrl || undefined,
      streamKey: streamKey || undefined,
      playbackId: playbackId || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/lives");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/lives"
          className="p-2 hover:bg-card rounded-xl transition-colors border border-transparent hover:border-card-border"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Nuevo Live</h1>
          <p className="text-muted font-medium mt-1">
            Configura los datos de tu transmisión en vivo.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">1</span>
            Información General
          </h2>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Título del Live</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Clase magistral: Dominando herramientas digitales"
              className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Descripción <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué verán los participantes en esta sesión?"
              rows={3}
              className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Fecha y hora programada <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground"
            />
          </div>
        </div>

        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">2</span>
            Configuración OBS / Streaming
          </h2>
          <p className="text-xs text-muted font-medium -mt-2">
            Ingresa las credenciales de tu servicio de streaming (Cloudflare Stream, Restream, etc.) para configurar OBS.
          </p>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              RTMPS Server URL <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                value={rtmpsUrl}
                onChange={(e) => setRtmpsUrl(e.target.value)}
                placeholder="rtmps://live.cloudflare.com:443/live/"
                className="flex-1 bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all font-mono text-sm text-foreground"
              />
              {rtmpsUrl && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(rtmpsUrl, "rtmps")}
                  className="px-4 py-3 bg-section-alt border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
                >
                  {copied === "rtmps" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Stream Key <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Tu clave de transmisión"
                className="flex-1 bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all font-mono text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-4 py-3 bg-section-alt border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {streamKey && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(streamKey, "key")}
                  className="px-4 py-3 bg-section-alt border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
                >
                  {copied === "key" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Playback URL / ID <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <input
              value={playbackId}
              onChange={(e) => setPlaybackId(e.target.value)}
              placeholder="ID o URL que usarán los espectadores para ver el live"
              className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-sm text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1F3A] text-white py-5 rounded-lg font-bold shadow-xl hover:bg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Radio size={20} />}
          {loading ? "Creando..." : "Crear Live"}
        </button>
      </form>
    </div>
  );
}
