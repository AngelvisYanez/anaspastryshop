import { unsubscribeByToken } from "@/lib/actions/newsletter";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Suspense } from "react";

async function UnsubscribeContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-card-border p-8 rounded-3xl text-center shadow-xl">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-black text-foreground mb-2">Enlace inválido</h1>
          <p className="text-muted font-medium mb-6 text-sm">
            El enlace de cancelación no es válido o ha expirado.
          </p>
          <Link
            href="/"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-md shadow-pink-600/20"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const result = await unsubscribeByToken(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-card-border p-8 rounded-3xl text-center shadow-xl">
        {result.success ? (
          <>
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-black text-foreground mb-2">Suscripción cancelada</h1>
            <p className="text-muted font-medium mb-6 text-sm">
              Has sido eliminado de nuestra lista de correo. Ya no recibirás promociones ni boletines de Ana&apos;s Pastry Shop.
            </p>
          </>
        ) : (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-black text-foreground mb-2">No se pudo procesar</h1>
            <p className="text-muted font-medium mb-6 text-sm">{result.error}</p>
          </>
        )}
        <Link
          href="/"
          className="inline-block bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-md shadow-pink-600/20"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted font-medium">Procesando...</div>
        </div>
      }
    >
      <UnsubscribeContent searchParams={searchParams} />
    </Suspense>
  );
}
