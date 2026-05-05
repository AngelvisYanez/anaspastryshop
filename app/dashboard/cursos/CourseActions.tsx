"use client";

import { useState } from "react";
import { Edit2, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { deleteCourse } from "@/lib/actions/cursos";
import { useRouter } from "next/navigation";

interface CourseActionsProps {
  courseId: string;
  hasEnrolled: boolean;
}

export default function CourseActions({ courseId, hasEnrolled }: CourseActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (hasEnrolled) {
      alert("No se puede eliminar un curso que ya tiene alumnos pagos.");
      return;
    }
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const res = await deleteCourse(courseId);
    setIsDeleting(false);
    setShowModal(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 transition-opacity drop-shadow-md">
        <Link
          href={`/dashboard/cursos/${courseId}/edit`}
          className="bg-card text-amber-700 hover:bg-amber-50 p-2.5 rounded-xl shadow-lg border border-card-border transition-all hover:scale-105"
          title="Editar Curso"
        >
          <Edit2 size={16} />
        </Link>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting || hasEnrolled}
          className={`p-2.5 rounded-xl shadow-lg border transition-all hover:scale-105 ${
            hasEnrolled 
              ? "bg-section-alt text-muted border-card-border cursor-not-allowed group/btn relative" 
              : "bg-card text-red-500 hover:bg-red-50 border-card-border"
          }`}
          title={hasEnrolled ? "Curso bloqueado (Inactivable desde perfil)" : "Eliminar Curso"}
        >
          <Trash2 size={16} className={isDeleting ? "animate-pulse" : ""} />
          
          {hasEnrolled && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-48 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
              <span className="font-bold flex items-center gap-1"><AlertCircle size={10} /> Bloqueado</span>
              Este curso tiene inscripciones. No es posible eliminarlo.
            </div>
          )}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-center text-foreground mb-2">¿Eliminar Curso?</h3>
            <p className="text-sm text-center text-muted mb-6 leading-relaxed">
              Esta acción es permanente y eliminará todos los módulos, lecciones integradas y progreso estructural. No se puede deshacer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-section-alt hover:bg-muted/20 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors flex items-center justify-center disabled:animate-pulse disabled:opacity-70"
              >
                {isDeleting ? "Borrando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
