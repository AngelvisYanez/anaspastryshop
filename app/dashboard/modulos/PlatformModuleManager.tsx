"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  LayoutGrid, Plus, Trash2, Loader2, CheckCircle,
  Eye, EyeOff, Pencil, X, Save,
} from "lucide-react";
import { createSection, deleteSection, updateSection } from "@/lib/actions/platformSections";

const ICON_OPTIONS = [
  "BookOpen", "Video", "Users", "Star", "Zap", "Globe",
  "Shield", "Award", "Calendar", "BarChart2", "Radio", "LayoutGrid",
  "Layers", "Target", "TrendingUp", "CreditCard", "MessageSquare",
  "PlayCircle", "Mic", "GraduationCap", "Briefcase", "Heart", "Code", "Home",
];

const ROLES = [
  { key: "ADMIN",  label: "Admin",  color: "bg-amber-100 text-indigo-700 border-indigo-200" },
  { key: "MENTOR", label: "Mentor", color: "bg-purple-100 text-purple-700 border-purple-200" },
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
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type Section = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: string[];
};

type CreateForm = { name: string; slug: string; icon: string; order: number; roles: string[] };
type EditForm = { name: string; slug: string; icon: string; order: number; isActive: boolean; roles: string[] };

const EMPTY_CREATE: CreateForm = { name: "", slug: "", icon: "BookOpen", order: 0, roles: ["ADMIN", "MENTOR", "USER"] };

