"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export default function SectionTabs({ label, tabs, initialTab = 0 }: {
  label: string;
  tabs: { label: string; content: ReactNode; count?: number }[];
  initialTab?: number;
}) {
  const id = useId();
  const [active, setActive] = useState(initialTab);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index - 1 + tabs.length) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <div className="min-w-0 space-y-4">
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5 rounded-xl border border-card-border bg-section-alt p-1.5">
        {tabs.map((tab, index) => (
          <button key={tab.label} ref={(node) => { buttons.current[index] = node; }}
            type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`}
            aria-selected={index === active} tabIndex={index === active ? 0 : -1}
            onKeyDown={(event) => navigate(event, index)} onClick={() => setActive(index)}
            className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-center text-xs font-bold text-muted hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent aria-selected:bg-accent-solid aria-selected:text-white max-sm:flex-1 sm:px-4 sm:text-sm"
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && <span className="rounded-md bg-black/10 px-1.5 py-0.5 tabular-nums">{tab.count}</span>}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div key={tab.label} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== active} tabIndex={0} className="min-w-0"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
