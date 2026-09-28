"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/auth";
import type { CheckoutStep } from "@/components/checkout/CheckoutStepIndicator";

export function useCheckoutRegister(setStep: (step: CheckoutStep) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await registerUser(formData);
      if (res.error) {
        setError(res.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Cuenta creada, pero hubo un error al iniciar sesión. Recarga la página.");
        return;
      }

      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  return { loading, setLoading, error, setError, handleRegister };
}
