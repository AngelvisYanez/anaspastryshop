"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  LayoutGrid, Plus, Trash2, Loader2, CheckCircle,
  Eye, EyeOff, Pencil, X, Save, AlertCircle,
} from "lucide-react";
import { createSection, deleteSection, updateSection } from "@/lib/actions/platformSections";

const ICON_OPTIONS = [
  "BookOpen", "Video", "Users", "Star", "Zap", "Globe",
  "Shield", "Award", "Calendar", "BarChart2", "Radio", "LayoutGrid",
  "Layers", "Target", "TrendingUp", "CreditCard", "MessageSquare",
  "PlayCircle", "Mic", "GraduationCap", "Briefcase", "Heart", "Code", "Home",
];

const ROLES = [
  { key: "ADMIN",  label: "Admin",  color: "bg-accent-subtle text-accent border-accent/20" },
  { key: "USER",   label: "Usuario", color: "bg-blue-100 text-blue-700 border-blue-200" },
];

function DynamicIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface Section {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: string[];
}

export default function PlatformModuleManager({
  initialSections,
}: {
  initialSections: Section[];
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state for creating
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    icon: "Layers",
    order: initialSections.length + 1,
    roles: ["ADMIN", "USER"],
  });

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Section, "id"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Deleting / toggling state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function triggerSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function handleCreateNameChange(name: string) {
    setCreateForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === slugify(prev.name) || !prev.slug ? slugify(name) : prev.slug,
    }));
  }

  function toggleRole(role: string, isCreate: boolean) {
    if (isCreate) {
      setCreateForm((prev) => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles, role],
      }));
    } else if (editForm) {
      setEditForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          roles: prev.roles.includes(role)
            ? prev.roles.filter((r) => r !== role)
            : [...prev.roles, role],
        };
      });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const fd = new FormData();
    fd.append("name", createForm.name);
    fd.append("slug", createForm.slug);
    fd.append("icon", createForm.icon);
    fd.append("order", String(createForm.order));
    fd.append("roles", createForm.roles.join(","));

    const res = await createSection(fd);
    setCreating(false);

    if (res.error) {
      setCreateError(res.error);
    } else if (res.section) {
      setSections((prev) => [...prev, res.section as Section].sort((a, b) => a.order - b.order));
      setShowCreate(false);
      setCreateForm({ name: "", slug: "", icon: "Layers", order: sections.length + 2, roles: ["ADMIN", "USER"] });
      triggerSuccess("Módulo creado correctamente");
    }
  }

  function startEditing(s: Section) {
    setEditingId(s.id);
    setEditForm({ name: s.name, slug: s.slug, icon: s.icon, order: s.order, isActive: s.isActive, roles: s.roles });
    setEditError(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editForm) return;
    setSaving(true);
    setEditError(null);

    const res = await updateSection(editingId, {
      name: editForm.name,
      slug: editForm.slug,
      icon: editForm.icon,
      order: editForm.order,
      isActive: editForm.isActive,
      roles: editForm.roles,
    });
    setSaving(false);

    if (res.error) {
      setEditError(res.error);
    } else if (res.section) {
      setSections((prev) =>
        prev.map((s) => (s.id === editingId ? (res.section as Section) : s)).sort((a, b) => a.order - b.order)
      );
      setEditingId(null);
      setEditForm(null);
      triggerSuccess("Módulo actualizado");
    }
  }

  async function handleToggle(s: Section) {
    setTogglingId(s.id);
    const res = await updateSection(s.id, { isActive: !s.isActive });
    setTogglingId(null);
    if (res.section) {
      setSections((prev) => prev.map((item) => (item.id === s.id ? (res.section as Section) : item)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este módulo de navegación? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    const res = await deleteSection(id);
    setDeletingId(null);
    if (res.success) {
      setSections((prev) => prev.filter((s) => s.id !== id));
      triggerSuccess("Módulo eliminado");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle size={18} />
          <span className="text-xs font-black">{successMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Módulos del Sistema</h2>
          <p className="text-xs text-muted">
            Gestiona la visibilidad y roles de cada sección del panel de navegación lateral.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setCreateError(null);
          }}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-600/20"
        >
          {showCreate ? <X size={15} /> : <Plus size={15} />}
          {showCreate ? "Cancelar" : "Nuevo Módulo"}
        </button>
      </div>

      {/* Create Section Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-card border-2 border-accent/30 rounded-2xl p-6 shadow-md space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-accent flex items-center gap-2">
              <Plus size={16} /> Crear Nueva Sección de Navegación
            </h3>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={14} /> {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => handleCreateNameChange(e.target.value)}
                placeholder="Ej. Recetas VIP"
                className="w-full bg-background border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                Slug (Ruta /dashboard/...)
              </label>
              <input
                type="text"
                required
                value={createForm.slug}
                onChange={(e) => setCreateForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                placeholder="recetas-vip"
                className="w-full bg-background border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                Ícono
              </label>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-section-alt border border-card-border flex items-center justify-center text-accent shrink-0">
                  <DynamicIcon name={createForm.icon} size={18} />
                </div>
                <select
                  value={createForm.icon}
                  onChange={(e) => setCreateForm((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {ICON_OPTIONS.map((ico) => (
                    <option key={ico} value={ico}>{ico}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                Orden
              </label>
              <input
                type="number"
                value={createForm.order}
                onChange={(e) => setCreateForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                className="w-full bg-background border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
              Roles con Acceso
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => {
                const checked = createForm.roles.includes(r.key);
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => toggleRole(r.key, true)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      checked
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "bg-background text-muted border-card-border hover:border-accent/40"
                    }`}
                  >
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar Módulo
            </button>
          </div>
        </form>
      )}

      {/* Sections List */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-card-border">
          {sections.map((section) => {
            const isEditing = editingId === section.id;
            const isToggling = togglingId === section.id;
            const isDeleting = deletingId === section.id;

            return (
              <div
                key={section.id}
                className={`p-4 transition-colors ${
                  !section.isActive ? "bg-card/50 opacity-70" : "hover:bg-card-hover/40"
                }`}
              >
                {isEditing && editForm ? (
                  /* Edit Form */
                  <form onSubmit={handleUpdate} className="space-y-4 py-2">
                    {editError && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle size={14} /> {editError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-muted block mb-1">Nombre</label>
                        <input
                          type="text"
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => p && ({ ...p, name: e.target.value }))}
                          className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase text-muted block mb-1">Slug</label>
                        <input
                          type="text"
                          required
                          value={editForm.slug}
                          onChange={(e) => setEditForm((p) => p && ({ ...p, slug: slugify(e.target.value) }))}
                          className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase text-muted block mb-1">Ícono</label>
                        <select
                          value={editForm.icon}
                          onChange={(e) => setEditForm((p) => p && ({ ...p, icon: e.target.value }))}
                          className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                        >
                          {ICON_OPTIONS.map((ico) => (
                            <option key={ico} value={ico}>{ico}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase text-muted block mb-1">Orden</label>
                        <input
                          type="number"
                          value={editForm.order}
                          onChange={(e) => setEditForm((p) => p && ({ ...p, order: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => {
                          const checked = editForm.roles.includes(r.key);
                          return (
                            <button
                              key={r.key}
                              type="button"
                              onClick={() => toggleRole(r.key, false)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                                checked
                                  ? "bg-accent text-white border-accent"
                                  : "bg-background text-muted border-card-border"
                              }`}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditForm(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-card-border text-xs text-muted hover:text-foreground"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          Guardar
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Row View */
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-section-alt border border-card-border flex items-center justify-center text-accent shrink-0 shadow-sm">
                        <DynamicIcon name={section.icon} size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-foreground truncate">{section.name}</h4>
                          <span className="text-[11px] font-bold text-muted bg-section-alt border border-card-border px-1.5 py-0.5 rounded">
                            #{section.order}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted truncate font-mono">
                          /dashboard/{section.slug}
                        </p>
                      </div>
                    </div>

                    {/* Roles Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {section.roles.map((rk) => {
                        const roleObj = ROLES.find((r) => r.key === rk);
                        return (
                          <span
                            key={rk}
                            className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              roleObj ? roleObj.color : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {roleObj?.label || rk}
                          </span>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(section)}
                        disabled={isToggling}
                        title={section.isActive ? "Desactivar módulo" : "Activar módulo"}
                        className={`p-2 rounded-xl border transition-colors ${
                          section.isActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-section-alt border-card-border text-muted hover:text-foreground"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : section.isActive ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                      </button>

                      <button
                        onClick={() => startEditing(section)}
                        title="Editar módulo"
                        className="p-2 rounded-xl bg-section-alt border border-card-border text-muted hover:text-accent hover:border-accent/40 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(section.id)}
                        disabled={isDeleting}
                        title="Eliminar módulo"
                        className="p-2 rounded-xl bg-section-alt border border-card-border text-muted hover:text-red-500 hover:border-red-500/40 transition-colors"
                      >
                        {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="p-12 text-center text-muted text-xs">
              No hay módulos configurados. Crea el primero haciendo clic en &quot;Nuevo Módulo&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
