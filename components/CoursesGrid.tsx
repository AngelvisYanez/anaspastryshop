"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FormacionCard, { type FormacionCardData } from "@/components/FormacionCard";

const AUTOPLAY_MS = 7000;

export default function CoursesGrid({
  courses,
}: {
  courses: FormacionCardData[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  if (!courses.length) {
    return (
      <p className="text-sm text-muted font-medium text-center py-12 border border-dashed border-card-border rounded-2xl">
        Próximamente anunciaremos nuevas formaciones por WhatsApp.
      </p>
    );
  }

  const step = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const gap = 24;
    return cardWidth + gap;
  };

  const sharePrevNext = () => {
    const el = trackRef.current;
    if (!el) return;
    const s = step();
    if (!s) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth + 8 < el.scrollWidth);
  };

  const prev = () => {
    const el = trackRef.current;
    if (!el) return;
    const s = step();
    el.scrollBy({ left: -(s ?? 0), behavior: "smooth" });
  };

  const next = () => {
    const el = trackRef.current;
    if (!el) return;
    const s = step();
    el.scrollBy({ left: s ?? 0, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sharePrevNext();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => sharePrevNext());
      ro.observe(el);
      return () => ro.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setAutoplayEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!autoplayEnabled || paused) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const s = step();
      if (!s) return;
      if (el.scrollLeft + el.clientWidth + 8 >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: s, behavior: "smooth" });
      }
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayEnabled, paused]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {autoplayEnabled && canPrev && (
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-card border border-card-border shadow-md w-11 h-11 rounded-xl flex items-center justify-center hover:bg-card-hover transition-colors"
          aria-label="Ver anteriores"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        ref={trackRef}
        onScroll={sharePrevNext}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {courses.map((course) => (
          <div key={course.id} className="w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-w-0 shrink-0">
            <FormacionCard course={course} />
          </div>
        ))}
      </div>

      {autoplayEnabled && canNext && (
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-card border border-card-border shadow-md w-11 h-11 rounded-xl flex items-center justify-center hover:bg-card-hover transition-colors"
          aria-label="Ver siguientes"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
