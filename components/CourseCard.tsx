"use client";
import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface CourseProps {
  title: string;
  category: string;
  price: number;
  icon: string;
  level?: string;
}

export default function CourseCard({ title, category, price, icon, level }: CourseProps) {
  return (
    <m.div 
      whileHover={{ y: -10 }}
      className="bg-card rounded-[2.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-card-border group"
    >
      <div className="h-52 bg-section-alt rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center text-5xl group-hover:bg-accent-subtle transition-colors">
        {icon}
      </div>
      <div className="px-4 pb-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
            {category}
          </span>
          {level && (
            <span className="text-[9px] font-black uppercase text-muted border border-card-border px-2 py-0.5 rounded-md bg-card">
              {level}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-6 leading-snug h-14 overflow-hidden">
          {title}
        </h3>
        <div className="flex justify-between items-center pt-4 border-t border-card-border">
          <div>
            <span className="text-2xl font-black text-foreground">${price}</span>
          </div>
          <button className="bg-card-hover p-3.5 rounded-2xl group-hover:bg-navy group-hover:text-white transition-all">
            <ArrowUpRight size={22} />
          </button>
        </div>
      </div>
    </m.div>
  );
}
