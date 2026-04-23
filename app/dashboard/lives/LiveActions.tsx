"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Radio, Square, Clock } from "lucide-react";
import { deleteLive, updateLiveStatus } from "@/lib/actions/lives";

type Status = "SCHEDULED" | "LIVE" | "ENDED";

export default function LiveActions({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este live? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await deleteLive(id);
    router.refresh();
  }

  async function handleStatus(next: Status) {
    setUpdating(true);
    await updateLiveStatus(id, next);
    router.refresh();
    setUpdating(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {status === "SCHEDULED" && (
          <button
            onClick={() => handleStatus("LIVE")}
            disabled={updating}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Radio size={15} /> Iniciar Live
          </button>
        )}
        {status === "LIVE" && (
          <button
            onClick={() => handleStatus("ENDED")}
            disabled={updating}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Square size={15} /> Finalizar
          </button>
        )}
        {status === "ENDED" && (
          <button
            onClick={() => handleStatus("SCHEDULED")}
            disabled={updating}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Clock size={15} /> Reactivar
          </button>
        )}
        <button
          onClick={() => router.push(`/dashboard/lives/${id}/edit`)}
          className="py-3 px-4 rounded-xl font-bold text-sm bg-gray-50 text-[#0B1F3A] hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <Edit size={15} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="py-3 px-4 rounded-xl font-bold text-sm bg-gray-50 text-red-400 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
