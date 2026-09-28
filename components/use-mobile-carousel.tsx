"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTOPLAY_MS = 5000;

export function useMobileCarousel<T extends HTMLElement>() {
  const trackRef = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const scrollByStep = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const step = track.clientWidth;
    if (dir > 0) {
      if (track.scrollLeft + step >= track.scrollWidth - 8) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    } else {
      track.scrollBy({ left: -step, behavior: "smooth" });
    }
  }, []);

  const next = useCallback(() => scrollByStep(1), [scrollByStep]);
  const prev = useCallback(() => scrollByStep(-1), [scrollByStep]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      if (id) {
        clearInterval(id);
        id = undefined;
      }
    };
    const start = () => {
      stop();
      if (reducedMotion) return;
      id = setInterval(next, AUTOPLAY_MS);
    };
    const onTouchStart = () => stop();
    const onPointerEnter = () => stop();
    const onPointerLeave = () => start();
    const onFocusIn = () => stop();
    const onFocusOut = (e: FocusEvent) => {
      if (!track.contains(e.relatedTarget as Node | null)) start();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") stop();
    };
    start();
    track.addEventListener("pointerenter", onPointerEnter);
    track.addEventListener("pointerleave", onPointerLeave);
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("focusin", onFocusIn);
    track.addEventListener("focusout", onFocusOut);
    track.addEventListener("keydown", onKeyDown);
    return () => {
      stop();
      track.removeEventListener("pointerenter", onPointerEnter);
      track.removeEventListener("pointerleave", onPointerLeave);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("focusin", onFocusIn);
      track.removeEventListener("focusout", onFocusOut);
      track.removeEventListener("keydown", onKeyDown);
    };
  }, [next, reducedMotion]);

  return { trackRef, next, prev };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function CarouselArrows({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) {
  return (
    <div className="flex md:hidden items-center justify-end gap-2 mt-5">
      <button
        type="button"
        onClick={prev}
        aria-label="Anterior"
        className="w-10 h-10 rounded-full bg-card border border-card-border text-foreground flex items-center justify-center transition hover:bg-accent/10 active:scale-95"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente"
        className="w-10 h-10 rounded-full bg-accent-solid text-white flex items-center justify-center shadow-lg shadow-accent-solid/25 transition hover:brightness-110 active:scale-95"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
