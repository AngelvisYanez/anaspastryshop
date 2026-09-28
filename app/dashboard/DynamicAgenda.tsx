"use client";
import { useState } from "react";
import { Plus, Trash2, Clock, ListTodo } from "lucide-react";

export default function DynamicAgenda({
  agenda,
  setAgenda,
}: {
  agenda: { hour: string; task: string }[];
  setAgenda: (agenda: { hour: string; task: string }[]) => void;
}) {
  // Stable client-only row keys, kept out of `agenda` so they never reach the saved payload.
  // Without them, deleting a row leaves the inputs below it holding the wrong values.
  const [keys, setKeys] = useState<string[]>(() => agenda.map(() => crypto.randomUUID()));

  const addItem = () => {
    setKeys((k) => [...k, crypto.randomUUID()]);
    setAgenda([...agenda, { hour: "", task: "" }]);
  };

  const removeItem = (index: number) => {
    setKeys((k) => k.filter((_, i) => i !== index));
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: "hour" | "task", value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index][field] = value;
    setAgenda(newAgenda);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-black uppercase text-muted tracking-widest block ml-2">Cronograma del Curso</div>
      {agenda.map((item, index) => (
        // `agenda` only ever changes through addItem/removeItem below, which keep `keys` in step
        <div key={keys[index]} className="flex gap-4 items-center">
          <div className="relative flex-1">
            <label htmlFor={`agenda-hour-${keys[index]}`} className="sr-only">Hora del cronograma {index + 1}</label>
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" size={16} />
            <input
              id={`agenda-hour-${keys[index]}`}
              type="text"
              placeholder="09:00 AM"
              value={item.hour}
              onChange={(e) => updateItem(index, "hour", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-section-alt rounded-xl border-none focus:ring-2 focus:ring-accent text-sm font-medium"
              required
            />
          </div>
          <div className="relative flex-[2]">
            <label htmlFor={`agenda-task-${keys[index]}`} className="sr-only">Actividad del cronograma {index + 1}</label>
            <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" size={16} />
            <input
              id={`agenda-task-${keys[index]}`}
              type="text"
              placeholder="Ej. Introducción y Setup"
              value={item.task}
              onChange={(e) => updateItem(index, "task", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-section-alt rounded-xl border-none focus:ring-2 focus:ring-accent text-sm font-medium"
              required
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label={`Eliminar actividad ${index + 1} del cronograma`}
            className="p-3 text-red-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <button 
        type="button" onClick={addItem}
        className="flex items-center gap-2 text-accent font-bold text-sm hover:underline ml-2"
      >
        <Plus size={16} /> Añadir actividad
      </button>
    </div>
  );
}