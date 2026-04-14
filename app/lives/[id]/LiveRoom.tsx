"use client";

import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";

interface Props {
  liveId: string;
}

export default function LiveRoom({ liveId }: Props) {
  const [client, initClient] = useRealtimeKitClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lives/${liveId}/room`, { method: "POST" })
      .then((r) => r.json())
      .then(({ token, error: err }) => {
        if (err) {
          setError(err);
          return;
        }
        return initClient({ authToken: token, defaults: { audio: false, video: false } });
      })
      .catch(() => setError("Error al conectar con la sala"))
      .finally(() => setLoading(false));
  }, [liveId, initClient]);

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
        <div className="text-center">
          <p className="text-red-400 font-bold text-lg mb-2">Error al unirse</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return <RtkMeeting meeting={client!} style={{ height: "100vh", width: "100%" }} />;
}
