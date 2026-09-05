"use client";
import { useState, Suspense } from "react";
import { m } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="inline-flex p-4 bg-red-50 rounded-2xl text-red-500 mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="font-display text-2xl font-black text-foreground mb-3 tracking-tight">
          Enlace inválido
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Este enlace de restablecimiento no es válido. Solicita uno nuevo.
        </p>
        <Link
          href="/olvide-mi-contrasena"
          className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex p-4 bg-green-50 rounded-2xl text-green-500 mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-display text-2xl font-black text-foreground mb-3 tracking-tight">
          ¡Contraseña actualizada!
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link
          href="/iniciar-sesion"
          className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token!);
    const result = await resetPassword(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <>
      <div className="text-center mb-10">
        <Link
          href="/iniciar-sesion"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
        <h1 className="font-display text-3xl font-black text-foreground mb-2 tracking-tight">
          Nueva contraseña
        </h1>
        <p className="text-muted text-sm">
          Elige una contraseña segura para tu cuenta.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="rp-password" className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              id="rp-password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="rp-confirm" className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              id="rp-confirm"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              required
              placeholder="Repite tu contraseña"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-foreground text-background py-4 rounded-2xl font-bold hover:opacity-90 transition-all mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Restablecer contraseña"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar forceSolid />
      <main id="main-content">
        <section className="bg-background min-h-screen pt-32 pb-16 px-6 relative overflow-hidden flex items-center">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/[0.06] blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-foreground/[0.04] blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-md mx-auto w-full relative z-10">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-xl p-10 shadow-[var(--shadow-card)] border border-card-border"
            >
              <Suspense fallback={<div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-accent" size={24} /></div>}>
                <ResetPasswordForm />
              </Suspense>
            </m.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
