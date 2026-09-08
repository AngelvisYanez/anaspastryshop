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
      <div className="grid grid-cols-2 sm:flex items-center gap-2 p-1.5 bg-card border border-card-border rounded-xl w-full sm:w-fit mb-12">
        <button
          onClick={() => setTab("workshops")}
          aria-pressed={tab === "workshops"}
          className={`px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${
            tab === "workshops"
              ? "bg-accent text-white shadow-md shadow-pink-600/25"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Workshops Presenciales
        </button>
        <button
          onClick={() => setTab("online")}
          aria-pressed={tab === "online"}
          className={`px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${
            tab === "online"
              ? "bg-accent text-white shadow-md shadow-pink-600/25"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Cursos Online
        </button>
      </div>

      {tab === "workshops" ? (
        <CoursesGrid courses={workshops} />
      ) : (
        <CoursesGrid courses={onlineCourses} />
      )}
    </div>
  );
}