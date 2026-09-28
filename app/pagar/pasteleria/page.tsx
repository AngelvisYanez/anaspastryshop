import { Suspense } from "react";
import { auth } from "@/lib/auth";
import CheckoutPasteleria from "./CheckoutPasteleria";

export const metadata = {
  title: "Pago de Servicio de Pastelería",
  description: "Reporta tu comprobante de pago para pedidos y servicios de pastelería personalizada.",
};

async function PasteleriaCheckoutContent() {
  const session = await auth();

  return (
    <CheckoutPasteleria
      initialLoggedIn={Boolean(session?.user)}
      initialName={session?.user?.name ?? undefined}
      initialEmail={session?.user?.email ?? undefined}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PasteleriaCheckoutContent />
    </Suspense>
  );
}
