"use client";

import { BellRing, Calendar, Clock, MapPin, Sparkles, Video } from "lucide-react";
import {
  formatWorkshopDateLabel,
  WORKSHOP_DATE_PENDING,
  WORKSHOP_TIME_DEFAULT,
  workshopDateToIso,
} from "@/lib/utils/workshop";

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

function openDatePicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker?.();
  } catch {
    input.focus();
  }
}

export function WorkshopLogistics({
  location,
  date,
  time,
  onLocationChange,
  onDateChange,
  onTimeChange,
  notifyClients,
  onNotifyClientsChange,
}: {
  location: string;
  date: string;
  time: string;
  onLocationChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  notifyClients?: boolean;
  onNotifyClientsChange?: (value: boolean) => void;
}) {
  const isoDate = workshopDateToIso(date);

  return (
    <div className="col-span-1 md:col-span-2 bg-accent-subtle/30 border border-accent/20 rounded-2xl p-4 sm:p-5 space-y-4">
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
          placeholder="Ej. Av. Tirso Salavarria, Frente al museo de la UNEFM. Coro, Falcón, Venezuela"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course-workshop-date" className={labelClass}>
            <Calendar size={13} className="text-accent" /> Fecha del Workshop
            <span className="font-medium text-muted normal-case">(opcional)</span>
          </label>
          <div className="relative">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Abrir calendario"
              onClick={() =>
                openDatePicker(
                  document.getElementById("course-workshop-date") as HTMLInputElement | null,
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 text-accent z-10"
            >
              <Calendar size={16} />
            </button>
            <input
              id="course-workshop-date"
              type="date"
              value={isoDate}
              onChange={(e) => {
                const nextIso = e.target.value;
                if (nextIso) {
                  onDateChange(formatWorkshopDateLabel(nextIso));
                  if (!time.trim()) onTimeChange(WORKSHOP_TIME_DEFAULT);
                } else {
                  onDateChange("");
                  onTimeChange("");
                }
              }}
              onClick={(e) => openDatePicker(e.currentTarget)}
              className={`${inputClass} pl-10 cursor-pointer`}
            />
          </div>
          {date && !isoDate && (
            <p className="mt-1.5 text-[11px] text-muted font-medium">
              Fecha actual: {date}. Elige una nueva en el calendario o déjala vacía.
            </p>
          )}
          {isoDate ? (
            <p className="mt-1.5 text-[11px] text-muted font-medium">
              Se guardará como: {formatWorkshopDateLabel(isoDate)}. Debes indicar también el horario.
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-muted font-medium">
              Sin fecha ni hora, en público se mostrará «{WORKSHOP_DATE_PENDING}» y no se podrá comprar.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="course-workshop-time" className={labelClass}>
            <Clock size={13} className="text-accent" /> Horario del Workshop
            {!isoDate && (
              <span className="font-medium text-muted normal-case">(con la fecha)</span>
            )}
          </label>
          <input
            id="course-workshop-time"
            type="text"
            required={Boolean(isoDate)}
            disabled={!isoDate}
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            placeholder={isoDate ? "Ej. 09:00 AM — 05:00 PM" : "Primero elige una fecha"}
            className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
          />
        </div>
      </div>

      {onNotifyClientsChange && (
        <label
          htmlFor="course-notify-clients"
          className="flex items-start gap-3 rounded-xl border border-accent/25 bg-card/70 p-3 sm:p-4 cursor-pointer"
        >
          <input
            id="course-notify-clients"
            type="checkbox"
            checked={Boolean(notifyClients)}
            onChange={(e) => onNotifyClientsChange(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
          />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <BellRing size={14} className="text-accent shrink-0" />
              Avisar nueva fecha a clientes registrados
            </span>
            <span className="mt-1 block text-xs text-muted leading-relaxed">
              Envía email a las cuentas activas y WhatsApp a quienes autorizaron novedades.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
