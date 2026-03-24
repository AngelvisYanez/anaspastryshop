"use client";
import { eliminarTaller } from "@/lib/actions/talleres";
import { Trash2, Edit, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TallerActions({ id, inscritos, isAdmin }: { id: string; inscritos: number; isAdmin: boolean }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  // Bloquear solo si no es ADMIN y hay 5 o más inscritos
  const isBlocked = !isAdmin && inscritos >= 5;

  async function handleDelete() {
    if (isBlocked) {
      alert("No puedes eliminar un taller con 5 o más alumnos. Contacta a soporte para reembolsos.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este taller? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeleting(true);
    try {
      await eliminarTaller(id);
      router.refresh();
    } catch (error) {
      alert("Error al eliminar el taller");
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit() {
    if (isBlocked) {
      alert("No puedes editar un taller con 5 o más alumnos. Contacta a soporte o revisa tus inscritos.");
      return;
    }
    router.push(`/dashboard/talleres/${id}/edit`);
  }

  return (
    <div className="flex flex-col gap-2">
      {isBlocked && (
        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
          <AlertCircle size={14} /> Acciones bloqueadas por alta inscripción
        </div>
      )}
      <div className="flex gap-3">
        <button 
          onClick={handleEdit}
          disabled={isBlocked}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
            isBlocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-[#1A1A2E] hover:bg-gray-100"
          }`}
          title={isBlocked ? "Bloqueado: Hay 5 o más alumnos inscritos" : "Editar taller"}
        >
          <Edit size={16} /> Editar
        </button>
        <button 
          disabled={deleting || isBlocked}
          onClick={handleDelete}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
            isBlocked ? "bg-red-50 text-red-300 cursor-not-allowed" : "bg-gray-50 text-red-500 hover:bg-red-50 disabled:opacity-50"
          }`}
          title={isBlocked ? "Bloqueado: Hay 5 o más alumnos inscritos" : "Eliminar taller"}
        >
          <Trash2 size={16} /> {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}
