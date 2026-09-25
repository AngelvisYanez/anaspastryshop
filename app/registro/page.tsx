"use client";
import { useState } from "react";
import { m } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/cursos?bienvenida=true");
    }
  }

  return (
    <>
      <Navbar forceSolid />
      <main id="main-content" className="min-h-screen bg-background overflow-hidden">
        <PageHero
          backHref="/iniciar-sesion"
          backLabel="Volver al inicio"
          title={<>Crea tu cuenta</>}
          subtitle="Únete a la comunidad de Ana's Pastry Shop y accede a cursos, workshops y servicios de pastelería."
        />

        <div className="relative px-6 py-16">
          <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/[0.06] blur-[130px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-foreground/[0.04] blur-[100px] rounded-full" />

        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg mx-auto bg-card rounded-2xl p-10 md:p-14 shadow-[var(--shadow-card)] z-10 border border-card-border relative"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-3 bg-accent-subtle rounded-2xl text-accent">
              <User size={22} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {error && (
              <div className="md:col-span-2 bg-red-50 dark:bg-red-950/20 text-red-500 p-3 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Ej. Ana García"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1 block">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="md:col-span-2 w-full bg-accent text-white py-5 rounded-xl font-bold hover:bg-accent-hover transition-all mt-2 text-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-pink-600/25"
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
        </div>
      </main>
      <Footer />
    </>
  );
}
