import Link from "next/link";
import { CheckCircle, ArrowRight, BookOpen } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isSub = type === "subscription";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-card-border rounded-[3rem] p-12 max-w-lg w-full text-center shadow-[var(--shadow-card)]">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="text-green-500" size={40} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">
          {isSub ? "Pago procesado" : "Compra exitosa"}
        </p>

        <h1 className="font-display text-3xl font-black text-foreground mb-4 tracking-tight leading-tight">
          {isSub ? "¡Bienvenido a Academia Credito USA!" : "¡Acceso activado!"}
        </h1>

        <p className="text-muted text-sm mb-10 leading-relaxed max-w-sm mx-auto">
          {isSub
            ? "Tu membresía está activa. Ahora tienes acceso completo a todos los cursos, sesiones en vivo y material exclusivo."
            : "Tu curso está disponible en tu panel de aprendizaje. ¡Empieza ahora!"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
          >
            Ir a mi Panel <ArrowRight size={16} />
          </Link>
          {isSub && (
            <Link
              href="/cursos"
              className="bg-card border border-card-border text-foreground px-8 py-4 rounded-full font-bold hover:bg-card-hover transition-all inline-flex items-center justify-center gap-2"
            >
              <BookOpen size={16} /> Explorar Cursos
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
