"use client";

import { useState } from "react";
import {
  Plus, X, Save, Loader2, AlertCircle,
} from "lucide-react";
import { createSection } from "@/lib/actions/platformSections";
import { ICON_OPTIONS, ROLES, slugify, type PlatformSection } from "./moduleShared";
import { DynamicIcon } from "./DynamicIcon";

type CreateFormState = {
  name: string;
  slug: string;
  icon: string;
  order: number;
  roles: string[];
};

export function ModuleCreateForm({
  nextOrder,
  onCreated,
  onCancel,
}: {
  nextOrder: number;
  onCreated: (section: PlatformSection) => void;
  onCancel: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    name: "",
    slug: "",
    icon: "Layers",
    order: nextOrder,
    roles: ["ADMIN", "USER"],
  });

  function handleNameChange(name: string) {
    setCreateForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === slugify(prev.name) || !prev.slug ? slugify(name) : prev.slug,
    }));
  }

  function toggleRole(role: string) {
    setCreateForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
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

    try {
      const res = await createSection(fd);
      if (res.error) {
        setCreateError(res.error);
      } else if (res.section) {
        onCreated(res.section as PlatformSection);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
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
          onClick={onCancel}
          aria-label="Cerrar formulario de nueva sección"
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
          <label htmlFor="create-module-name" className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
            Nombre
          </label>
          <input
            id="create-module-name"
            type="text"
            required
            value={createForm.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ej. Recetas VIP"
            className="w-full bg-background border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="create-module-slug" className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
            Slug (Ruta /dashboard/...)
          </label>
          <input
            id="create-module-slug"
            type="text"
            required
            value={createForm.slug}
            onChange={(e) => setCreateForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
            placeholder="recetas-vip"
            className="w-full bg-background border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="create-module-icon" className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
            Ícono
          </label>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-section-alt border border-card-border flex items-center justify-center text-accent shrink-0">
              <DynamicIcon name={createForm.icon} size={18} />
            </div>
            <select
              id="create-module-icon"
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
          <label htmlFor="create-module-order" className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
            Orden
          </label>
          <input
            id="create-module-order"
            type="number"
            value={createForm.order}
            onChange={(e) => setCreateForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
            className="w-full bg-background border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
            Roles con Acceso
          </legend>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const checked = createForm.roles.includes(r.key);
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => toggleRole(r.key)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    checked
                      ? "bg-accent-solid text-white border-accent shadow-sm"
                      : "bg-background text-muted border-card-border hover:border-accent/40"
                  }`}
                >
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={creating}
          className="bg-accent-solid hover:bg-accent-solid-hover text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-50"
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Guardar Módulo
        </button>
      </div>
    </form>
  );
}
