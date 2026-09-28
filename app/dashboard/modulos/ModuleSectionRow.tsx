"use client";

import { useState } from "react";
import { Trash2, Loader2, Eye, EyeOff, Pencil } from "lucide-react";
import { deleteSection, updateSection } from "@/lib/actions/platformSections";
import { ROLES, type PlatformSection } from "./moduleShared";
import { DynamicIcon } from "./DynamicIcon";
import { ModuleEditForm } from "./ModuleEditForm";

export function ModuleSectionRow({
  section,
  onUpdated,
  onDeleted,
  onSuccess,
}: {
  section: PlatformSection;
  onUpdated: (section: PlatformSection) => void;
  onDeleted: (id: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await updateSection(section.id, { isActive: !section.isActive });
      if (res.section) onUpdated(res.section as PlatformSection);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este módulo de navegación? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    try {
      const res = await deleteSection(section.id);
      if (res.success) {
        onDeleted(section.id);
        onSuccess("Módulo eliminado");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={`p-4 transition-colors ${
        !section.isActive ? "bg-card/50 opacity-70" : "hover:bg-card-hover/40"
      }`}
    >
      {isEditing ? (
        <ModuleEditForm
          section={section}
          onUpdated={(updated) => {
            onUpdated(updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          onSuccess={onSuccess}
        />
      ) : (
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggle}
              disabled={toggling}
              title={section.isActive ? "Desactivar módulo" : "Activar módulo"}
              className={`p-2 rounded-xl border transition-colors ${
                section.isActive
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
                  : "bg-section-alt border-card-border text-muted hover:text-foreground"
              }`}
            >
              {toggling ? (
                <Loader2 size={15} className="animate-spin" />
              ) : section.isActive ? (
                <Eye size={15} />
              ) : (
                <EyeOff size={15} />
              )}
            </button>

            <button
              onClick={() => setIsEditing(true)}
              title="Editar módulo"
              className="p-2 rounded-xl bg-section-alt border border-card-border text-muted hover:text-accent hover:border-accent/40 transition-colors"
            >
              <Pencil size={15} />
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Eliminar módulo"
              className="p-2 rounded-xl bg-section-alt border border-card-border text-muted hover:text-red-500 hover:border-red-500/40 transition-colors"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
