"use client";

import { Video, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { leaveWebinarRoom } from "@/lib/actions/webinars";

interface Props {
  webinarId: string;
  isHost: boolean;
  token: string | null;
  tokenError: string | null;
}

export default function WebinarRoom({ webinarId, isHost, tokenError }: Props) {
  const router = useRouter();
  const error = tokenError;

  useEffect(() => {
    const handleLeave = () => { leaveWebinarRoom(webinarId); };
    window.addEventListener("beforeunload", handleLeave);
    return () => {
      window.removeEventListener("beforeunload", handleLeave);
      leaveWebinarRoom(webinarId);
    };
  }, [webinarId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#25072F]">
        <div className="text-center max-w-sm p-6 bg-white/5 rounded-2xl border border-white/10">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-bold text-lg mb-2">No se puede acceder</p>
          <p className="text-white/70 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/webinars")}
            className="bg-accent text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-accent-hover transition-all shadow-md shadow-pink-600/25"
          >
            Volver a los webinars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#25072F] text-white p-6">
      <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-4">
        <Video className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Sala de Webinar</h2>
      <p className="text-white/70 text-sm max-w-md text-center mb-4">
        Sesión activa{isHost ? " (Modo Anfitrión)" : ""} para el webinar ID: {webinarId}
      </p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/80">
        Sala en línea y lista para la transmisión.
      </div>
    </div>
  );
}
