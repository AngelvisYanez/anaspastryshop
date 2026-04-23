"use client";

import { useRealtimeKitClient, RealtimeKitProvider } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WebinarHostPanel from "./WebinarHostPanel";
import WebinarParticipantBar from "./WebinarParticipantBar";
import { leaveWebinarRoom } from "@/lib/actions/webinars";

interface Props {
  webinarId: string;
  isHost: boolean;
  token: string | null;
  tokenError: string | null;
}

export default function WebinarRoom({ webinarId, isHost, token, tokenError }: Props) {
  const router = useRouter();
  const [client, initClient] = useRealtimeKitClient();
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(!!token);
  const error = tokenError ?? runtimeError;

  useEffect(() => {
    if (!token) return;
    initClient({ authToken: token, defaults: { audio: false, video: false } })
      .catch(() => setRuntimeError("No se pudo conectar a la sala"))
      .finally(() => setConnecting(false));
  }, [token, initClient]);

  useEffect(() => {
    const handleLeave = () => { leaveWebinarRoom(webinarId); };
    window.addEventListener("beforeunload", handleLeave);
    return () => {
      window.removeEventListener("beforeunload", handleLeave);
      leaveWebinarRoom(webinarId);
    };
  }, [webinarId]);

  if (connecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B1F3A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Conectando a la sala...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B1F3A]">
        <div className="text-center max-w-sm">
          <p className="text-red-400 font-bold text-lg mb-2">No se puede acceder</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/planes")}
            className="bg-[#C9A84C] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#B89640] transition-all"
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
