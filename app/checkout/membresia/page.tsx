import { Suspense } from "react";
import { auth } from "@/lib/auth";
import CheckoutMembresia from "./CheckoutMembresia";

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

export default function CheckoutMembresiaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutContent />
    </Suspense>
  );
}
