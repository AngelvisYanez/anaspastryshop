"use client";
import { useState } from "react";
import { m } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/membresia?bienvenida=true");
    }
  }

  return (
    <>
      <Navbar forceSolid />
      <main id="main-content" className="min-h-screen bg-background flex items-center justify-center p-6 pt-32 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/[0.06] blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-foreground/[0.04] blur-[100px] rounded-full" />

        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg bg-card rounded-2xl p-10 md:p-14 shadow-[var(--shadow-card)] z-10 border border-card-border relative"
        >
          <div className="text-center mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-8 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={13} /> Volver al inicio
            </Link>

            <div className="inline-flex p-3 bg-accent-subtle rounded-2xl text-accent mb-4">
              <User size={22} />
            </div>

            <h1 className="font-display text-4xl font-black text-foreground mb-3 tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="text-muted text-sm">
              Únete a la comunidad de Academia Omnia.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {error && (
              <div className="md:col-span-2 bg-red-50 dark:bg-red-950/20 text-red-500 p-3 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej. Ana García"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="md:col-span-2 w-full bg-foreground text-background py-5 rounded-lg font-bold hover:opacity-90 transition-all mt-2 text-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Empezar ahora"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-card-border text-center">
            <p className="text-sm text-muted">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/iniciar-sesion" className="text-accent font-bold hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </m.div>
      </main>
      <Footer />
    </>
  );
}
