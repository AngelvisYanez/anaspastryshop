"use client";
import { motion } from 'framer-motion';
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
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white rounded-[2.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 group"
    >
      <div className="h-52 bg-[#F8F9FF] rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center text-5xl group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div className="px-4 pb-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5A4FCF]">
            {category}
          </span>
          {level && (
            <span className="text-[9px] font-black uppercase text-gray-400 border border-gray-100 px-2 py-0.5 rounded-md bg-gray-50/50">
              {level}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 leading-snug h-14 overflow-hidden">
          {title}
        </h3>
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <div>
            <span className="text-2xl font-black text-[#1A1A2E]">${price}</span>
          </div>
          <button className="bg-gray-100 p-3.5 rounded-2xl group-hover:bg-[#1A1A2E] group-hover:text-white transition-all">
            <ArrowUpRight size={22} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}