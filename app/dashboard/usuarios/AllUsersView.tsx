"use client";
import { useState, useTransition } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Users, GraduationCap, UserCheck, Mail, Calendar, BookOpen,
  ShieldCheck, Shield, ShieldOff, Clock, Hash, Pencil, Trash2,
  X, Loader2, AlertTriangle, Lock, Unlock, Star, Search, Filter,
} from "lucide-react";
import { adminEditUser, adminDeleteUser, adminToggleUserStatus } from "@/lib/actions/user";
import Image from "next/image";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  deactivationReason: string | null;
  createdAt: Date;
  _count: { inscripciones: number };
};

export default function AllUsersView({
  allUsers, currentUserId,
}: {
  allUsers: UserRecord[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"todos" | "alumnos" | "admins">("todos");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<{ user: UserRecord; isReactivating: boolean } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const alumnos = allUsers.filter((u) => u.role === "USER");
  const admins = allUsers.filter((u) => u.role === "ADMIN");

  const source = tab === "todos" ? allUsers : tab === "alumnos" ? alumnos : admins;
  const filtered = search.trim()
    ? source.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : source;

function showSuccess(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

function openEditModal(user: UserRecord) {
  setEditingUser(user);
  setError(null);
}

function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!editingUser) return;
  const formData = new FormData(e.currentTarget);
  startTransition(async () => {
    const userResult = await adminEditUser(editingUser.id, formData);
    if (userResult?.error) { setError(userResult.error); }
    else { setEditingUser(null); showSuccess("Usuario actualizado correctamente."); }
  });
}

function handleDelete() {
  if (!deletingUser) return;
  startTransition(async () => {
    const result = await adminDeleteUser(deletingUser.id);
    if (result?.error) { setError(result.error); setDeletingUser(null); }
    else { setDeletingUser(null); showSuccess("Usuario eliminado correctamente."); }
  });
}

  function handleToggleStatus() {
    if (!suspendingUser) return;
    const { user, isReactivating } = suspendingUser;
    if (!isReactivating && !suspensionReason) { setError("Debes de seleccionar una razón para suspender al alumno."); return; }
    startTransition(async () => {
      const result = await adminToggleUserStatus(user.id, isReactivating, isReactivating ? undefined : suspensionReason);
      if (result?.error) { setError(result.error); setSuspendingUser(null); }
      else { setSuspendingUser(null); setSuspensionReason(""); showSuccess(isReactivating ? "Usuario reactivado correctamente." : "Usuario suspendido correctamente."); }
    });
  }

function getRoleBadge(user: UserRecord) {
  if (user.role === "ADMIN") return (
    <span className="inline-flex items-center gap-1.5 bg-accent-subtle text-accent border border-accent/30 px-2.5 py-1 rounded-lg text-[11px] font-black">
      <ShieldCheck size={11} /> Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 bg-section-alt text-foreground border border-card-border px-2.5 py-1 rounded-lg text-[11px] font-black">
      <Users size={11} /> Alumno
    </span>
  );
}

const STATS = [
  { icon: Users, label: "Total", value: allUsers.length, color: "text-accent", bg: "bg-accent-subtle" },
  { icon: BookOpen, label: "Alumnos", value: alumnos.length, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  { icon: ShieldCheck, label: "Admins", value: admins.length, color: "text-accent", bg: "bg-accent-subtle" },
];

  const inputClass = "w-full bg-card border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium";
  const labelClass = "text-[11px] font-black uppercase tracking-widest text-muted mb-1.5 block";

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {error && (
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 rounded-xl px-5 py-3.5 flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2"><AlertTriangle size={15} /> {error}</div>
            <button onClick={() => setError(null)} aria-label="Cerrar"><X size={15} /></button>
          </m.div>
        )}
        {success && (
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl px-5 py-3.5 text-sm font-bold">
            {success}
          </m.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-card border border-card-border rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground leading-none">{value}</p>
              <p className="text-xs text-muted font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex bg-card border border-card-border rounded-xl p-1 gap-0.5 shadow-sm">
          {(["todos", "alumnos", "admins"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                tab === t
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}>
              {t === "todos" ? "Todos" : t === "alumnos" ? "Alumnos" : "Admins"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-card-border rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium outline-none focus:border-accent transition-all text-foreground placeholder:text-muted w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-section-alt flex items-center justify-center mb-3">
              <Filter size={18} className="text-muted/40" />
            </div>
            <p className="text-sm font-bold text-muted">Sin resultados</p>
            <p className="text-xs text-muted/60 mt-1">Prueba con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-card-border bg-section-alt/60">
                  <th className="py-3 pl-5 pr-3 text-[11px] font-black uppercase tracking-widest text-muted">Usuario</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Email</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Rol</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted text-center">Cursos</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Registro</th>
                  <th className="py-3 pl-3 pr-5 text-[11px] font-black uppercase tracking-widest text-muted text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filtered.map((user) => (
                  <tr key={user.id} className={`hover:bg-card-hover transition-colors ${!user.isActive ? "opacity-50" : ""}`}>
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-pink-500 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                          {user.image
                            ? <Image src={user.image} alt={user.name || ""} width={36} height={36} className="w-full h-full object-cover" />
                            : (user.name || user.email).split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{user.name || "Sin nombre"}</p>
                          {!user.isActive && <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Suspendido</p>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                        <Mail size={12} className="text-muted/40 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>

<td className="py-3.5 px-3">{getRoleBadge(user)}</td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-section-alt text-foreground px-2.5 py-1 rounded-lg text-xs font-black">
                        <Hash size={10} /> {user._count.inscripciones}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted font-medium whitespace-nowrap">
                        <Calendar size={12} className="text-muted/40 shrink-0" />
                        <span suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </td>

                    <td className="py-3.5 pl-3 pr-5">
                      {user.id === currentUserId ? (
                        <span className="text-xs text-muted/40 font-bold block text-right">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === "USER" && (
                            user.isActive
                              ? <button onClick={() => setSuspendingUser({ user, isReactivating: false })} title="Suspender" aria-label={`Suspender a ${user.name || user.email}`}
                                  className="p-2 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-all"><Lock size={14} /></button>
                              : <button onClick={() => setSuspendingUser({ user, isReactivating: true })} title="Reactivar" aria-label={`Reactivar a ${user.name || user.email}`}
                                  className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all"><Unlock size={14} /></button>
                          )}
                          <button onClick={() => openEditModal(user)} title="Editar" aria-label={`Editar usuario ${user.name || user.email}`}
                            className="p-2 bg-accent-subtle text-accent hover:bg-accent/20 rounded-lg transition-all"><Pencil size={14} /></button>
                          <button onClick={() => setDeletingUser(user)} title="Eliminar" aria-label={`Eliminar usuario ${user.name || user.email}`}
                            className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-card-border bg-section-alt/40">
            <p className="text-xs text-muted font-medium">
              {filtered.length} {filtered.length === 1 ? "usuario" : "usuarios"}{search ? ` encontrados para "${search}"` : ""}
            </p>
          </div>
        )}
      </div>

      {/* MODAL: Editar */}
      <AnimatePresence>
        {editingUser && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setEditingUser(null); }}>
            <m.div
              role="dialog" aria-modal="true" aria-labelledby="edit-user-title"
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-card rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-card-border"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-card-border">
                <h2 id="edit-user-title" className="text-lg font-black text-foreground">Editar Usuario</h2>
                <button onClick={() => { setEditingUser(null); }} className="p-1.5 hover:bg-card-hover rounded-lg transition-colors" aria-label="Cerrar"><X size={18} /></button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div>
                  <label className={labelClass}>Nombre Completo</label>
                  <input name="name" defaultValue={editingUser.name || ""} required placeholder="Ej. María González" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Imagen (URL)</label>
                  <input name="image" defaultValue={editingUser.image || ""} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Rol</label>
                  <select name="role" defaultValue={editingUser.role} className={inputClass} disabled>
                    <option value="USER">Alumno</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-xl">{error}</p>}

                <button type="submit" disabled={isPending}
                  className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-hover shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : "Guardar Cambios"}
                </button>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* MODAL: Eliminar */}
      <AnimatePresence>
        {deletingUser && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeletingUser(null)}>
            <m.div
              role="dialog" aria-modal="true" aria-labelledby="delete-user-title"
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-card rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center border border-card-border"
              onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Trash2 className="text-red-500" size={24} />
              </div>
              <h2 id="delete-user-title" className="text-xl font-black text-foreground mb-1">¿Eliminar usuario?</h2>
              <p className="text-muted text-sm mb-1">Vas a eliminar a:</p>
              <p className="font-bold text-foreground mb-0.5">{deletingUser.name || "Sin nombre"}</p>
              <p className="text-xs text-muted mb-5">{deletingUser.email}</p>
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-6 font-medium">
                Esta acción es irreversible. Se eliminarán también sus inscripciones.
              </p>
              <div className="flex gap-2.5">
                <button onClick={() => setDeletingUser(null)} className="flex-1 py-3 rounded-xl font-bold bg-section-alt text-foreground hover:bg-card-hover transition-all text-sm">Cancelar</button>
                <button onClick={handleDelete} disabled={isPending}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : "Eliminar"}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* MODAL: Suspender/Reactivar */}
      <AnimatePresence>
        {suspendingUser && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setSuspendingUser(null); setSuspensionReason(""); }}>
            <m.div
              role="dialog" aria-modal="true" aria-labelledby="suspend-user-title"
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-card-border"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-card-border">
                <h2 id="suspend-user-title" className="text-lg font-black text-foreground">
                  {suspendingUser.isReactivating ? "Reactivar usuario" : "Suspender usuario"}
                </h2>
                <button onClick={() => { setSuspendingUser(null); setSuspensionReason(""); }} className="p-1.5 hover:bg-card-hover rounded-lg transition-colors" aria-label="Cerrar"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-sm text-muted">
                  {suspendingUser.isReactivating
                    ? `Estás a punto de reactivar el acceso de ${suspendingUser.user.name || "este usuario"}.`
                    : `Selecciona el motivo para suspender a ${suspendingUser.user.name || "este usuario"}.`}
                </p>
                {!suspendingUser.isReactivating && (
                  <div>
                    <label className={labelClass}>Motivo de Suspensión</label>
                    <select value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)} className={inputClass}>
                      <option value="" disabled>Selecciona una razón...</option>
                      <option value="Uso de tarjetas dudosas">Uso de tarjetas dudosas</option>
                      <option value="Inyección de código">Inyección de código</option>
                      <option value="Compartir credenciales">Compartir credenciales</option>
                      <option value="Piratería / Grabación de contenido">Piratería / Grabación de contenido</option>
                      <option value="Distribución de materiales">Distribución de materiales</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-2.5 pt-1">
                  <button onClick={() => { setSuspendingUser(null); setSuspensionReason(""); }}
                    className="flex-1 py-3 rounded-xl font-bold bg-section-alt text-foreground hover:bg-card-hover transition-all text-sm">Cancelar</button>
                  <button onClick={handleToggleStatus} disabled={isPending}
                    className={`flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm ${suspendingUser.isReactivating ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`}>
                    {isPending ? <Loader2 className="animate-spin" size={16} /> : (suspendingUser.isReactivating ? "Reactivar" : "Suspender")}
                  </button>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
