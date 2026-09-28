"use client";
import { useState } from "react";
import CoursesGrid from "@/components/CoursesGrid";
import type { FormacionCardData } from "@/components/FormacionCard";

export default function CapacitacionesTabs({
  workshops,
  onlineCourses,
}: {
  workshops: FormacionCardData[];
  onlineCourses: FormacionCardData[];
}) {
  const [tab, setTab] = useState<"workshops" | "online">("workshops");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tipo de formación"
        className="grid grid-cols-2 sm:flex items-center gap-2 p-1.5 bg-card border border-card-border rounded-xl w-full sm:w-fit mb-12"
      >
        <button
          role="tab"
          id="tab-workshops"
          aria-controls="panel-workshops"
          aria-selected={tab === "workshops"}
          tabIndex={tab === "workshops" ? 0 : -1}
          onClick={() => setTab("workshops")}
          className={`px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${
            tab === "workshops"
              ? "bg-accent-solid text-white shadow-md shadow-accent-solid/25"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Workshops Presenciales
        </button>
        <button
          role="tab"
          id="tab-online"
          aria-controls="panel-online"
          aria-selected={tab === "online"}
          tabIndex={tab === "online" ? 0 : -1}
          onClick={() => setTab("online")}
          className={`px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${
            tab === "online"
              ? "bg-accent-solid text-white shadow-md shadow-accent-solid/25"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Cursos Online
        </button>
      </div>

      {tab === "workshops" ? (
        <div role="tabpanel" id="panel-workshops" aria-labelledby="tab-workshops">
          <CoursesGrid courses={workshops} />
        </div>
      ) : (
        <div role="tabpanel" id="panel-online" aria-labelledby="tab-online">
          <CoursesGrid courses={onlineCourses} />
        </div>
      )}

    </div>
  );
}
