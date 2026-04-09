"use client";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // refetchInterval={5} consultará la sesión cada 5 segundos 
  // permitiendo que los baneos se reflejen en tiempo casi real.
  return <SessionProvider refetchInterval={5}>{children}</SessionProvider>;
}
