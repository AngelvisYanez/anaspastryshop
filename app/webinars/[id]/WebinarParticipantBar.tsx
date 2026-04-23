"use client";

import { useRealtimeKitSelector } from "@cloudflare/realtimekit-react";
import { useState } from "react";
import { Hand, Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";

export default function WebinarParticipantBar({ client }: { client: any }) {
  const [loading, setLoading] = useState(false);

  const stageStatus = useRealtimeKitSelector((m: any) => m.self.stageStatus as string);
  const audioEnabled = useRealtimeKitSelector((m: any) => m.self.audioEnabled as boolean);
  const videoEnabled = useRealtimeKitSelector((m: any) => m.self.videoEnabled as boolean);

  const isOnStage = stageStatus === "ON_STAGE" || stageStatus === "ACCEPTED_TO_JOIN_STAGE";
  const isRequesting = stageStatus === "REQUESTED_TO_JOIN_STAGE";

  async function handleRaiseHand() {
    setLoading(true);
    try { await client.stage.joinStage(); } catch {}
    setLoading(false);
  }

  async function toggleAudio() {
    try {
      if (audioEnabled) { await client.self.disableAudio(); }
      else { await client.self.enableAudio(); }
    } catch {}
  }

  async function toggleVideo() {
    try {
      if (videoEnabled) { await client.self.disableVideo(); }
      else { await client.self.enableVideo(); }
    } catch {}
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#0B1F3A]/90 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl">

        {/* Estado del escenario */}
        {!isOnStage && (
          <div className="flex items-center gap-3">
            {isRequesting ? (
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-2">
                <Loader2 size={14} className="text-yellow-400 animate-spin" />
                <span className="text-yellow-300 text-xs font-bold">Esperando aprobación del host...</span>
              </div>
            ) : (
              <button
                onClick={handleRaiseHand}
                disabled={loading}
                className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B89640] disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Hand size={15} />}
                Solicitar usar micrófono / cámara
              </button>
            )}
          </div>
        )}

        {/* Controles cuando está en escenario */}
        {isOnStage && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-1.5 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-[10px] font-black uppercase tracking-widest">En escenario</span>
            </div>

            <button
              onClick={toggleAudio}
              title={audioEnabled ? "Silenciar micrófono" : "Activar micrófono"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold ${
                audioEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-red-500/30 hover:bg-red-500/50 text-red-300"
              }`}
            >
              {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={toggleVideo}
              title={videoEnabled ? "Apagar cámara" : "Activar cámara"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold ${
                videoEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-red-500/30 hover:bg-red-500/50 text-red-300"
              }`}
            >
              {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
