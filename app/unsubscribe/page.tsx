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
      <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] px-4">
        <div className="max-w-md w-full text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#0B1F3A] mb-2">Enlace inválido</h1>
          <p className="text-gray-500 font-medium mb-6">
            El enlace de cancelación no es válido o ha expirado.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#0B1F3A] text-white font-bold px-6 py-3 rounded-full text-sm"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const result = await unsubscribeByToken(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] px-4">
      <div className="max-w-md w-full text-center">
        {result.success ? (
          <>
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-[#0B1F3A] mb-2">Suscripción cancelada</h1>
            <p className="text-gray-500 font-medium mb-6">
              Has sido eliminado de nuestra lista de newsletter. No recibirás más emails promocionales.
            </p>
          </>
        ) : (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-[#0B1F3A] mb-2">No se pudo procesar</h1>
            <p className="text-gray-500 font-medium mb-6">{result.error}</p>
          </>
        )}
        <Link
          href="/"
          className="inline-block bg-[#0B1F3A] text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-[#1A3A5C] transition-colors"
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
        <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE]">
          <div className="text-gray-500 font-medium">Procesando...</div>
        </div>
      }
    >
      <UnsubscribeContent searchParams={searchParams} />
    </Suspense>
  );
}
