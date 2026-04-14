"use client";

import { useRealtimeKitClient, RealtimeKitProvider } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WebinarHostPanel from "./WebinarHostPanel";
import WebinarParticipantBar from "./WebinarParticipantBar";

interface Props {
  webinarId: string;
  isHost: boolean;
}

export default function WebinarRoom({ webinarId, isHost }: Props) {
  const router = useRouter();
  const [client, initClient] = useRealtimeKitClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/webinars/${webinarId}/room`, { method: "POST" })
      .then((r) => r.json())
      .then(({ token, error: err }) => {
        if (err) { setError(err); return; }
        return initClient({ authToken: token, defaults: { audio: false, video: false } });
      })
      .catch(() => setError("No se pudo conectar a la sala"))
      .finally(() => setLoading(false));
  }, [webinarId, initClient]);

  useEffect(() => {
    const leaveSession = () => {
      fetch(`/api/webinars/${webinarId}/room`, { method: "DELETE", keepalive: true });
    };
    window.addEventListener("beforeunload", leaveSession);
    return () => {
      window.removeEventListener("beforeunload", leaveSession);
      leaveSession();
    };
  }, [webinarId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1A2E]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5A4FCF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Conectando a la sala...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1A2E]">
        <div className="text-center max-w-sm">
          <p className="text-red-400 font-bold text-lg mb-2">No se puede acceder</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/planes")}
            className="bg-[#5A4FCF] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#483dbb] transition-all"
          >
            Ver planes de suscripción
          </button>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <RealtimeKitProvider value={client}>
      <div className="relative h-screen w-full">
        <RtkMeeting meeting={client} style={{ height: "100%", width: "100%" }} />
        {isHost ? (
          <WebinarHostPanel client={client} />
        ) : (
          <WebinarParticipantBar client={client} />
        )}
      </div>
    </RealtimeKitProvider>
  );
}
