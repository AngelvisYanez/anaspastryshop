"use client";

import { useRealtimeKitSelector } from "@cloudflare/realtimekit-react";
import { useState } from "react";
import { Users, Mic, MicOff, Video, VideoOff, UserMinus, UserCheck, UserX, ChevronRight, ChevronLeft } from "lucide-react";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  ON_STAGE:                  { label: "En escenario", color: "bg-green-100 text-green-700" },
  REQUESTED_TO_JOIN_STAGE:   { label: "Solicitando",  color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED_TO_JOIN_STAGE:    { label: "Aceptado",     color: "bg-blue-100 text-blue-700" },
  OFF_STAGE:                 { label: "Espectador",   color: "bg-gray-100 text-gray-500" },
};

export default function WebinarHostPanel({ client }: { client: any }) {
  const [open, setOpen] = useState(true);

  const participants = useRealtimeKitSelector((m: any) =>
    [...m.participants.joined.values()]
  );

  const requesting = participants.filter((p: any) => p.stageStatus === "REQUESTED_TO_JOIN_STAGE");
  const onStage    = participants.filter((p: any) => p.stageStatus === "ON_STAGE" || p.stageStatus === "ACCEPTED_TO_JOIN_STAGE");
  const offStage   = participants.filter((p: any) => p.stageStatus === "OFF_STAGE" || !p.stageStatus);

  async function grantAccess(participantId: string) {
    try { await client.stage.grantAccess([participantId]); } catch {}
  }

  async function removeFromStage(participantId: string) {
    try { await client.stage.leaveStage(participantId); } catch {}
  }

  async function toggleAudio(participant: any) {
    try {
      if (participant.audioEnabled) await participant.disableAudio();
      else await participant.enableAudio();
    } catch {}
  }

  async function toggleVideo(participant: any) {
    try {
      if (participant.videoEnabled) await participant.disableVideo();
      else await participant.enableVideo();
    } catch {}
  }

  async function kickParticipant(participant: any) {
    try { await participant.kick(); } catch {}
  }

  return (
    <div className={`absolute top-4 right-4 bottom-4 transition-all duration-300 z-50 flex flex-col ${open ? "w-72" : "w-10"}`}>
      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#C9A84C] text-white rounded-full flex items-center justify-center shadow-lg z-10"
      >
        {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {open && (
        <div className="bg-[#0B1F3A]/95 backdrop-blur-sm rounded-lg flex flex-col h-full overflow-hidden border border-white/10">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <Users size={16} className="text-[#C9A84C]" />
            <span className="text-white font-bold text-sm">Control de participantes</span>
            <span className="ml-auto bg-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-black px-2 py-0.5 rounded-full">
              {participants.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {/* Solicitudes */}
            {requesting.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-2 ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                  Solicitando hablar ({requesting.length})
                </p>
                <div className="space-y-1.5">
                  {requesting.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5">
                      <Avatar name={p.name} />
                      <span className="text-white text-xs font-bold flex-1 truncate">{p.name}</span>
                      <button
                        onClick={() => grantAccess(p.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <UserCheck size={11} /> Aceptar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* En escenario */}
            {onStage.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-green-400 mb-2 ml-1">
                  En escenario ({onStage.length})
                </p>
                <div className="space-y-1.5">
                  {onStage.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">
                      <Avatar name={p.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[8px] font-bold ${p.audioEnabled ? "text-green-400" : "text-gray-500"}`}>
                            {p.audioEnabled ? "🎤" : "🔇"}
                          </span>
                          <span className={`text-[8px] font-bold ${p.videoEnabled ? "text-green-400" : "text-gray-500"}`}>
                            {p.videoEnabled ? "📷" : "📵"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleAudio(p)}
                          title={p.audioEnabled ? "Silenciar micrófono" : "Activar micrófono"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${p.audioEnabled ? "bg-white/10 hover:bg-red-500/30 text-white" : "bg-red-500/20 hover:bg-green-500/30 text-red-400"}`}
                        >
                          {p.audioEnabled ? <Mic size={12} /> : <MicOff size={12} />}
                        </button>
                        <button
                          onClick={() => toggleVideo(p)}
                          title={p.videoEnabled ? "Apagar cámara" : "Activar cámara"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${p.videoEnabled ? "bg-white/10 hover:bg-red-500/30 text-white" : "bg-red-500/20 hover:bg-green-500/30 text-red-400"}`}
                        >
                          {p.videoEnabled ? <Video size={12} /> : <VideoOff size={12} />}
                        </button>
                        <button
                          onClick={() => removeFromStage(p.id)}
                          title="Remover del escenario"
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-orange-500/30 text-white flex items-center justify-center transition-all"
                        >
                          <UserMinus size={12} />
                        </button>
                        <button
                          onClick={() => kickParticipant(p)}
                          title="Expulsar de la sala"
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-600/40 text-white flex items-center justify-center transition-all"
                        >
                          <UserX size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Espectadores */}
            {offStage.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                  Espectadores ({offStage.length})
                </p>
                <div className="space-y-1.5">
                  {offStage.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                      <Avatar name={p.name} />
                      <span className="text-gray-300 text-xs font-medium flex-1 truncate">{p.name}</span>
                      <button
                        onClick={() => grantAccess(p.id)}
                        title="Invitar al escenario"
                        className="flex items-center gap-1 bg-[#C9A84C]/30 hover:bg-[#C9A84C]/60 text-[#C9A84C] text-[10px] font-black px-2 py-1.5 rounded-lg transition-all"
                      >
                        <UserCheck size={11} /> Invitar
                      </button>
                      <button
                        onClick={() => kickParticipant(p)}
                        title="Expulsar de la sala"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-600/40 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                      >
                        <UserX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {participants.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs font-medium">
                No hay participantes aún
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-[9px] text-gray-500 font-medium text-center">
              Solo tú ves este panel de control
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name?.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase() || "?";
  return (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A84C] to-purple-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  );
}
