"use client";

import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";

interface Props {
  liveId: string;
  token: string | null;
  tokenError: string | null;
}

export default function LiveRoom({ liveId, token, tokenError }: Props) {
  const [client, initClient] = useRealtimeKitClient();
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(!!token);
  const error = tokenError ?? runtimeError;

  useEffect(() => {
    if (!token) return;
    initClient({ authToken: token, defaults: { audio: false, video: false } })
      .catch(() => setRuntimeError("Error al conectar con la sala"))
      .finally(() => setConnecting(false));
  }, [token, initClient]);

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
        <div className="text-center">
          <p className="text-red-400 font-bold text-lg mb-2">Error al unirse</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return <RtkMeeting meeting={client!} style={{ height: "100vh", width: "100%" }} />;
}
