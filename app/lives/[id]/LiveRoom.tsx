"use client";

import { Video, AlertCircle } from "lucide-react";

interface Props {
  liveId: string;
  token: string | null;
  tokenError: string | null;
}

export default function LiveRoom({ liveId, tokenError }: Props) {
  const error = tokenError;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B1F3A]">
        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-bold text-lg mb-2">Error al unirse a la sala</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0B1F3A] text-white p-6">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
        <Video className="w-8 h-8 text-[#C9A84C]" />
      </div>
      <h2 className="text-xl font-bold mb-2">Transmisión en Vivo</h2>
      <p className="text-gray-400 text-sm max-w-md text-center">
        Sala ID: {liveId}
      </p>
    </div>
  );
}