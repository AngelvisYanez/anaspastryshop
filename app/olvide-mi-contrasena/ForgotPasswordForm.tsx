"use client";
import { useState } from "react";
import { m } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await requestPasswordReset(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content">
        <PageHero
          backHref="/iniciar-sesion"
          backLabel="Volver"
          title={<>¿Olvidaste tu contraseña?</>}
          subtitle="Ingresa tu correo y te enviaremos un enlace para restablecerla."
        />
        <section className="bg-background py-16 px-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/[0.06] blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-foreground/[0.04] blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-md mx-auto w-full relative z-10">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-xl p-10 shadow-card border border-card-border"
            >
              {sent ? (
                <div className="text-center">
                  <div className="inline-flex p-4 bg-green-50 rounded-2xl text-green-500 mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h1 className="font-display text-2xl font-black text-foreground mb-3 tracking-tight">
                    Revisa tu correo
                  </h1>
                  <p className="text-muted text-sm leading-relaxed mb-8">
                    Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                  </p>
                  <Link
                    href="/iniciar-sesion"
                    className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
                  >
                    <ArrowLeft size={14} /> Volver al inicio de sesión
                  </Link>
                </div>
              ) : (
                <>
                  {error && (
                    <div role="alert" className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-100 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fp-email" className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1 block">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                        <input
                          id="fp-email"
                          type="email"
                          name="email"
                          required
                          placeholder="tu@email.com"
                          className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      aria-busy={loading}
                      className="w-full bg-foreground text-background py-4 px-4 rounded-2xl font-bold hover:opacity-90 transition-opacity mt-4 flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                      {loading && <Loader2 size={18} className="animate-spin" />}
                      Enviar enlace de restablecimiento
                    </button>
                  </form>

                  <p className="text-center mt-8 text-sm text-muted">
                    ¿Recuerdas tu contraseña?{" "}
                    <Link href="/iniciar-sesion" className="text-accent font-bold hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </>
              )}
            </m.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
