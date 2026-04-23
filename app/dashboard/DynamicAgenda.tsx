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
  const addItem = () => setAgenda([...agenda, { hour: "", task: "" }]);
  const removeItem = (index: number) => setAgenda(agenda.filter((_, i) => i !== index));

  const updateItem = (index: number, field: "hour" | "task", value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index][field] = value;
    setAgenda(newAgenda);
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-black uppercase text-gray-400 tracking-widest block ml-2">Cronograma del Curso</label>
      {agenda.map((item, index) => (
        <div key={index} className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="09:00 AM" 
              value={item.hour}
              onChange={(e) => updateItem(index, "hour", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C9A84C] text-sm font-medium"
              required
            />
          </div>
          <div className="relative flex-[2]">
            <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="Ej. Introducción y Setup" 
              value={item.task}
              onChange={(e) => updateItem(index, "task", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C9A84C] text-sm font-medium"
              required
            />
          </div>
          <button 
            type="button"
            onClick={() => removeItem(index)}
            className="p-3 text-red-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <button 
        type="button" onClick={addItem}
        className="flex items-center gap-2 text-[#C9A84C] font-bold text-sm hover:underline ml-2"
      >
        <Plus size={16} /> Añadir actividad
      </button>
    </div>
  );
}