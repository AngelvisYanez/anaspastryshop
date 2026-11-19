"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { chartLabels, chartOptions, defaultWidgets, makeWidget, widgets, type ChartStyle, type Widget, type WidgetId } from "./widgets";

const button = "inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-card-border bg-card px-2 text-xs font-bold text-foreground hover:bg-section-alt disabled:opacity-35";

export function WidgetEditor({ initial, onSave, onClose }: {
  initial: Widget[]; onSave: (widgets: Widget[]) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  function move(index: number, offset: number) {
    const next = [...draft];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setDraft(next);
  }

  function update(id: WidgetId, patch: Partial<Pick<Widget, "chart" | "wide">>) {
    setDraft((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  const available = (Object.keys(widgets) as WidgetId[]).filter((id) => !draft.some((item) => item.id === id));

  return (
    <dialog ref={dialog} aria-labelledby="widget-editor-title" onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="m-auto max-h-[calc(100dvh_-_1rem)] w-[calc(100%_-_1rem)] max-w-2xl overflow-y-auto rounded-2xl border border-card-border bg-card text-foreground shadow-2xl backdrop:bg-black/60">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-card-border bg-card p-4 sm:px-6">
        <div>
          <h2 id="widget-editor-title" className="text-lg font-black">Personalizar widgets</h2>
          <p className="text-sm text-muted">Elige qué mostrar y en qué orden.</p>
        </div>
        <button type="button" className={button} aria-label="Cerrar editor" onClick={onClose}><X size={16} /></button>
      </header>
      <div className="space-y-5 p-4 sm:px-6">
        <section aria-labelledby="active-widgets">
          <h3 id="active-widgets" className="mb-2 text-sm font-bold">En el panel ({draft.length})</h3>
          {draft.length === 0 && <p className="text-sm text-muted">Añade un indicador o gráfico para mostrarlo en el panel.</p>}
          <ol className="space-y-2">
            {draft.map((item, index) => {
              const definition = widgets[item.id];
              const options = chartOptions(item.id);
              return <li key={item.id} className="rounded-xl border border-card-border bg-section-alt p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">{definition.label}</span>
                  <div className="flex gap-1">
                    <button type="button" className={button} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Subir ${definition.label}`}><ArrowUp size={15} /></button>
                    <button type="button" className={button} disabled={index === draft.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar ${definition.label}`}><ArrowDown size={15} /></button>
                    <button type="button" className={button} onClick={() => setDraft((current) => current.filter(({ id }) => id !== item.id))} aria-label={`Quitar ${definition.label}`}><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {options.length > 0 && <label className="flex items-center gap-1.5 text-xs text-muted">Gráfico
                    <select aria-label={`Gráfico para ${definition.label}`} className={button} value={item.chart} onChange={(e) => update(item.id, { chart: e.target.value as ChartStyle })}>
                      {options.map((option) => <option key={option} value={option}>{chartLabels[option]}</option>)}
                    </select>
                  </label>}
                  <label className="flex items-center gap-1.5 text-xs text-muted">Ancho
                    <select aria-label={`Ancho para ${definition.label}`} className={button} value={item.wide ? "wide" : "normal"} onChange={(e) => update(item.id, { wide: e.target.value === "wide" })}>
                      <option value="normal">Normal</option><option value="wide">Completo</option>
                    </select>
                  </label>
                </div>
              </li>;
            })}
          </ol>
        </section>
        {available.length > 0 && <section aria-labelledby="available-widgets">
          <h3 id="available-widgets" className="mb-2 text-sm font-bold">Disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {available.map((id) => <button key={id} type="button" className={button} onClick={() => setDraft((items) => [...items, makeWidget(id)])}>
              <Plus size={15} />{widgets[id].label}
            </button>)}
          </div>
        </section>}
      </div>
      <footer className="sticky bottom-0 flex flex-wrap justify-between gap-2 border-t border-card-border bg-card p-3 sm:px-6">
        <button type="button" className={button} onClick={() => setDraft(defaultWidgets)}><RotateCcw size={14} /> Restablecer</button>
        <button type="button" className="min-h-11 rounded-lg bg-accent-solid px-4 text-sm font-bold text-white hover:bg-accent-solid-hover" onClick={() => onSave(draft)}>Guardar panel</button>
      </footer>
    </dialog>
  );
}
