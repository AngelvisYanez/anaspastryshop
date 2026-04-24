import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isSub = type === "subscription";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-card-border rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-3">
          {isSub ? "¡Bienvenido a Academia Credito USA!" : "¡Compra exitosa!"}
        </h1>
        <p className="text-muted font-medium mb-8">
          {isSub
            ? "Tu membresía está activa. Ahora tienes acceso a todo el contenido."
            : "Tu curso está disponible en tu panel de aprendizaje."}
        </p>
        <Link
          href="/dashboard"
          className="bg-navy text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all inline-block"
        >
          Ir al Panel →
        </Link>
      </div>
    </main>
  );
}
