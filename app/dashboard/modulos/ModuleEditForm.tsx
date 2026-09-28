"use client";

import { useState } from "react";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { updateSection } from "@/lib/actions/platformSections";
import {
  ICON_OPTIONS,
  ROLES,
  slugify,
  type PlatformSection,
} from "./moduleShared";

export function ModuleEditForm({
  section,
  onUpdated,
  onCancel,
  onSuccess,
}: {
  section: PlatformSection;
  onUpdated: (section: PlatformSection) => void;
  onCancel: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [editForm, setEditForm] = useState({
    name: section.name,
    slug: section.slug,
    icon: section.icon,
    order: section.order,
    isActive: section.isActive,
    roles: section.roles,
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function toggleRole(role: string) {
    setEditForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError(null);

    try {
      const res = await updateSection(section.id, {
        name: editForm.name,
        slug: editForm.slug,
        icon: editForm.icon,
        order: editForm.order,
        isActive: editForm.isActive,
        roles: editForm.roles,
      });

      if (res.error) {
        setEditError(res.error);
      } else if (res.section) {
        onUpdated(res.section as PlatformSection);
        onSuccess("Módulo actualizado");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4 py-2">
      {editError && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={14} /> {editError}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label htmlFor={`edit-module-name-${section.id}`} className="text-[11px] font-bold uppercase text-muted block mb-1">Nombre</label>
          <input
            id={`edit-module-name-${section.id}`}
            type="text"
            required
            value={editForm.name}
            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor={`edit-module-slug-${section.id}`} className="text-[11px] font-bold uppercase text-muted block mb-1">Slug</label>
          <input
            id={`edit-module-slug-${section.id}`}
            type="text"
            required
            value={editForm.slug}
            onChange={(e) => setEditForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
            className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor={`edit-module-icon-${section.id}`} className="text-[11px] font-bold uppercase text-muted block mb-1">Ícono</label>
          <select
            id={`edit-module-icon-${section.id}`}
            value={editForm.icon}
            onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))}
            className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          >
            {ICON_OPTIONS.map((ico) => (
              <option key={ico} value={ico}>{ico}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`edit-module-order-${section.id}`} className="text-[11px] font-bold uppercase text-muted block mb-1">Orden</label>
          <input
            id={`edit-module-order-${section.id}`}
            type="number"
            value={editForm.order}
            onChange={(e) => setEditForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
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
                onClick={() => toggleRole(r.key)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
                  checked
                    ? "bg-accent-solid text-white border-accent"
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
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-card-border text-xs text-muted hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent-solid hover:bg-accent-solid-hover text-white px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
