"use client";
import { Users, BookOpen } from "lucide-react";

export default function StudentsView({
  userRole,
}: {
  userRole: string;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-amber-50 text-[#C9A84C] rounded-2xl">
            <Users size={32} />
          </div>
          <div>
            <p className="text-4xl font-black text-[#0B1F3A]">0</p>
            <p className="text-sm text-gray-400 font-bold mt-1">
              Alumnos Únicos {userRole === "ADMIN" ? "Totales" : "en tus cursos"}
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-4xl font-black text-[#0B1F3A]">0</p>
            <p className="text-sm text-gray-400 font-bold mt-1">
              Inscripciones Aprobadas
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-8 text-[#0B1F3A]">Directorio de Alumnos</h3>
        <p className="text-gray-400 italic text-center py-6">No hay alumnos registrados aún.</p>
      </div>
    </div>
  );
}
