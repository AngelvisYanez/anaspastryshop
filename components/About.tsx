"use client";
import { m } from "framer-motion";
import Image from "next/image";

const STATS = [
  { num: "7+", label: "Años de experiencia" },
  { num: "360°", label: "Visión integral" },
  { num: "∞", label: "Actualizaciones" },
];

export default function About() {
  return (
    <section className="w-full bg-section-alt py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-16 block">
            Acerca de la academia
          </span>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-card rounded-xl border border-card-border overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                alt="Estudiantes aprendiendo en línea"
                fill
                className="object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-card rounded-xl border border-card-border"
                >
                  <span className="font-display block text-2xl font-black text-accent tracking-tight mb-1">
                    {stat.num}
                  </span>
                  <span className="text-[10px] font-bold text-muted leading-tight block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">
              Academia Omnia
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-10">
              Educación online · Cursos prácticos y actualizados
            </p>

            <p className="text-sm text-muted leading-relaxed mb-6">
              Academia Omnia nace con un objetivo claro: que cualquier persona
              pueda dominar las herramientas digitales de manera integral, con
              una visión 360° que conecta lo técnico con lo práctico. Nuestro
              nombre viene del latín <span className="font-bold text-foreground">omnia</span> — "todo" — porque creemos
              que el conocimiento no debería llegar fragmentado.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-10">
              Diseñamos cada curso con métodos comprobados, acompañamiento
              real y contenidos que se actualizan al ritmo del mundo actual.
              Ya sea que empieces desde cero o quieras llevar tu nivel al
              siguiente paso, aquí encuentras el camino para lograrlo.
            </p>

            <div className="relative bg-card rounded-xl px-8 py-7 border border-card-border overflow-hidden">
              <span className="font-display absolute top-2 left-5 text-[7rem] leading-none text-accent/10 font-black select-none pointer-events-none">
                &ldquo;
              </span>
              <p className="relative z-10 text-base text-foreground leading-relaxed font-medium">
                El objetivo no es darte una lista de pasos a seguir ciegamente.
                Es que desarrolles tu propio criterio para tomar decisiones
                con confianza y aplicar lo aprendido en tu día a día.
              </p>
              <div className="mt-5 pt-5 border-t border-card-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs font-bold">AO</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Academia Omnia</p>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Nuestra misión</p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
