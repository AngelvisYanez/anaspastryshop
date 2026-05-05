import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import CheckoutMembresia from "./CheckoutMembresia";

export default async function CheckoutMembresiaPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <Navbar />
      <CheckoutMembresia
        initialLoggedIn={isLoggedIn}
        initialName={session?.user?.name}
      />
    </>
  );
}
