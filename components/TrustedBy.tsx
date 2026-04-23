"use client";
import { m } from "framer-motion";

const PARTNERS = [
  { name: "Artica Group", location: "Miami, USA" },
  { name: "4101 Media", location: "Latinoamérica" },
  { name: "Next.js", location: "Tech Partner" },
  { name: "Prisma", location: "Database" },
  { name: "Stripe", location: "Payments" },
];

export default function TrustedBy() {
  return (
    <section className="py-12 border-y border-card-border bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">
          Respaldado por el ecosistema de
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
          {PARTNERS.map((partner) => (
            <m.div 
              key={partner.name}
              whileHover={{ opacity: 1, scale: 1.05 }}
              className="flex flex-col items-center group cursor-default"
            >
              <span className="text-lg md:text-xl font-black text-foreground grayscale group-hover:grayscale-0 transition-all">
                {partner.name}
              </span>
              <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">
                {partner.location}
              </span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
