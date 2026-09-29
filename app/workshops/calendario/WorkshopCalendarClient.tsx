"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import FormacionCard from "@/components/FormacionCard";
import type { CalendarWorkshopEvent } from "@/lib/data/workshop-schedule";
import { parseLocalDate, toDateKey } from "@/lib/data/workshop-schedule";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type HoverState = {
  eventId: string;
  anchorRect: DOMRect;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function TooltipCard({
  event,
  anchorRect,
  onClose,
}: {
  event: CalendarWorkshopEvent;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const margin = 12;
    const gap = 10;
    const { width, height } = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.right + gap;
    let top = anchorRect.top + anchorRect.height / 2 - height / 2;

    if (left + width > vw - margin) {
      left = anchorRect.left - width - gap;
    }
    if (left < margin) {
      left = clamp(anchorRect.left + anchorRect.width / 2 - width / 2, margin, vw - width - margin);
      top = anchorRect.bottom + gap;
      if (top + height > vh - margin) {
        top = anchorRect.top - height - gap;
      }
    }

    top = clamp(top, margin, vh - height - margin);
    setPos({ top, left, ready: true });
  }, [anchorRect, event.session.id]);

  return (
    <div
      ref={panelRef}
      role="tooltip"
      id={`workshop-tooltip-${event.session.id}`}
      className={`fixed z-[80] w-[min(20rem,calc(100vw-1.5rem))] transition-[opacity,transform] duration-200 ease-out ${
        pos.ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="relative shadow-2xl shadow-brand-purple/20 rounded-2xl sm:rounded-3xl ring-1 ring-card-border bg-card max-h-[min(70dvh,34rem)] overflow-y-auto overscroll-contain">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-card/90 border border-card-border text-muted hover:text-foreground transition lg:hidden"
          aria-label="Cerrar información"
        >
          <X size={14} />
        </button>
        <FormacionCard course={event.card} />
      </div>
    </div>
  );
}

function MobileSheet({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: CalendarWorkshopEvent[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-brand-purple/50 backdrop-blur-[2px]"
        aria-label="Cerrar panel"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Workshops del día"
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-background border-t border-card-border shadow-2xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-4 fade-in duration-200"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-card-border px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-base font-black text-foreground capitalize truncate">
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <p className="text-xs text-muted font-medium">
              {events.length} {events.length === 1 ? "workshop" : "workshops"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full border border-card-border text-muted hover:text-foreground shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {events.map((event) => (
            <FormacionCard key={event.session.id} course={event.card} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkshopCalendarClient({
  events,
  eventsByDate,
}: {
  events: CalendarWorkshopEvent[];
  eventsByDate: Record<string, CalendarWorkshopEvent[]>;
}) {
  const router = useRouter();
  const labelId = useId();
  const [month, setMonth] = useState(() => {
    const first = events[0];
    return first
      ? startOfMonth(parseLocalDate(first.session.date))
      : startOfMonth(parseLocalDate("2026-10-01"));
  });
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCoarsePointer = useRef(false);

  useEffect(() => {
    isCoarsePointer.current = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const now = new Date();
    setTodayKey(toDateKey(now));
    const start = startOfMonth(now);
    const upcoming = events.find((e) => parseLocalDate(e.session.date) >= start);
    if (upcoming) {
      setMonth(startOfMonth(parseLocalDate(upcoming.session.date)));
    }
  }, [events]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const monthEvents = useMemo(() => {
    const keyPrefix = format(month, "yyyy-MM");
    return events.filter((e) => e.session.date.startsWith(keyPrefix));
  }, [events, month]);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const scheduleHide = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setHover(null), 120);
  }, []);

  const showTooltip = useCallback(
    (eventId: string, el: HTMLElement) => {
      if (isCoarsePointer.current) return;
      clearLeaveTimer();
      setHover({ eventId, anchorRect: el.getBoundingClientRect() });
    },
    []
  );

  useEffect(() => () => clearLeaveTimer(), []);

  const hoveredEvent = hover
    ? events.find((e) => e.session.id === hover.eventId) ?? null
    : null;

  const selectedEvents = selectedDay ? eventsByDate[toDateKey(selectedDay)] ?? [] : [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h2 id={labelId} className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-tight capitalize">
            {format(month, "MMMM yyyy", { locale: es })}
          </h2>
          <p className="text-sm text-muted font-medium mt-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-accent shrink-0" />
            Coro, Falcón · {monthEvents.length}{" "}
            {monthEvents.length === 1 ? "sesión" : "sesiones"} este mes
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-card-border bg-card text-foreground hover:border-accent/40 hover:bg-card-hover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(new Date()))}
            className="h-10 px-3 sm:px-4 rounded-xl border border-card-border bg-card text-xs font-bold text-foreground hover:border-accent/40 hover:bg-card-hover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-card-border bg-card text-foreground hover:border-accent/40 hover:bg-card-hover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl sm:rounded-3xl border border-card-border bg-card overflow-hidden shadow-sm"
        aria-labelledby={labelId}
      >
        <div className="grid grid-cols-7 border-b border-card-border bg-section-alt">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted"
            >
              <span className="sm:hidden">{day.charAt(0)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day) => {
            const key = toDateKey(day);
            const dayEvents = eventsByDate[key] ?? [];
            const inMonth = isSameMonth(day, month);
            const today = todayKey === key;
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={key}
                className={`relative min-h-[4.5rem] sm:min-h-[6.5rem] lg:min-h-[7.5rem] border-b border-r border-card-border/70 p-1 sm:p-1.5 transition-colors ${
                  inMonth ? "bg-card" : "bg-section-alt/50"
                } ${hasEvents && inMonth ? "hover:bg-card-hover" : ""}`}
              >
                {/* Mobile / tablet: un solo control por día */}
                {hasEvents ? (
                  <button
                    type="button"
                    className="lg:hidden flex h-full min-h-[4rem] w-full flex-col items-stretch gap-1 rounded-lg p-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`${dayEvents.length} workshops el ${format(day, "d 'de' MMMM", { locale: es })}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="flex items-start justify-between gap-1">
                      <time
                        dateTime={key}
                        className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold tabular-nums ${
                          today
                            ? "bg-accent-solid text-white"
                            : inMonth
                              ? "text-foreground"
                              : "text-muted/50"
                        }`}
                      >
                        {format(day, "d")}
                      </time>
                      <span className="mt-1 flex gap-0.5" aria-hidden>
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.session.id}
                            className="h-1.5 w-1.5 rounded-full bg-accent"
                          />
                        ))}
                      </span>
                    </span>
                    <span className="block text-[9px] sm:text-[10px] font-bold text-accent line-clamp-2 leading-snug px-0.5">
                      {dayEvents[0].workshop.shortTitle}
                      {dayEvents.length > 1 ? ` +${dayEvents.length - 1}` : ""}
                    </span>
                  </button>
                ) : (
                  <div className="lg:hidden">
                    <time
                      dateTime={key}
                      className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold tabular-nums ${
                        today
                          ? "bg-accent-solid text-white"
                          : inMonth
                            ? "text-foreground"
                            : "text-muted/50"
                      }`}
                    >
                      {format(day, "d")}
                    </time>
                  </div>
                )}

                {/* Desktop: píldoras con tooltip al hover */}
                <div className="hidden lg:block">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <time
                      dateTime={key}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                        today
                          ? "bg-accent-solid text-white"
                          : inMonth
                            ? "text-foreground"
                            : "text-muted/50"
                      }`}
                    >
                      {format(day, "d")}
                    </time>
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayEvents.map((event) => {
                      const active = hover?.eventId === event.session.id;
                      return (
                        <button
                          key={event.session.id}
                          type="button"
                          className={`group/pill w-full text-left rounded-lg px-1.5 py-1 border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            active
                              ? "bg-accent-solid border-accent-solid text-white shadow-md shadow-accent-solid/25"
                              : "bg-accent/10 border-accent/20 text-foreground hover:bg-accent-solid hover:border-accent-solid hover:text-white"
                          }`}
                          aria-describedby={
                            active ? `workshop-tooltip-${event.session.id}` : undefined
                          }
                          onMouseEnter={(e) => showTooltip(event.session.id, e.currentTarget)}
                          onMouseLeave={scheduleHide}
                          onFocus={(e) => showTooltip(event.session.id, e.currentTarget)}
                          onBlur={scheduleHide}
                          onClick={() => {
                            router.push(`/workshop/${event.workshop.slug}`);
                          }}
                        >
                          <span className="block text-[10px] font-black leading-tight line-clamp-2">
                            {event.workshop.shortTitle}
                          </span>
                          <span
                            className={`block text-[9px] font-semibold mt-0.5 tabular-nums ${
                              active ? "text-white/80" : "text-muted group-hover/pill:text-white/80"
                            }`}
                          >
                            {event.session.time ?? event.workshop.startTime} · ${event.workshop.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {monthEvents.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted font-medium">
          No hay workshops programados este mes.{" "}
          <button
            type="button"
            className="text-accent font-bold hover:underline"
            onClick={() => {
              const next = events.find(
                (e) => parseLocalDate(e.session.date) >= startOfMonth(new Date())
              );
              if (next) setMonth(startOfMonth(parseLocalDate(next.session.date)));
            }}
          >
            Ir al próximo disponible
          </button>
        </p>
      )}

      <div className="mt-8 sm:mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pb-3 border-b border-card-border">
          <h3 className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Sesiones de {format(month, "MMMM", { locale: es })}
          </h3>
          <Link href="/workshops" className="text-xs sm:text-sm font-bold text-accent hover:underline">
            Ver cartelera completa →
          </Link>
        </div>

        {monthEvents.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {monthEvents.map((event) => (
              <li key={event.session.id}>
                <Link
                  href={`/workshop/${event.workshop.slug}`}
                  className="flex gap-3 p-3 rounded-2xl border border-card-border bg-card hover:border-accent/40 hover:bg-card-hover transition group h-full"
                  onMouseEnter={(e) => {
                    if (!isCoarsePointer.current) {
                      showTooltip(event.session.id, e.currentTarget);
                    }
                  }}
                  onMouseLeave={scheduleHide}
                >
                  <div className="w-14 shrink-0 rounded-xl bg-accent/10 flex flex-col items-center justify-center text-accent border border-accent/15">
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {format(parseLocalDate(event.session.date), "MMM", { locale: es })}
                    </span>
                    <span className="text-xl font-black tabular-nums leading-none">
                      {format(parseLocalDate(event.session.date), "d")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-foreground group-hover:text-accent transition-colors line-clamp-2">
                      {event.workshop.shortTitle}
                    </p>
                    <p className="text-xs text-muted font-medium mt-1">
                      {event.session.time ?? event.workshop.startTime} · ${event.workshop.price} USD
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 capitalize">
                      {format(parseLocalDate(event.session.date), "EEEE", { locale: es })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted font-medium py-6 text-center">
            Sin sesiones este mes.
          </p>
        )}
      </div>

      {hoveredEvent && hover && !selectedDay && (
        <div
          onMouseEnter={clearLeaveTimer}
          onMouseLeave={scheduleHide}
        >
          <TooltipCard
            event={hoveredEvent}
            anchorRect={hover.anchorRect}
            onClose={() => setHover(null)}
          />
        </div>
      )}

      {selectedDay && selectedEvents.length > 0 && (
        <MobileSheet
          date={selectedDay}
          events={selectedEvents}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
