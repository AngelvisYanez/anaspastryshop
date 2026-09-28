"use client";

import { useState } from "react";
import { Plus, X, CheckCircle } from "lucide-react";
import { ModuleCreateForm } from "./ModuleCreateForm";
import { ModuleSectionRow } from "./ModuleSectionRow";
import type { PlatformSection } from "./moduleShared";

export default function PlatformModuleManager({
  initialSections,
}: {
  initialSections: PlatformSection[];
}) {
  const [sections, setSections] = useState<PlatformSection[]>(initialSections);
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function triggerSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle size={18} />
          <span className="text-xs font-black">{successMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Módulos del Sistema</h2>
          <p className="text-xs text-muted">
            Gestiona la visibilidad y roles de cada sección del panel de navegación lateral.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 bg-accent-solid hover:bg-accent-solid-hover text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-accent-solid/20"
        >
          {showCreate ? <X size={15} /> : <Plus size={15} />}
          {showCreate ? "Cancelar" : "Nuevo Módulo"}
        </button>
      </div>

      {showCreate && (
        <ModuleCreateForm
          nextOrder={sections.length + 1}
          onCancel={() => setShowCreate(false)}
          onCreated={(section) => {
            setSections((prev) => [...prev, section].sort((a, b) => a.order - b.order));
            setShowCreate(false);
            triggerSuccess("Módulo creado correctamente");
          }}
        />
      )}

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-card-border">
          {sections.map((section) => (
            <ModuleSectionRow
              key={section.id}
              section={section}
              onUpdated={(updated) => {
                setSections((prev) =>
                  prev
                    .map((s) => (s.id === updated.id ? updated : s))
                    .sort((a, b) => a.order - b.order),
                );
              }}
              onDeleted={(id) => {
                setSections((prev) => prev.filter((s) => s.id !== id));
              }}
              onSuccess={triggerSuccess}
            />
          ))}

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
