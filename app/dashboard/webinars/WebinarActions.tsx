"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Radio, Square, Clock, ExternalLink } from "lucide-react";
import { deleteWebinar, updateWebinarStatus } from "@/lib/actions/webinars";

type Status = "SCHEDULED" | "LIVE" | "ENDED";

export default function WebinarActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este webinar? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await deleteWebinar(id);
    router.refresh();
  }

  async function handleStatus(next: Status) {
    setUpdating(true);
    await updateWebinarStatus(id, next);
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
            <Radio size={15} /> Iniciar
          </button>
        )}
        {status === "LIVE" && (
          <>
            <button
              onClick={() => router.push(`/webinars/${id}`)}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-50 text-accent hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={15} /> Entrar
            </button>
            <button
              onClick={() => handleStatus("ENDED")}
              disabled={updating}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Square size={15} /> Finalizar
            </button>
          </>
        )}
        {status === "ENDED" && (
          <button
            onClick={() => handleStatus("SCHEDULED")}
            disabled={updating}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-section-alt text-muted hover:bg-section-alt transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Clock size={15} /> Reactivar
          </button>
        )}
        <button
          onClick={() => router.push(`/dashboard/webinars/${id}/edit`)}
          className="py-3 px-4 rounded-xl font-bold text-sm bg-section-alt text-foreground hover:bg-section-alt transition-colors"
        >
          <Edit size={15} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="py-3 px-4 rounded-xl font-bold text-sm bg-section-alt text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
