import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstagramFeed from "@/components/InstagramFeed";
import JsonLd from "@/components/JsonLd";
import { Suspense } from "react";
import Link from "next/link";
import { Cake, Candy, Gift, Building2 } from "lucide-react";
import { buildBreadcrumbJsonLd, buildPageMetadata, GEO } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Pastelería y Tortas de Diseño en Coro, Falcón",
  description:
    `Tortas de diseño, mesas dulces y pastelería artesanal en ${GEO.shortAddress}, Venezuela. Pedidos especiales con Anais Flores para bodas, eventos y ocasiones únicas.`,
  path: "/pasteleria",
  keywords: [
    "pastelería Coro Falcón",
    "tortas de diseño Venezuela",
    "mesas dulces Coro",
    "pastelería artesanal Falcón",
    "tortas bodas Venezuela",
    "Ana's Pastry Shop pastelería",
  ],
});

const SERVICES = [
  {
    title: "Tortas & Pasteles de Diseño",
    description: "Creaciones exclusivas para bodas, XV años, aniversarios y momentos inolvidables. Diseño personalizado, técnicas vanguardistas y acabados de alta pastelería.",
    icon: Cake,
    tags: ["Bodas & Eventos", "Diseño personalizado", "Pisos estructurados"],
  },
  {
    title: "Mesas Dulces & Candy Bar",
    description: "Montaje completo y variado con mini postres de autor, tartaletas finas, macarons franceses, vasitos gourmet y bocados que deleitan a tus invitados.",
    icon: Candy,
    tags: ["Mini Shots", "Macarons", "Tartaletas Gourmet"],
  },
  {
    title: "Pastelería para Ocasiones Especiales",
    description: "Celebraciones familiares, fechas conmemorativas, regalos gourmet y pedidos exclusivos elaborados desde cero con ingredientes premium seleccionados.",
    icon: Gift,
    tags: ["Cumpleaños", "Detalles gourmet", "Recetas de autor"],
  },
  {
    title: "Catering Corporativo Dulce",
    description: "Break dulce y pastelería fina para lanzamientos de marca, conferencias, eventos corporativos y reuniones ejecutivas con presentación impecable.",
    icon: Building2,
    tags: ["Coffee Breaks", "Eventos empresariales", "Presentación de lujo"],
  },
];

export default function PasteleriaPage() {
  return (
    <main className="min-h-screen bg-background">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Pastelería", path: "/pasteleria" },
        ])}
      />
      <Navbar />

      <section className="relative min-h-[52svh] sm:min-h-[48svh] flex items-end overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/foto-5.webp"
          alt={`Pastelería artesanal y tortas de diseño — Ana's Pastry Shop en ${GEO.shortAddress}, Venezuela`}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-purple via-brand-purple/75 to-brand-purple/35" />
        <div className="page-container relative z-10 pt-28 pb-12 xl:pt-36 xl:pb-14">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-3xl mb-4">
            Pastelería profesional en{" "}
            <span className="text-on-purple-accent">{GEO.shortAddress}, Venezuela</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/90 max-w-prose leading-relaxed font-medium">
            Tortas de diseño, mesas dulces y repostería exclusiva elaborada por Anais Flores en Coro, Falcón.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 page-container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Diseñamos experiencias dulces a tu medida
          </h2>
          <p className="text-muted font-medium mt-3 text-sm">
            Cada creación combina técnica profesional de horneado con acabados estéticos de nivel internacional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((serv) => (
            <div
              key={serv.title}
              className="bg-card border border-card-border rounded-3xl p-6 hover:shadow-xl hover:border-accent/40 transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/40 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  <serv.icon size={24} className="text-accent" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-black text-foreground tracking-tight mb-2 group-hover:text-accent transition-colors">
                  {serv.title}
                </h3>
                <p className="text-xs text-muted font-medium leading-relaxed mb-5">
                  {serv.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-card-border">
                {serv.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-wider bg-section-alt text-muted px-2.5 py-1 rounded-full border border-card-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Gallery */}
      <Suspense fallback={null}>
        <InstagramFeed />
      </Suspense>

      {/* Process Section */}
      <section className="py-20 px-6 bg-section-alt border-y border-card-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              Sencillo, coordinado y seguro
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="bg-card p-6 rounded-2xl border border-card-border">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/40 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-foreground mb-1">Cotiza tu pedido</h3>
              <p className="text-xs text-muted font-medium leading-relaxed">
                Contáctanos vía WhatsApp, compártenos tu idea, fecha y porciones requeridas para acordar el diseño y presupuesto.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-card-border">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/40 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-foreground mb-1">Reserva y anticipo</h3>
              <p className="text-xs text-muted font-medium leading-relaxed">
                Aparta la fecha en nuestra agenda con el anticipo acordado y reporta tu comprobante mediante nuestra plataforma.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-card-border">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/40 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-foreground mb-1">Elaboración y entrega</h3>
              <p className="text-xs text-muted font-medium leading-relaxed">
                Elaboramos tu pedido con insumos de primera calidad y te entregamos una obra de arte deliciosa e impecable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment info section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-card border border-card-border rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">
            Opciones de pago cómodas y transparentes
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto mb-8 font-medium">
            Aceptamos transferencias y pagos en Bolívares (Pago Móvil a tasa oficial BCV del día), Efectivo físico, Zelle y Binance Pay.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/pagar/pasteleria"
              className="bg-accent-solid text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-accent-solid-hover transition shadow-md shadow-accent-solid/20"
            >
              Reportar Pago Realizado
            </Link>
            <a
              href="https://wa.me/?text=Hola%20Anais!%20Tengo%20una%20duda%20sobre%20los%20m%C3%A9todos%20de%20pago%20de%20pasteler%C3%ADa"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-section-alt hover:bg-card-hover border border-card-border text-foreground px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition"
            >
              Consultar con Anais
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
