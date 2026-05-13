"use client";
import { useState, useTransition } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Clock,
  Shield,
  ShieldOff,
  Pencil,
  Trash2,
  Mail,
  X,
  Loader2,
  GraduationCap,
  Calendar,
} from "lucide-react";
import {
  aprobarMentor,
  revocarMentor,
  editarMentor,
  eliminarMentor,
} from "@/lib/actions/mentores";
import Image from "next/image";

type Mentor = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isApproved: boolean;
  createdAt: Date;
  _count: { cursos: number };
};

type Tab = "todos" | "pendientes" | "aprobados";

export default function MentoresView({ mentores }: { mentores: Mentor[] }) {
  const [tab, setTab] = useState<Tab>("todos");
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const aprobados = mentores.filter((m) => m.isApproved);
  const pendientes = mentores.filter((m) => !m.isApproved);

  const displayed =
    tab === "todos" ? mentores : tab === "aprobados" ? aprobados : pendientes;

  function handleAprobar(id: string) {
    startTransition(async () => {
      await aprobarMentor(id);
    });
  }

  function handleRevocar(id: string) {
    startTransition(async () => {
      await revocarMentor(id);
    });
  }

  function handleEliminar(id: string) {
    startTransition(async () => {
      const result = await eliminarMentor(id);
      if (result?.error) {
        setError(result.error);
      }
      setDeletingId(null);
    });
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMentor) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await editarMentor(editingMentor.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditingMentor(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-6 py-4 flex justify-between items-center font-medium text-sm"
          >
            {error}
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-amber-50 text-accent rounded-lg">
            <GraduationCap size={28} />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">{mentores.length}</p>
            <p className="text-sm text-muted font-bold mt-1">Total Mentores</p>
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-lg">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">{pendientes.length}</p>
            <p className="text-sm text-muted font-bold mt-1">Por Validar</p>
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-green-50 text-green-500 rounded-lg">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">{aprobados.length}</p>
            <p className="text-sm text-muted font-bold mt-1">Aprobados</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-card rounded-lg p-2 border border-card-border shadow-sm w-fit">
        {(["todos", "pendientes", "aprobados"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 rounded-xl font-bold transition-all text-sm capitalize relative ${
              tab === t
                ? "bg-[#0B1F3A] text-white shadow-lg"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t === "pendientes" && pendientes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {pendientes.length}
              </span>
            )}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-card rounded-lg p-10 border border-card-border shadow-sm">
        {displayed.length === 0 ? (
          <p className="text-center text-muted italic py-10">
            No hay mentores en esta categoría.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-card-border text-[10px] font-black uppercase tracking-widest text-muted">
                  <th className="pb-4 pl-4">Mentor</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Cursos</th>
                  <th className="pb-4">Miembro desde</th>
                  <th className="pb-4 text-center">Estado</th>
                  <th className="pb-4 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((mentor) => (
                  <tr
                    key={mentor.id}
                    className="border-b border-card-border hover:bg-card-hover transition-colors"
                  >
                    {/* Avatar + Nombre */}
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white text-sm overflow-hidden shadow-sm">
                          {mentor.image ? (
                            <Image
                              src={mentor.image}
                              alt={mentor.name || ""}
                              width={44}
                              height={44}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (mentor.name || mentor.email)
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-foreground">
                          {mentor.name || "Sin nombre"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 text-sm text-muted font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-muted/40" />
                        {mentor.email}
                      </div>
                    </td>

                    {/* Cursos */}
                    <td className="py-4">
                      <span className="bg-amber-50 text-accent px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 w-fit">
                        <Users size={12} /> {mentor._count.cursos}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 text-sm text-muted font-medium">
                      <div suppressHydrationWarning className="flex items-center gap-2">
                        <Calendar size={13} className="text-muted/40" />
                        {new Date(mentor.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Estado Badge */}
                    <td className="py-4 text-center">
                      {mentor.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-xl text-xs font-black">
                          <CheckCircle2 size={12} /> Aprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-xs font-black">
                          <Clock size={12} /> Pendiente
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Aprobar / Revocar */}
                        {mentor.isApproved ? (
                          <button
                            onClick={() => handleRevocar(mentor.id)}
                            disabled={isPending}
                            title="Revocar acceso"
                            className="p-2.5 bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-xl transition-all disabled:opacity-50"
                          >
                            <ShieldOff size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAprobar(mentor.id)}
                            disabled={isPending}
                            title="Aprobar mentor"
                            className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all disabled:opacity-50"
                          >
                            <Shield size={16} />
                          </button>
                        )}

                        {/* Editar */}
                        <button
                          onClick={() => setEditingMentor(mentor)}
                          title="Editar mentor"
                          className="p-2.5 bg-amber-50 text-accent hover:bg-amber-100 rounded-xl transition-all"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => setDeletingId(mentor.id)}
                          title="Eliminar mentor"
                          className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== MODAL DE EDICIÓN ===== */}
      <AnimatePresence>
        {editingMentor && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingMentor(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-lg p-10 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-foreground">
                  Editar Mentor
                </h2>
                <button
                  onClick={() => setEditingMentor(null)}
                  className="p-2 hover:bg-section-alt rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                    Nombre Completo
                  </label>
                  <input
                    name="name"
                    defaultValue={editingMentor.name || ""}
                    required
                    placeholder="Ej. María González"
                    className="w-full bg-section-alt rounded-lg py-4 px-5 outline-none focus:ring-2 focus:ring-accent font-medium transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                    Imagen (URL)
                  </label>
                  <input
                    name="image"
                    defaultValue={editingMentor.image || ""}
                    placeholder="https://..."
                    className="w-full bg-section-alt rounded-lg py-4 px-5 outline-none focus:ring-2 focus:ring-accent font-medium transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#0B1F3A] text-white py-4 rounded-lg font-bold hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ===== MODAL DE CONFIRMACIÓN ELIMINAR ===== */}
      <AnimatePresence>
        {deletingId && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeletingId(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-lg p-10 w-full max-w-sm shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-3">
                ¿Eliminar Mentor?
              </h2>
              <p className="text-muted mb-8 text-sm leading-relaxed">
                Esta acción es irreversible. Si el mentor tiene cursos activos,
                deberás reasignarlos primero.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-4 rounded-lg font-bold bg-section-alt text-foreground hover:bg-muted/20 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEliminar(deletingId)}
                  disabled={isPending}
                  className="flex-1 py-4 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Sí, eliminar"
                  )}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
