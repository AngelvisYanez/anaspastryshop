"use client";

import { Calendar, Clock, MapPin, Sparkles, Video } from "lucide-react";

const inputClass =
  "w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent";

const labelClass =
  "block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5";

export function ModalitySelector({
  isLive,
  onChange,
  onlineDescription,
  workshopDescription,
}: {
  isLive: boolean;
  onChange: (isLive: boolean) => void;
  onlineDescription: string;
  workshopDescription: string;
}) {
  return (
    <fieldset className="col-span-1 md:col-span-2 border-0 p-0 m-0">
      <legend className="block text-sm font-bold text-foreground mb-3">Modalidad del Programa</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          aria-pressed={!isLive}
          onClick={() => onChange(false)}
          className={`p-4 rounded-xl border-2 text-left font-bold transition ${
            !isLive
              ? "border-accent bg-pink-500/10 text-accent"
              : "border-card-border bg-section-alt text-muted hover:border-card-border/80"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Video size={18} />
            <span className="text-sm">Curso Online</span>
          </div>
          <p className="text-xs font-normal opacity-80">{onlineDescription}</p>
        </button>

        <button
          type="button"
          aria-pressed={isLive}
          onClick={() => onChange(true)}
          className={`p-4 rounded-xl border-2 text-left font-bold transition ${
            isLive
              ? "border-accent bg-accent-subtle text-accent"
              : "border-card-border bg-section-alt text-muted hover:border-card-border/80"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={18} />
            <span className="text-sm">Workshop Presencial</span>
          </div>
          <p className="text-xs font-normal opacity-80">{workshopDescription}</p>
        </button>
      </div>
    </fieldset>
  );
}

export function WorkshopLogistics({
  location,
  date,
  time,
  onLocationChange,
  onDateChange,
  onTimeChange,
}: {
  location: string;
  date: string;
  time: string;
  onLocationChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <div className="col-span-1 md:col-span-2 bg-accent-subtle/30 border border-accent/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-wider">
        <Sparkles size={16} /> Logística del Workshop Presencial
      </div>

      <div>
        <label htmlFor="course-location" className={labelClass}>
          <MapPin size={13} className="text-accent" /> Ubicación Física del Taller
        </label>
        <input
          id="course-location"
          type="text"
          required
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Ej. Caracas, Las Mercedes — Sede Ana's Pastry Shop"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course-workshop-date" className={labelClass}>
            <Calendar size={13} className="text-accent" /> Fecha del Workshop
          </label>
          <input
            id="course-workshop-date"
            type="text"
            required
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="Ej. Sábado 15 de Noviembre, 2025"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="course-workshop-time" className={labelClass}>
            <Clock size={13} className="text-accent" /> Horario del Workshop
          </label>
          <input
            id="course-workshop-time"
            type="text"
            required
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            placeholder="Ej. 09:00 AM — 05:00 PM"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
