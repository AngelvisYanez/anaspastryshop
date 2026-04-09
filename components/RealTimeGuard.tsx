"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RealTimeGuard() {
  const { data: session } = useSession();
  const router = useRouter();
  const previousIsActive = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (session?.user) {
      const currentIsActive = (session.user as any).isActive;
      
      // Si el estado de suspensión cambia en cualquier dirección (de true a false, o de false a true)
      // Forzamos una recarga sin fisuras usando el router nativo de Next.
      if (previousIsActive.current !== undefined && previousIsActive.current !== currentIsActive) {
        router.refresh();
      }
      
      previousIsActive.current = currentIsActive;
    }
  }, [session, router]);

  return null;
}
