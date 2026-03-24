"use client";
import { useState } from "react";
import { Users, BookOpen, Mail, Calendar, Hash } from "lucide-react";

type Inscription = {
  id: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: Date;
};

type Taller = {
  id: string;
  title: string;
  category: string;
  inscritos: Inscription[];
};

export default function StudentsView({
  talleres,
  userRole,
}: {
  talleres: Taller[];
  userRole: string;
}) {
  const [activeTab, setActiveTab] = useState<"general" | "por-taller">("general");

  // 1. Aplanar y deducir lista general de alumnos únicos
  const allInscriptions = talleres.flatMap((t) => t.inscritos);
  
  // Usamos un Map para asegurar alumnos únicos por email
  const uniqueStudentsMap = new Map();
  allInscriptions.forEach((ins) => {
    if (!uniqueStudentsMap.has(ins.user.email)) {
      uniqueStudentsMap.set(ins.user.email, {
        ...ins.user,
        inscritoEn: 1,
        fechaIngreso: ins.createdAt,
      });
    } else {
      const existing = uniqueStudentsMap.get(ins.user.email);
      existing.inscritoEn += 1;
    }
  });

  const uniqueStudents = Array.from(uniqueStudentsMap.values());

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-indigo-50 text-[#5A4FCF] rounded-2xl">
            <Users size={32} />
          </div>
          <div>
            <p className="text-4xl font-black text-[#1A1A2E]">{uniqueStudents.length}</p>
            <p className="text-sm text-gray-400 font-bold mt-1">
              Alumnos Únicos {userRole === "ADMIN" ? "Totales" : "en tus talleres"}
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-4xl font-black text-[#1A1A2E]">{allInscriptions.length}</p>
            <p className="text-sm text-gray-400 font-bold mt-1">
              Inscripciones Aprobadas
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-2 border border-gray-100 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-6 py-3 rounded-xl font-bold transition-all text-sm ${
            activeTab === "general"
              ? "bg-[#1A1A2E] text-white shadow-lg"
              : "text-gray-400 hover:text-[#1A1A2E]"
          }`}
        >
          Lista General
        </button>
        <button
          onClick={() => setActiveTab("por-taller")}
          className={`px-6 py-3 rounded-xl font-bold transition-all text-sm ${
            activeTab === "por-taller"
              ? "bg-[#1A1A2E] text-white shadow-lg"
              : "text-gray-400 hover:text-[#1A1A2E]"
          }`}
        >
          Desglose por Taller
        </button>
      </div>

      {/* TAB GENERAL */}
      {activeTab === "general" && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 text-[#1A1A2E]">Directorio de Alumnos</h3>
          {uniqueStudents.length === 0 ? (
            <p className="text-gray-400 italic text-center py-6">No hay alumnos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                    <th className="pb-4 pl-4">Alumno</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Inscripciones</th>
                    <th className="pb-4">Último Ingreso</th>
                    <th className="pb-4 pr-4 text-right">Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueStudents.map((student, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-[#5A4FCF] rounded-xl flex items-center justify-center font-bold text-sm">
                          {student.image ? (
                            <img src={student.image} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            student.name?.substring(0, 2).toUpperCase() || "??"
                          )}
                        </div>
                        <span className="font-bold text-[#1A1A2E]">{student.name || "Sin nombre"}</span>
                      </td>
                      <td className="py-4 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Mail size={14} /> {student.email}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                          <Hash size={12} /> {student.inscritoEn} Taller(es)
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} /> {new Date(student.fechaIngreso).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <a 
                          href={`mailto:${student.email}`}
                          className="inline-flex items-center gap-2 bg-indigo-50 text-[#5A4FCF] hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Mail size={14} /> Contactar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB POR TALLER */}
      {activeTab === "por-taller" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {talleres.map((taller) => (
            <div key={taller.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5A4FCF] mb-1 block">
                    {taller.category}
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A2E]">{taller.title}</h3>
                </div>
                <div className="bg-indigo-50 text-[#5A4FCF] px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {taller.inscritos.length}
                </div>
              </div>

              <hr className="border-gray-50 mb-6" />

              <div className="space-y-4">
                {taller.inscritos.length > 0 ? (
                  taller.inscritos.map((ins) => (
                    <div key={ins.id} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-[#1A1A2E] text-xs shadow-sm shadow-gray-200">
                        {ins.user.image ? (
                          <img src={ins.user.image} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          ins.user.name?.substring(0, 2).toUpperCase() || "??"
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#1A1A2E] leading-tight">
                            {ins.user.name || "Sin nombre"}
                          </p>
                          <p className="text-[10px] uppercase font-black text-gray-400 mt-0.5 tracking-wider">
                            {ins.user.email}
                          </p>
                        </div>
                        <a 
                          href={`mailto:${ins.user.email}?subject=Reembolso/Aviso%20del%20Taller:%20${taller.title}`}
                          className="flex items-center justify-center p-2.5 bg-indigo-50 text-[#5A4FCF] hover:bg-[#5A4FCF] hover:text-white rounded-xl transition-all"
                          title="Enviar correo a este alumno"
                        >
                          <Mail size={16} />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-2xl">
                    No hay estudiantes inscritos aquí.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
