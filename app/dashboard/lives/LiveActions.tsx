"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Radio, Square, Clock, AlertCircle } from "lucide-react";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function confirmDelete() {
    setShowDeleteModal(false);
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
    <>
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
            <>
              <button
                onClick={() => router.push(`/lives/${id}`)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
              >
                <Radio size={15} /> Entrar
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
            onClick={() => router.push(`/dashboard/lives/${id}/edit`)}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-section-alt text-foreground hover:bg-section-alt transition-colors flex items-center gap-2"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-section-alt text-red-400 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-center text-foreground mb-2">
              ¿Eliminar Live?
            </h3>
            <p className="text-sm text-center text-muted mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-sm font-bold text-muted hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
