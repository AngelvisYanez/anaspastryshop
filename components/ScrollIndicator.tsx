"use client";

import { useCallback, useRef } from "react";
import { m } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollIndicator({ label = "Explorar" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    let node: HTMLElement | null = root.parentElement;
    while (node) {
      const next = node.nextElementSibling as HTMLElement | null;
      if (next) {
        next.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      node = node.parentElement;
    }
  }, []);

  return (
    <div ref={ref} className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
      <m.button
        type="button"
        onClick={handleClick}
        aria-label="Ir a la siguiente sección"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="group flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-white/90 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
      </m.button>
    </div>
  );
}