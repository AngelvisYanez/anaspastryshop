"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Copy, Check, Eye, EyeOff, Radio, Square, Clock } from "lucide-react";
import Link from "next/link";
import { updateLive, updateLiveStatus } from "@/lib/actions/lives";

type Status = "SCHEDULED" | "LIVE" | "ENDED";

type Live = {
  id: string;
  title: string;
  description: string | null;
  streamKey: string | null;
  rtmpsUrl: string | null;
  playbackId: string | null;
  scheduledAt: Date | null;
  status: string;
};

const STATUS_LABELS: Record<Status, { label: string; class: string; dot: string }> = {
  SCHEDULED: { label: "Programado", class: "bg-indigo-50 text-[#5A4FCF]", dot: "bg-indigo-400" },
  LIVE: { label: "En Vivo", class: "bg-green-50 text-green-600", dot: "bg-green-500 animate-pulse" },
  ENDED: { label: "Finalizado", class: "bg-gray-100 text-gray-400", dot: "bg-gray-300" },
};

export default function EditLiveForm({ live }: { live: Live }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [title, setTitle] = useState(live.title);
  const [description, setDescription] = useState(live.description ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    live.scheduledAt ? new Date(live.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [rtmpsUrl, setRtmpsUrl] = useState(live.rtmpsUrl ?? "");
  const [streamKey, setStreamKey] = useState(live.streamKey ?? "");
  const [playbackId, setPlaybackId] = useState(live.playbackId ?? "");
  const [currentStatus, setCurrentStatus] = useState<Status>(live.status as Status);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateLive(live.id, {
      title,
      description: description || undefined,
      scheduledAt: scheduledAt || undefined,
      rtmpsUrl: rtmpsUrl || undefined,
      streamKey: streamKey || undefined,
      playbackId: playbackId || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Cambios guardados correctamente");
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  }

  async function handleStatus(next: Status) {
    setStatusLoading(true);
    await updateLiveStatus(live.id, next);
    setCurrentStatus(next);
    setStatusLoading(false);
  }

  const cfg = STATUS_LABELS[currentStatus] ?? STATUS_LABELS.SCHEDULED;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/lives"
          className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100"
        >
          <ArrowLeft size={24} className="text-[#1A1A2E]" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tighter">Editar Live</h1>
          <p className="text-gray-500 font-medium mt-1">{live.title}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Estado actual</p>
            <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${cfg.class}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <div className="flex gap-2">
            {currentStatus === "SCHEDULED" && (
              <button
                onClick={() => handleStatus("LIVE")}
                disabled={statusLoading}
                className="py-2 px-4 rounded-xl font-bold text-sm bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Radio size={14} /> Iniciar Live
              </button>
            )}
            {currentStatus === "LIVE" && (
              <button
                onClick={() => handleStatus("ENDED")}
                disabled={statusLoading}
                className="py-2 px-4 rounded-xl font-bold text-sm bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Square size={14} /> Finalizar
              </button>
            )}
            {currentStatus === "ENDED" && (
              <button
                onClick={() => handleStatus("SCHEDULED")}
                disabled={statusLoading}
                className="py-2 px-4 rounded-xl font-bold text-sm bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Clock size={14} /> Reactivar
              </button>
            )}
          </div>
        </div>

        {(rtmpsUrl || streamKey) && (
          <div className="border-t border-gray-50 pt-4 mt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Configuración OBS
            </p>
            {rtmpsUrl && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">RTMPS URL</p>
                  <p className="text-xs font-mono text-[#1A1A2E] truncate">{rtmpsUrl}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(rtmpsUrl, "rtmps")}
                  className="ml-3 shrink-0 text-gray-400 hover:text-[#5A4FCF]"
                >
                  {copied === "rtmps" ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>
            )}
            {streamKey && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Stream Key</p>
                  <p className="text-xs font-mono text-[#1A1A2E] truncate">
                    {showKey ? streamKey : "••••••••••••••••"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-gray-400 hover:text-[#5A4FCF]"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(streamKey, "key")}
                    className="text-gray-400 hover:text-[#5A4FCF]"
                  >
                    {copied === "key" ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 font-bold text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-4 font-bold text-sm flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
            <span className="bg-[#5A4FCF] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">1</span>
            Información General
          </h2>

          <div>
            <label htmlFor="edit-live-title" className="block text-sm font-bold text-[#1A1A2E] mb-2">Título</label>
            <input
              id="edit-live-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5A4FCF] transition-all text-[#1A1A2E]"
            />
          </div>

          <div>
            <label htmlFor="edit-live-desc" className="block text-sm font-bold text-[#1A1A2E] mb-2">Descripción</label>
            <textarea
              id="edit-live-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5A4FCF] transition-all text-[#1A1A2E] resize-none"
            />
          </div>

          <div>
            <label htmlFor="edit-live-date" className="block text-sm font-bold text-[#1A1A2E] mb-2">Fecha y hora programada</label>
            <input
              id="edit-live-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5A4FCF] transition-all text-[#1A1A2E]"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
            <span className="bg-[#5A4FCF] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">2</span>
            Configuración OBS / Streaming
          </h2>

          <div>
            <label htmlFor="edit-live-rtmps" className="block text-sm font-bold text-[#1A1A2E] mb-2">RTMPS Server URL</label>
            <div className="flex gap-2">
              <input
                id="edit-live-rtmps"
                value={rtmpsUrl}
                onChange={(e) => setRtmpsUrl(e.target.value)}
                placeholder="rtmps://live.cloudflare.com:443/live/"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5A4FCF] transition-all font-mono text-sm text-[#1A1A2E]"
              />
              {rtmpsUrl && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(rtmpsUrl, "rtmps")}
                  className="px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-[#5A4FCF]"
                >
                  {copied === "rtmps" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-live-key" className="block text-sm font-bold text-[#1A1A2E] mb-2">Stream Key</label>
            <div className="flex gap-2">
              <input
                id="edit-live-key"
                type={showKey ? "text" : "password"}
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Tu clave de transmisión"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5A4FCF] transition-all font-mono text-sm text-[#1A1A2E]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-[#5A4FCF]"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {streamKey && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(streamKey, "key")}
                  className="px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-[#5A4FCF]"
                >
                  {copied === "key" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-live-playback" className="block text-sm font-bold text-[#1A1A2E] mb-2">Playback URL / ID</label>
            <input
              id="edit-live-playback"
              value={playbackId}
              onChange={(e) => setPlaybackId(e.target.value)}
              placeholder="ID o URL para los espectadores"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5A4FCF] transition-all text-sm text-[#1A1A2E]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1A2E] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#5A4FCF] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
