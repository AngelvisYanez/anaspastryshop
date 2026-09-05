import { Suspense } from "react";
import { auth } from "@/lib/auth";
import CheckoutMembresia from "./CheckoutMembresia";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagar Membresía",
  description: "Completa tu pago y accede a todos los cursos, sesiones en vivo y recursos de Academia Omnia.",
  robots: { index: false, follow: false },
};

async function CheckoutContent() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <CheckoutMembresia
      initialLoggedIn={isLoggedIn}
      initialName={session?.user?.name}
    />
  );
}

export default function PagarMembresiaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutContent />
    </Suspense>
  );
}
