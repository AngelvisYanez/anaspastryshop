"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { m } from "framer-motion";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  level: string;
  image: string | null;
  totalHours: number;
}

export default function CoursesCarousel({ courses }: { courses: Course[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = ref.current.offsetWidth * 0.75;
    ref.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  if (courses.length === 0) {
    return (
      <p className="text-muted text-center py-16">
        Próximamente nuevos cursos disponibles.
      </p>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-card border border-card-border shadow-md w-11 h-11 rounded-xl flex items-center justify-center hover:bg-card-hover transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {courses.map((course, i) => (
          <m.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex-none w-72"
          >
            <Link href={`/cursos/${course.id}`}>
              <div className="bg-card rounded-xl p-4 border border-card-border group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                <div className="h-44 bg-section-alt rounded-lg mb-5 overflow-hidden flex items-center justify-center group-hover:bg-accent-subtle transition-colors">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-4xl">📚</span>
                  )}
                </div>
                <div className="px-2 pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
                      {course.category}
                    </span>
                    <span className="text-[9px] font-black uppercase text-muted border border-card-border px-2 py-0.5 rounded-md bg-card">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-4 leading-snug line-clamp-2 min-h-[2.8rem]">
                    {course.title}
                  </h3>
                  <div className="flex justify-between items-center pt-3 border-t border-card-border">
                    <span className="text-xl font-black text-foreground">${course.price}</span>
                    <div className="bg-card-hover p-2.5 rounded-lg group-hover:bg-navy group-hover:text-white transition-all">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </m.div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-card border border-card-border shadow-md w-11 h-11 rounded-xl flex items-center justify-center hover:bg-card-hover transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