function RoleToggleGroup({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  function toggle(key: string) {
    onChange(
      selected.includes(key) ? selected.filter((r) => r !== key) : [...selected, key]
    );
  }
  return (
    <div className="flex gap-2">
      {ROLES.map(({ key, label, color }) => {
        const active = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
              active ? color + " border-current" : "border-card-border text-muted bg-card hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
      {ICON_OPTIONS.map((name) => (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => onChange(name)}
          className={`p-2.5 rounded-xl border-2 flex items-center justify-center transition-all ${
            value === name
              ? "border-accent bg-amber-50 text-accent"
              : "border-card-border text-muted hover:border-gray-300 hover:text-foreground"
          }`}
        >
          <DynamicIcon name={name} size={15} />
        </button>
      ))}
    </div>
  );
}

export default function PlatformModuleManager({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(section: Section) {
    setEditingId(section.id);
    setEditForm({
      name: section.name,
      slug: section.slug,
      icon: section.icon,
      order: section.order,
      isActive: section.isActive,
      roles: section.roles.length ? section.roles : ["ADMIN", "MENTOR", "USER"],
    });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (createForm.roles.length === 0) {
      setCreateError("Selecciona al menos un rol");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);

    const fd = new FormData();
    fd.set("name", createForm.name);
    fd.set("slug", createForm.slug);
    fd.set("icon", createForm.icon);
    fd.set("order", String(createForm.order));
    fd.set("roles", createForm.roles.join(","));

    const result = await createSection(fd);
    setCreateLoading(false);

    if (result.error) {
      setCreateError(result.error);
    } else if (result.section) {
      setSections((prev) => [...prev, result.section as Section].sort((a, b) => a.order - b.order));
      setCreateForm(EMPTY_CREATE);
      setCreating(false);
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editForm) return;
    if (editForm.roles.length === 0) {
      setEditError("Selecciona al menos un rol");
      return;
    }
    setEditLoading(true);
    setEditError(null);

    const result = await updateSection(id, {
      name: editForm.name,
      slug: editForm.slug,
      icon: editForm.icon,
      order: editForm.order,
      isActive: editForm.isActive,
      roles: editForm.roles,
    });

    setEditLoading(false);
    if (result.error) {
      setEditError(result.error);
    } else if (result.section) {
      setSections((prev) =>
        prev
          .map((s) => (s.id === id ? (result.section as Section) : s))
          .sort((a, b) => a.order - b.order)
      );
      cancelEdit();
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    await updateSection(id, { isActive: !current });
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !current } : s)));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este módulo de plataforma?")) return;
    await deleteSection(id);
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1">Módulos de Plataforma</h1>
          <p className="text-muted font-medium text-sm">
            Gestiona las secciones de navegación con icono, orden y visibilidad por rol.
          </p>
        </div>
        <button
          onClick={() => { setCreating(!creating); setCreateError(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-all ${
            creating
              ? "bg-section-alt text-foreground hover:bg-muted/20"
              : "bg-accent text-white shadow-lg shadow-accent/10 hover:bg-accent-hover"
          }`}
        >
          {creating ? <X size={16} /> : <Plus size={16} />}
          {creating ? "Cancelar" : "Nuevo Módulo"}
        </button>
      </div>

      {createSuccess && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm font-bold flex gap-2 items-center mb-6">
          <CheckCircle size={16} /> Módulo creado correctamente
        </div>
      )}

      {/* CREATE FORM */}
      {creating && (
        <div className="bg-card rounded-xl p-4 sm:p-8 border border-accent/20 shadow-lg shadow-amber-50 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-6 flex items-center gap-2">
            <LayoutGrid size={14} /> Nuevo Módulo
          </p>

          {createError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4">{createError}</div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">Nombre</label>
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCreateForm((f) => ({ ...f, name: v, slug: slugify(v) }));
                  }}
                  placeholder="Ej. Cursos Online"
                  className="w-full bg-section-alt rounded-lg py-3.5 px-5 outline-none focus:ring-2 focus:ring-accent font-bold text-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">Slug (URL)</label>
                <input
                  required
                  value={createForm.slug}
                  onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="cursos-online"
                  className="w-full bg-section-alt rounded-lg py-3.5 px-5 outline-none focus:ring-2 focus:ring-accent font-mono text-sm text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">Orden</label>
                <input
                  type="number"
                  min={0}
                  value={createForm.order}
                  onChange={(e) => setCreateForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-section-alt rounded-lg py-3.5 px-5 outline-none focus:ring-2 focus:ring-accent font-bold text-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">
                  Visible para roles
                </label>
                <RoleToggleGroup
                  selected={createForm.roles}
                  onChange={(roles) => setCreateForm((f) => ({ ...f, roles }))}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-2">
                Icono — <span className="text-accent">{createForm.icon}</span>
              </label>
              <IconPicker value={createForm.icon} onChange={(v) => setCreateForm((f) => ({ ...f, icon: v }))} />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createLoading}
                className="flex items-center gap-2 bg-[#0B1F3A] text-white px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-accent transition-all disabled:opacity-50"
              >
                {createLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {createLoading ? "Creando..." : "Crear Módulo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST */}
      <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
        <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-card-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">
            Módulos Configurados
            <span className="ml-2 text-xs text-muted font-normal">({sections.length})</span>
          </h2>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
            Ordenado por prioridad
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="p-16 text-center">
            <LayoutGrid className="mx-auto text-muted/30 mb-4" size={40} />
            <p className="text-muted font-bold text-sm">No hay módulos creados.</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 text-accent font-bold text-sm hover:underline"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sorted.map((section) => {
              const isEditing = editingId === section.id;
              return (
                <div key={section.id}>
                  {/* — ROW DISPLAY — */}
                  <div className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 transition-colors ${isEditing ? "bg-amber-50/40" : "hover:bg-card-hover"}`}>
                    {/* Icon + info */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${section.isActive ? "bg-amber-50 text-accent" : "bg-section-alt text-muted"}`}>
                      <DynamicIcon name={section.icon} size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${section.isActive ? "text-foreground" : "text-muted"}`}>
                          {section.name}
                        </p>
                        <span className="text-[10px] text-muted font-mono bg-section-alt px-2 py-0.5 rounded-md">
                          /{section.slug}
                        </span>
                        <span className="text-[10px] text-muted font-bold bg-section-alt px-2 py-0.5 rounded-md">
                          #{section.order}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {section.roles.length > 0 ? (
                          section.roles.map((r) => {
                            const meta = ROLES.find((x) => x.key === r);
                            return (
                              <span
                                key={r}
                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${meta?.color ?? "bg-section-alt text-muted border-card-border"}`}
                              >
                                {meta?.label ?? r}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[9px] text-muted font-bold">Sin roles asignados</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(section.id, section.isActive)}
                        title={section.isActive ? "Desactivar" : "Activar"}
                        className="p-2 rounded-xl text-muted hover:text-accent hover:bg-amber-50 transition-colors"
                      >
                        {section.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => isEditing ? cancelEdit() : startEdit(section)}
                        className={`p-2 rounded-xl transition-colors ${isEditing ? "text-accent bg-amber-50" : "text-muted/40 hover:text-accent hover:bg-amber-50"}`}
                      >
                        {isEditing ? <X size={16} /> : <Pencil size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* — INLINE EDIT FORM — */}
                  {isEditing && editForm && (
                    <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 bg-amber-50/30 border-t border-amber-200/60">
                      {editError && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4">{editError}</div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">Nombre</label>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => f && ({ ...f, name: e.target.value }))}
                            className="w-full bg-card border border-amber-200 rounded-lg py-3 px-4 outline-none focus:border-accent font-bold text-sm text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">Slug</label>
                          <input
                            value={editForm.slug}
                            onChange={(e) => setEditForm((f) => f && ({ ...f, slug: e.target.value }))}
                            className="w-full bg-card border border-amber-200 rounded-lg py-3 px-4 outline-none focus:border-accent font-mono text-sm text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">Orden</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.order}
                            onChange={(e) => setEditForm((f) => f && ({ ...f, order: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-card border border-amber-200 rounded-lg py-3 px-4 outline-none focus:border-accent font-bold text-sm text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-1.5">
                            Visible para roles
                          </label>
                          <RoleToggleGroup
                            selected={editForm.roles}
                            onChange={(roles) => setEditForm((f) => f && ({ ...f, roles }))}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 block mb-2">
                          Icono — <span className="text-accent">{editForm.icon}</span>
                        </label>
                        <IconPicker
                          value={editForm.icon}
                          onChange={(v) => setEditForm((f) => f && ({ ...f, icon: v }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setEditForm((f) => f && ({ ...f, isActive: !f.isActive }))}
                          className="flex items-center gap-2 text-sm font-bold text-foreground"
                        >
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${editForm.isActive ? "bg-accent" : "bg-muted/20"}`}>
                            <div className={`w-4 h-4 bg-card rounded-full shadow absolute top-0.5 transition-transform ${editForm.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                          </div>
                          {editForm.isActive ? "Activo" : "Inactivo"}
                        </button>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-5 py-2.5 rounded-lg font-bold text-sm text-muted bg-card border border-card-border hover:bg-section-alt transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={editLoading}
                            onClick={() => handleSaveEdit(section.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-[#0B1F3A] text-white hover:bg-accent transition-all disabled:opacity-50"
                          >
                            {editLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
