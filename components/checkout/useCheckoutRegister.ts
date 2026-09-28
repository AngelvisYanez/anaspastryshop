"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/auth";
import type { CheckoutStep } from "@/components/checkout/CheckoutStepIndicator";

async function signInWithPassword(email: string, password: string) {
  return signIn("credentials", {
    email: email.trim().toLowerCase(),
    password,
    redirect: false,
  });
}

export function useCheckoutRegister(setStep: (step: CheckoutStep) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    // Mantener el email normalizado para el server action y el sign-in.
    formData.set("email", email);

    try {
      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      const res = await registerUser(formData);

      if (res.error === "El correo ya está registrado") {
        // Cuenta previa: intentar entrar con la misma contraseña y seguir al pago.
        const existing = await signInWithPassword(email, password);
        if (existing?.error || existing?.ok === false) {
          setError(
            "Este correo ya tiene cuenta. Revisa la contraseña o inicia sesión para continuar."
          );
          return;
        }
        setStep(2);
        return;
      }

      if (res.error) {
        setError(res.error);
        return;
      }

      const signInResult = await signInWithPassword(email, password);

      if (signInResult?.error || signInResult?.ok === false) {
        setError(
          "Cuenta creada, pero no pudimos iniciar sesión automáticamente. Usa «Inicia sesión aquí» y vuelve al pago."
        );
        return;
      }

      setStep(2);
    } catch (err) {
      console.error("[checkout] register/sign-in failed:", err);
      setError(
        "No pudimos completar el registro ahora. Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, setLoading, error, setError, handleRegister };
}
