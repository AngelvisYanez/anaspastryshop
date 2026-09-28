"use client";
import { m } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    text: "El workshop con Anais cambió por completo mi forma de hornear. Al fin entendí el porqué de cada técnica y paso; mis bizcochos ahora quedan perfectos, nivelados y súper húmedos.",
    name: "Valentina Mendoza",
    location: "Emprendedora Repostera",
    initials: "VM",
    workshop: "Workshop Decoración y Bordes Perfectos",
  },
  {
    id: 2,
    text: "Llegué con cero experiencia previa y bastante nervios. Anais tiene una paciencia increíble y una metodología tan clara que logré hacer un pastel de varios pisos hermoso. ¡100% recomendado!",
    name: "Camila Rodríguez",
    location: "Alumna Principiante",
    initials: "CR",
    workshop: "Workshop de Pastelería Desde Cero",
  },
  {
    id: 3,
    text: "Las 8 horas del workshop se pasan volando. La calidad de los insumos, la explicación detallada de cada paso y el acompañamiento durante todo el taller hacen que valga cada centavo invertido.",
    name: "Gabriela Salazar",
    location: "Pastelera Profesional",
    initials: "GS",
    workshop: "Masterclass Cremas y Rellenos",
  },
  {
    id: 4,
    text: "Invertir en conocimientos produce siempre los mejores beneficios, tal como dice Anais. Gracias al workshop pude lanzar mi propio menú de pasteles para eventos con total confianza.",
    name: "Mariana Silva",
    location: "Fundadora de Dulce Arte",
    initials: "MS",
    workshop: "Workshop Presencial Intensivo",
  },
  {
    id: 5,
    text: "La técnica de alisado y uso de la base giratoria que enseña Anais es de otro nivel. Mis clientes quedaron fascinados con los acabados prolijos que ahora logro entregar.",
    name: "Andrea Castillo",
    location: "Pastelera Creativa",
    initials: "AC",
    workshop: "Workshop de Alisados y Bordes",
  },
  {
    id: 6,
    text: "El ambiente del taller es súper acogedor, te explican absolutamente todo sin guardarse nada. Salí motivada y con mi propio pastel listo para disfrutar en familia.",
    name: "Sofía Paredes",
    location: "Apasionada por la Repostería",
    initials: "SP",
    workshop: "Workshop Pastelero Fin de Semana",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-background py-24 border-t border-card-border">
      <div className="page-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Experiencias reales de{" "}
            <span className="text-accent">nuestras alumnas y alumnos</span>
          </h2>
          <p className="text-muted text-base">
            Historias de personas que decidieron invertir en su capacitación y hoy crean con soltura, técnica y seguridad.
          </p>
        </m.div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {TESTIMONIALS.map((t, i) => (
            <m.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="w-[85vw] max-w-sm shrink-0 md:w-auto bg-card rounded-2xl p-7 border border-card-border flex flex-col justify-between shadow-sm hover:border-accent/40 transition-colors"
            >
              <div>
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/15 text-accent font-black text-sm flex items-center justify-center">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted font-medium">{t.location}</p>
                  </div>
                </div>
                <span className="text-[11px] text-accent/80 font-bold bg-accent/10 px-2.5 py-1 rounded-full text-right hidden sm:inline-block">
                  {t.workshop.split(" ")[1]}
                </span>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
