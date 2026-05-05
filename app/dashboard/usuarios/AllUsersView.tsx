"use client";
import { useState, useTransition } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Users, GraduationCap, UserCheck, Mail, Calendar, BookOpen,
  ShieldCheck, Shield, ShieldOff, Clock, Hash, Pencil, Trash2,
  X, Loader2, AlertTriangle, Lock, Unlock, Star, CreditCard,
} from "lucide-react";
import { adminEditUser, adminDeleteUser, adminToggleUserStatus, adminAssignPlan } from "@/lib/actions/user";
import Image from "next/image";
import { aprobarMentor, revocarMentor } from "@/lib/actions/mentores";

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
  subscription: { plan: string; status: string } | null;
  _count: { inscripciones: number };
};

type Plan = { id: string; name: string; slug: string; price: number };

export default function AllUsersView({
  allUsers, plans, currentUserId,
}: {
  allUsers: UserRecord[];
  plans: Plan[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"todos" | "mentores" | "alumnos" | "admins">("todos");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editPlan, setEditPlan] = useState<string>("");
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<{ user: UserRecord; isReactivating: boolean } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mentores = allUsers.filter((u) => u.role === "MENTOR");
  const alumnos = allUsers.filter((u) => u.role === "USER");
  const admins = allUsers.filter((u) => u.role === "ADMIN");

  const source = tab === "todos" ? allUsers : tab === "mentores" ? mentores : tab === "alumnos" ? alumnos : admins;
  const filtered = search.trim()
    ? source.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : source;

  function showSuccess(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  function handleAprobar(id: string) { startTransition(async () => { await aprobarMentor(id); showSuccess("Mentor aprobado correctamente."); }); }
  function handleRevocar(id: string) { startTransition(async () => { await revocarMentor(id); showSuccess("Acceso del mentor revocado."); }); }

  function openEditModal(user: UserRecord) {
    setEditingUser(user);
    setEditPlan(user.subscription?.plan ?? "");
    setError(null);
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const [userResult] = await Promise.all([
        adminEditUser(editingUser.id, formData),
        adminAssignPlan(editingUser.id, editPlan || null),
      ]);
      if (userResult?.error) { setError(userResult.error); }
      else { setEditingUser(null); setEditPlan(""); showSuccess("Usuario actualizado correctamente."); }
    });
  }

  function handleDelete() {
    if (!deletingUser) return;
    startTransition(async () => {
      const result = await adminDeleteUser(deletingUser.id);
      if (result?.error) { setError(result.error); setDeletingUser(null); } else { setDeletingUser(null); showSuccess("Usuario eliminado correctamente."); }
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
    if (user.role === "ADMIN") return <span className="inline-flex items-center gap-1 bg-amber-50 text-accent px-3 py-1 rounded-lg text-xs font-black"><ShieldCheck size={11} /> Admin</span>;
    if (user.role === "MENTOR") return user.isApproved
      ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-black"><UserCheck size={11} /> Mentor ✓</span>
      : <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-500 px-3 py-1 rounded-lg text-xs font-black"><Clock size={11} /> Mentor (Pendiente)</span>;
    return <span className="inline-flex items-center gap-1 bg-section-alt text-muted px-3 py-1 rounded-lg text-xs font-black"><Users size={11} /> Alumno</span>;
  }

  function getPlanBadge(user: UserRecord) {
    if (!user.subscription) return <span className="text-xs text-muted/50 font-medium">Sin plan</span>;
    const isActive = user.subscription.status === "ACTIVE";
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${isActive ? "bg-amber-50 text-accent" : "bg-section-alt text-muted"}`}>
        <Star size={10} /> {user.subscription.plan}
      </span>
    );
  }

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {error && (
          <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-6 py-4 flex justify-between items-center font-medium text-sm">
            <div className="flex items-center gap-2"><AlertTriangle size={16} /> {error}</div>
            <button onClick={() => setError(null)} aria-label="Cerrar error"><X size={16} /></button>
          </m.div>
        )}
        {success && (
          <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-100 text-green-600 rounded-lg px-6 py-4 font-medium text-sm">
            ✅ {success}
          </m.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Users, color: "indigo", count: allUsers.length, label: "Usuarios Totales" },
          { icon: GraduationCap, color: "purple", count: mentores.length, label: `Mentores${mentores.filter((m) => !m.isApproved).length > 0 ? ` (${mentores.filter((m) => !m.isApproved).length} pendientes)` : ""}` },
          { icon: BookOpen, color: "green", count: alumnos.length, label: "Alumnos Registrados" },
          { icon: ShieldCheck, color: "indigo", count: admins.length, label: "Administradores" },
        ].map(({ icon: Icon, color, count, label }) => (
          <div key={label} className="bg-card p-8 rounded-xl border border-card-border shadow-sm flex items-center gap-6">
            <div className={`p-4 bg-${color}-50 text-${color === "green" ? "green-500" : "accent"} rounded-lg`}><Icon size={28} /></div>
            <div><p className="text-4xl font-black text-foreground">{count}</p><p className="text-sm text-muted font-bold mt-1">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex bg-card rounded-lg p-2 border border-card-border shadow-sm">
          {(["todos", "mentores", "alumnos", "admins"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 rounded-xl font-bold transition-all text-sm relative ${tab === t ? "bg-foreground text-background shadow-lg" : "text-muted hover:text-foreground"}`}>
              {t === "mentores" && mentores.filter((m) => !m.isApproved).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {mentores.filter((m) => !m.isApproved).length}
                </span>
              )}
              {t === "todos" ? "Todos" : t === "mentores" ? "Mentores" : t === "alumnos" ? "Alumnos" : "Administradores"}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-card-border rounded-lg py-3 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-accent text-foreground w-full sm:w-72 shadow-sm" />
      </div>

      {/* Tabla */}
      <div className="bg-card rounded-lg p-10 border border-card-border shadow-sm">
        {filtered.length === 0 ? (
          <p className="text-center text-muted italic py-10">No se encontraron usuarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-card-border text-[10px] font-black uppercase tracking-widest text-muted">
                  <th scope="col" className="pb-4 pl-4">Usuario</th>
                  <th scope="col" className="pb-4">Email</th>
                  <th scope="col" className="pb-4 text-center">Rol</th>
                  <th scope="col" className="pb-4 text-center">Plan</th>
                  <th scope="col" className="pb-4 text-center">Inscripciones</th>
                  <th scope="col" className="pb-4">Registrado</th>
                  <th scope="col" className="pb-4 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className={`border-b border-card-border hover:bg-card-hover transition-colors ${!user.isActive ? "opacity-50" : ""}`}>
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white text-sm overflow-hidden shadow-sm">
                          {user.image ? <Image src={user.image} alt={user.name || ""} width={44} height={44} className="w-full h-full object-cover" />
                            : (user.name || user.email).split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">{user.name || "Sin nombre"}</span>
                          {!user.isActive && <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Suspendido</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted font-medium">
                      <div className="flex items-center gap-2"><Mail size={13} className="text-muted/40" /> {user.email}</div>
                    </td>
                    <td className="py-4 text-center">{getRoleBadge(user)}</td>
                    <td className="py-4 text-center">{getPlanBadge(user)}</td>
                    <td className="py-4 text-center">
                      <span className="bg-section-alt text-foreground px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1">
                        <Hash size={11} /> {user._count.inscripciones}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-muted font-medium">
                      <div className="flex items-center gap-2"><Calendar size={13} className="text-muted/40" />
                        {new Date(user.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      {user.id === currentUserId ? (
                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest px-3">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {user.role === "MENTOR" && (
                            user.isApproved
                              ? <button onClick={() => handleRevocar(user.id)} disabled={isPending} title="Revocar acceso" aria-label={`Revocar acceso a ${user.name || user.email}`} className="p-2.5 bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-xl transition-all disabled:opacity-50"><ShieldOff size={15} /></button>
                              : <button onClick={() => handleAprobar(user.id)} disabled={isPending} title="Aprobar mentor" aria-label={`Aprobar mentor ${user.name || user.email}`} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all disabled:opacity-50"><Shield size={15} /></button>
                          )}
                          {user.role === "USER" && (
                            user.isActive
                              ? <button onClick={() => setSuspendingUser({ user, isReactivating: false })} title="Suspender" aria-label={`Suspender a ${user.name || user.email}`} className="p-2.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-xl transition-all"><Lock size={15} /></button>
                              : <button onClick={() => setSuspendingUser({ user, isReactivating: true })} title="Reactivar" aria-label={`Reactivar a ${user.name || user.email}`} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all"><Unlock size={15} /></button>
                          )}
                          <button onClick={() => openEditModal(user)} title="Editar" aria-label={`Editar usuario ${user.name || user.email}`} className="p-2.5 bg-amber-50 text-accent hover:bg-amber-100 rounded-xl transition-all"><Pencil size={15} /></button>
                          <button onClick={() => setDeletingUser(user)} title="Eliminar" aria-label={`Eliminar usuario ${user.name || user.email}`} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"><Trash2 size={15} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Edición completa */}
      <AnimatePresence>
        {editingUser && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setEditingUser(null); setEditPlan(""); }}>
            <m.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-user-modal-title"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-card rounded-lg p-10 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-card-border"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 id="edit-user-modal-title" className="text-2xl font-black text-foreground">Editar Usuario</h2>
                <button onClick={() => { setEditingUser(null); setEditPlan(""); }} className="p-2 hover:bg-card-hover rounded-xl transition-colors" aria-label="Cerrar modal"><X size={20} /></button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nombre Completo</label>
                  <input name="name" defaultValue={editingUser.name || ""} required placeholder="Ej. María González"
                    className="w-full bg-section-alt rounded-lg py-4 px-5 outline-none focus:ring-2 focus:ring-accent font-medium transition-all text-foreground" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Imagen (URL)</label>
                  <input name="image" defaultValue={editingUser.image || ""} placeholder="https://..."
                    className="w-full bg-section-alt rounded-lg py-4 px-5 outline-none focus:ring-2 focus:ring-accent font-medium transition-all text-foreground" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Rol</label>
                  <select name="role" defaultValue={editingUser.role}
                    className="w-full bg-section-alt rounded-lg py-4 px-5 outline-none focus:ring-2 focus:ring-accent font-medium transition-all text-foreground">
                    <option value="USER">Alumno (USER)</option>
                    <option value="MENTOR">Mentor (MENTOR)</option>
                    <option value="ADMIN">Administrador (ADMIN)</option>
                  </select>
                </div>

                {plans.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Plan de Suscripción</label>
                    <div className="space-y-2">
                      <button type="button" onClick={() => setEditPlan("")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-sm font-bold ${!editPlan ? "border-red-200 bg-red-50 text-red-400" : "border-card-border text-muted hover:border-card-border"}`}>
                        <X size={14} /> Sin plan
                      </button>
                      {plans.map((plan) => (
                        <button key={plan.slug} type="button" onClick={() => setEditPlan(plan.slug)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${editPlan === plan.slug ? "border-accent bg-accent-subtle text-accent" : "border-card-border text-foreground hover:border-card-border"}`}>
                          <div className="flex items-center gap-2">
                            <Star size={14} className={editPlan === plan.slug ? "text-accent" : "text-muted/40"} />
                            <span className="font-bold text-sm">{plan.name}</span>
                          </div>
                          <span className="text-xs font-black text-muted">${plan.price}/mes</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>}

                <button type="submit" disabled={isPending}
                  className="w-full bg-navy text-white py-4 rounded-lg font-bold hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : "Guardar Cambios"}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeletingUser(null)}>
            <m.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-user-modal-title"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-card rounded-lg p-10 w-full max-w-sm shadow-2xl text-center border border-card-border"
              onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6"><Trash2 className="text-red-500" size={28} /></div>
              <h2 id="delete-user-modal-title" className="text-2xl font-black text-foreground mb-2">¿Eliminar usuario?</h2>
              <p className="text-muted mb-2 text-sm">Estás a punto de eliminar a:</p>
              <p className="font-bold text-foreground mb-1">{deletingUser.name || "Sin nombre"}</p>
              <p className="text-xs text-muted mb-8">{deletingUser.email}</p>
              <p className="text-xs text-red-400 bg-red-50 rounded-xl px-4 py-3 mb-8 font-medium">⚠️ Esta acción es irreversible. Se eliminarán también sus inscripciones.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingUser(null)} className="flex-1 py-4 rounded-lg font-bold bg-section-alt text-foreground hover:bg-card-hover transition-all">Cancelar</button>
                <button onClick={handleDelete} disabled={isPending}
                  className="flex-1 py-4 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : "Sí, eliminar"}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setSuspendingUser(null); setSuspensionReason(""); }}>
            <m.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="suspend-user-modal-title"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-card rounded-lg p-10 w-full max-w-md shadow-2xl border border-card-border"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 id="suspend-user-modal-title" className="text-2xl font-black text-foreground">{suspendingUser.isReactivating ? "Reactivar Alumno" : "Desactivar Alumno"}</h2>
                <button onClick={() => { setSuspendingUser(null); setSuspensionReason(""); }} className="p-2 hover:bg-card-hover rounded-xl transition-colors" aria-label="Cerrar modal"><X size={20} /></button>
              </div>
              <p className="text-muted mb-6 text-sm">
                {suspendingUser.isReactivating
                  ? `Estás a punto de reactivar el acceso de ${suspendingUser.user.name || "este alumno"}.`
                  : `Selecciona el motivo por el cual desactivarás temporalmente a ${suspendingUser.user.name || "este alumno"}.`}
              </p>
              {!suspendingUser.isReactivating && (
                <div className="mb-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 mb-2 block">Motivo de Suspensión</label>
                  <select value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)}
                    className="w-full bg-section-alt rounded-lg py-4 px-5 outline-none focus:ring-2 focus:ring-accent font-medium transition-all text-foreground">
                    <option value="" disabled>Selecciona una razón...</option>
                    <option value="Uso de tarjetas dudosas">Uso de tarjetas dudosas</option>
                    <option value="Inyección de código">Inyección de código</option>
                    <option value="Compartir credenciales">Compartir credenciales</option>
                    <option value="Piratería / Grabación de contenido">Piratería / Grabación de contenido</option>
                    <option value="Distribución de materiales">Distribución de materiales</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setSuspendingUser(null); setSuspensionReason(""); }}
                  className="flex-1 py-4 rounded-lg font-bold bg-section-alt text-foreground hover:bg-card-hover transition-all">Cancelar</button>
                <button onClick={handleToggleStatus} disabled={isPending}
                  className={`flex-1 py-4 rounded-lg font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${suspendingUser.isReactivating ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`}>
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : (suspendingUser.isReactivating ? "Reactivar" : "Desactivar")}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
