"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import CloudflareVideoUploader from "@/components/CloudflareVideoUploader";

export interface CourseTaskForm {
  title: string;
  summary: string;
}

export interface CourseModuleForm {
  title: string;
  videoUrl: string;
  tasks: CourseTaskForm[];
}

export function CourseModulesEditor({
  modules,
  sectionTitle,
  sectionDescription,
  openModuleIndex,
  canRemoveModule,
  onAddModule,
  onRemoveModule,
  onToggleModule,
  onModuleChange,
  onAddTask,
  onTaskChange,
  onRemoveTask,
}: {
  modules: CourseModuleForm[];
  sectionTitle: string;
  sectionDescription: string;
  openModuleIndex: number | null;
  canRemoveModule: boolean;
  onAddModule: () => void;
  onRemoveModule: (moduleIndex: number) => void;
  onToggleModule: (moduleIndex: number) => void;
  onModuleChange: (moduleIndex: number, field: "title" | "videoUrl", value: string) => void;
  onAddTask: (moduleIndex: number) => void;
  onTaskChange: (moduleIndex: number, taskIndex: number, field: keyof CourseTaskForm, value: string) => void;
  onRemoveTask: (moduleIndex: number, taskIndex: number) => void;
}) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="bg-accent-solid text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">3</span>
            {sectionTitle}
          </h2>
          <p className="text-xs text-muted mt-1 font-medium">{sectionDescription}</p>
        </div>
        <button
          type="button"
          onClick={onAddModule}
          className="text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus size={15} /> Añadir Módulo
        </button>
      </div>

      <div className="space-y-4">
        {modules.map((m, mIndex) => {
          const isOpen = openModuleIndex === mIndex;
          return (
            <div key={mIndex} className="bg-card rounded-2xl border border-card-border overflow-hidden shadow-sm transition-colors relative">
              {canRemoveModule && (
                <button
                  type="button"
                  onClick={() => onRemoveModule(mIndex)}
                  aria-label={`Eliminar módulo ${mIndex + 1}`}
                  className="absolute top-6 right-16 text-red-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors z-10"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggleModule(mIndex)}
                className="w-full p-6 flex justify-between items-start hover:bg-section-alt transition-colors cursor-pointer group text-left"
              >
                <div className="text-left flex-1 pr-16">
                  <span className="text-[11px] font-black text-accent uppercase tracking-widest block mb-1">
                    Módulo 0{mIndex + 1}
                  </span>
                  <span className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                    {m.title || `Módulo ${mIndex + 1}`}
                  </span>

                  {!isOpen && m.tasks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.tasks.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] bg-section-alt px-2 py-0.5 rounded-md text-muted border border-card-border"
                        >
                          {t.title || `Tema ${tIdx + 1}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={20}
                  className={`text-muted transition-transform mt-1 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="p-6 pt-0 border-t border-card-border space-y-6">
                  <div className="pt-4">
                    <label
                      htmlFor={`module-title-${mIndex}`}
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Título del Módulo
                    </label>
                    <input
                      id={`module-title-${mIndex}`}
                      value={m.title}
                      onChange={(e) => onModuleChange(mIndex, "title", e.target.value)}
                      type="text"
                      className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent transition text-foreground text-sm font-semibold"
                      placeholder="Ej. Módulo 1: Fundamentos y Masas Base"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`module-video-${mIndex}`}
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Video del Módulo (Video Principal)
                    </label>
                    <CloudflareVideoUploader
                      currentUrl={m.videoUrl || undefined}
                      onUpload={(url) => onModuleChange(mIndex, "videoUrl", url)}
                    />
                    <input
                      id={`module-video-${mIndex}`}
                      value={m.videoUrl}
                      onChange={(e) => onModuleChange(mIndex, "videoUrl", e.target.value)}
                      type="url"
                      className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2 mt-2 outline-none focus:border-accent text-foreground text-xs"
                      placeholder="O ingresa enlace de Cloudflare Stream, Vimeo o YouTube..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Lecciones o Pasos ({m.tasks.length})
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddTask(mIndex)}
                        className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Agregar Lección
                      </button>
                    </div>

                    {m.tasks.map((task, tIndex) => (
                      <div
                        key={tIndex}
                        className="bg-section-alt p-4 rounded-xl border border-card-border space-y-3"
                      >
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label
                              htmlFor={`task-title-${mIndex}-${tIndex}`}
                              className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1"
                            >
                              Lección {tIndex + 1}
                            </label>
                            <input
                              id={`task-title-${mIndex}-${tIndex}`}
                              value={task.title}
                              onChange={(e) => onTaskChange(mIndex, tIndex, "title", e.target.value)}
                              type="text"
                              className="w-full bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-accent"
                              placeholder={`Nombre de la lección ${tIndex + 1}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveTask(mIndex, tIndex)}
                            aria-label={`Eliminar lección ${tIndex + 1}`}
                            className="text-red-400 hover:text-red-500 p-1.5 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div>
                          <label
                            htmlFor={`task-summary-${mIndex}-${tIndex}`}
                            className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1"
                          >
                            Resumen
                          </label>
                          <textarea
                            id={`task-summary-${mIndex}-${tIndex}`}
                            value={task.summary}
                            onChange={(e) => onTaskChange(mIndex, tIndex, "summary", e.target.value)}
                            rows={2}
                            className="w-full bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted outline-none focus:border-accent"
                            placeholder="Resumen o receta de la clase (opcional)..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
