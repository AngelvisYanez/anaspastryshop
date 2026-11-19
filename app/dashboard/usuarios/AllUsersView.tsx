"use client";
import SectionTabs from "../SectionTabs";
import { DataView } from "../data-view/DataView";
import { avatarPath } from "@/lib/avatar";
import { useState, useTransition } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Users, Mail, Calendar, BookOpen,
  ShieldCheck, Hash, Pencil, Trash2,
  X, AlertTriangle, Lock, Unlock, Search,
} from "lucide-react";
import { adminEditUser, adminDeleteUser, adminToggleUserStatus } from "@/lib/actions/user";
import Image from "next/image";
import {
  EditUserDialog,
  DeleteUserDialog,
  SuspendUserDialog,
  type EditableUser,
} from "./UserActionDialogs";


type UserRecord = EditableUser & {
  createdAt: Date;
  _count: { inscripciones: number };
};

export default function AllUsersView({
  allUsers, currentUserId,
}: {
  allUsers: UserRecord[];
  currentUserId: string;
}) {
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

  const term = search.trim().toLowerCase();
  const userTabs = [
    { title: "Usuarios", label: "Todos", items: allUsers },
    { title: "Alumnos", label: "Alumnos", items: alumnos },
    { title: "Administradores", label: "Administradores", items: admins },
  ];

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
    try {
      const result = await adminEditUser(editingUser.id, formData);
      if (result.error) setError(result.error);
      else { setEditingUser(null); showSuccess("Usuario actualizado correctamente."); }
    } catch {
      setError("No se pudo guardar el usuario. Inténtalo de nuevo.");
    }
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

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {error && (
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="alert" className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 rounded-xl px-5 py-3.5 flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2"><AlertTriangle size={15} /> {error}</div>
            <button onClick={() => setError(null)} aria-label="Cerrar"><X size={15} /></button>
          </m.div>
        )}
        {success && (
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="status" className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl px-5 py-3.5 text-sm font-bold">
            {success}
          </m.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3">
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

      <div className="flex justify-end">
        <div className="relative w-full sm:w-auto">
          <label htmlFor="users-search" className="sr-only">Buscar usuarios por nombre o email</label>
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            id="users-search"
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-card-border rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium outline-none focus:border-accent transition text-foreground placeholder:text-muted w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      <SectionTabs label="Tipos de usuario" tabs={userTabs.map((group) => ({
        label: group.label,
        count: group.items.length,
        content: (
          <DataView title={group.title} filterKey={term} items={term
              ? group.items.filter((u) => u.name?.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
              : group.items} dateLabel="Fecha de registro"
            row={(user) => ({ date: user.createdAt, values: [user.name, user.email,
              user.role === "ADMIN" ? "Administrador" : "Alumno", user.isActive ? "Activo" : "Suspendido",
              `${user._count.inscripciones} inscripciones`] })}>
            {(visible) => (
              <div className="max-w-full overflow-x-auto rounded-xl border border-card-border bg-card">
                <table className="dashboard-data-table w-full min-w-[720px] text-left">
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
                    {visible.map((user) => (
                      <tr key={user.id} className={`hover:bg-card-hover transition-colors ${!user.isActive ? "opacity-50" : ""}`}>
                        <td data-label="Usuario" className="py-3.5 pl-5 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-pink-500 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                              {user.image
                                ? <Image src={user.image} alt={user.name || ""} width={36} height={36} unoptimized={user.image.startsWith(avatarPath)} className="w-full h-full object-cover" />
                                : (user.name || user.email).split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{user.name || "Sin nombre"}</p>
                              {!user.isActive && <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Suspendido</p>}
                            </div>
                          </div>
                        </td>

                        <td data-label="Email" className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                            <Mail size={12} className="text-muted/40 shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                        </td>

                        <td data-label="Rol" className="py-3.5 px-3">{getRoleBadge(user)}</td>

                        <td data-label="Cursos" className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-section-alt text-foreground px-2.5 py-1 rounded-lg text-xs font-black">
                            <Hash size={10} /> {user._count.inscripciones}
                          </span>
                        </td>

                        <td data-label="Registro" className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-medium whitespace-nowrap">
                            <Calendar size={12} className="text-muted/40 shrink-0" />
                            <span suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString("es-ES", { timeZone: "America/Caracas", day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </td>

                        <td data-label="Acciones" className="py-3.5 pl-3 pr-5">
                          {user.id === currentUserId ? (
                            <div className="flex justify-end">
                              <button onClick={() => openEditModal(user)} title="Editar mi usuario" aria-label="Editar mi usuario"
                                className="rounded-lg bg-accent-subtle p-2 text-accent hover:bg-accent/20"><Pencil size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {user.role === "USER" && (
                                user.isActive
                                  ? <button onClick={() => setSuspendingUser({ user, isReactivating: false })} title="Suspender" aria-label={`Suspender a ${user.name || user.email}`}
                                      className="p-2 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition"><Lock size={14} /></button>
                                  : <button onClick={() => setSuspendingUser({ user, isReactivating: true })} title="Reactivar" aria-label={`Reactivar a ${user.name || user.email}`}
                                      className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"><Unlock size={14} /></button>
                              )}
                              <button onClick={() => openEditModal(user)} title="Editar" aria-label={`Editar usuario ${user.name || user.email}`}
                                className="p-2 bg-accent-subtle text-accent hover:bg-accent/20 rounded-lg transition"><Pencil size={14} /></button>
                              <button onClick={() => setDeletingUser(user)} title="Eliminar" aria-label={`Eliminar usuario ${user.name || user.email}`}
                                className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"><Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataView>
        ),
      }))} />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOwnAccount={editingUser.id === currentUserId}
          error={error}
          isPending={isPending}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          isPending={isPending}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
        />
      )}

      {suspendingUser && (
        <SuspendUserDialog
          user={suspendingUser.user}
          isReactivating={suspendingUser.isReactivating}
          suspensionReason={suspensionReason}
          isPending={isPending}
          onReasonChange={setSuspensionReason}
          onClose={() => {
            setSuspendingUser(null);
            setSuspensionReason("");
          }}
          onConfirm={handleToggleStatus}
        />
      )}

    </div>
  );
}
