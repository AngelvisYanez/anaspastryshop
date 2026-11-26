"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  HEATMAP_COLUMNS, HEATMAP_ROWS, INSIGHTS_BATCH_SIZE,
  insightPath, isInsightSection, type InsightEvent,
} from "@/lib/site-insights";

const sectionSelector = "[data-insight-section], main, main section, header, footer";

export default function SiteInsightsTracker() {
  const pathname = usePathname();
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    const path = insightPath(pathname);
    const changed = lastPage.current !== pathname;
    lastPage.current = pathname;
    if (!path) return;

    const viewport = window.matchMedia("(max-width: 767px)");
    const pending: Record<"mobile" | "desktop", InsightEvent[]> = { mobile: [], desktop: [] };
    const seenSections = new Set<string>();
    let timer: number | undefined;
    let frame = 0;
    let sections = new Map<Element, string>();

    function flush() {
      window.clearTimeout(timer);
      timer = undefined;
      for (const device of ["mobile", "desktop"] as const) {
        const events = pending[device].splice(0);
        if (!events.length) continue;
        void fetch("/api/site-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, events, mobile: device === "mobile" }),
          keepalive: true,
          credentials: "omit",
          referrerPolicy: "no-referrer",
        }).catch(() => {});
      }
    }

    function record(event: InsightEvent) {
      const queue = pending[viewport.matches ? "mobile" : "desktop"];
      queue.push(event);
      if (queue.length === INSIGHTS_BATCH_SIZE) flush();
      else timer ??= window.setTimeout(flush, 1200);
    }

    if (changed) {
      record({ kind: "PAGE_VIEW" });
      flush();
    }

    // Count a section once when a meaningful strip of it enters the viewport.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const section = sections.get(entry.target);
        if (document.visibilityState !== "visible" || !section || !entry.isIntersecting ||
            seenSections.has(section)) continue;
        seenSections.add(section);
        record({ kind: "SECTION_VIEW", section });
      }
    }, { rootMargin: "-10% 0px -10% 0px" });

    function scanSections() {
      frame = 0;
      let ordinal = 0;
      const nextSections = new Map<Element, string>();
      for (const element of document.querySelectorAll(sectionSelector)) {
        const explicit = element.getAttribute("data-insight-section");
        const section = isInsightSection(explicit) ? explicit :
          element.matches("main") ? "contenido" :
          element.matches("footer") ? "pie" :
          element.matches("header") ? "navegacion" : `seccion-${++ordinal}`;
        if (!isInsightSection(section)) continue;
        nextSections.set(element, section);
        if (sections.get(element) !== section) {
          observer.unobserve(element);
          observer.observe(element);
        }
      }
      for (const element of sections.keys()) {
        if (!nextSections.has(element)) observer.unobserve(element);
      }
      sections = nextSections;
    }

    const mutations = new MutationObserver(() => {
      if (!frame) frame = window.requestAnimationFrame(scanSections);
    });
    scanSections();
    mutations.observe(document.body, { childList: true, subtree: true });

    function recordClick(event: MouseEvent) {
      if (!event.isTrusted || event.detail === 0 || !(event.target instanceof Element)) return;
      if (event.target.closest("input, textarea, [contenteditable]")) return;
      const element = event.target.closest(sectionSelector);
      const section = (element && sections.get(element)) || "contenido";
      const root = document.documentElement;
      const column = Math.max(0, Math.min(HEATMAP_COLUMNS - 1,
        Math.floor(event.pageX * HEATMAP_COLUMNS / root.scrollWidth)));
      const row = Math.max(0, Math.min(HEATMAP_ROWS - 1,
        Math.floor(event.pageY * HEATMAP_ROWS / root.scrollHeight)));
      record({ kind: "CLICK", section, cell: row * HEATMAP_COLUMNS + column });
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") flush();
      else {
        // IntersectionObserver might have fired while the tab was hidden.
        for (const [element, section] of sections) {
          if (seenSections.has(section)) continue;
          observer.unobserve(element);
          observer.observe(element);
        }
      }
    }

    document.addEventListener("click", recordClick, true);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      mutations.disconnect();
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      document.removeEventListener("click", recordClick, true);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname]);

  return null;
}
