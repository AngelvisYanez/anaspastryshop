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
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-accent-subtle text-accent rounded-lg">
            <Users size={32} />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">0</p>
            <p className="text-sm text-muted font-bold mt-1">
              Alumnos Únicos {userRole === "ADMIN" ? "Totales" : "en tus cursos"}
            </p>
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-lg">
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">0</p>
            <p className="text-sm text-muted font-bold mt-1">
              Inscripciones Aprobadas
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-10 border border-card-border shadow-sm">
        <h3 className="text-xl font-bold mb-8 text-foreground">Directorio de Alumnos</h3>
        <p className="text-muted italic text-center py-6">No hay alumnos registrados aún.</p>
      </div>
    </div>
  );
}
