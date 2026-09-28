"use client";
import { useState, Suspense } from "react";
import { m } from "framer-motion";
import {
  ArrowLeft, User, Lock, Loader2,
  Eye, EyeOff, Shield, TrendingUp, Users, PlayCircle, LogIn,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkPreloginStatus } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

const benefits = [
  {
    icon: PlayCircle,
    title: "Cursos Completos",
    description: "Desde los fundamentos de repostería hasta técnicas avanzadas de alta pastelería.",
  },
  {
    icon: Users,
    title: "Talleres Presenciales",
    description: "Clases prácticas con la Chef Anaís para perfeccionar técnicas frente a frente con tus pares.",
  },
  {
    icon: TrendingUp,
    title: "Método Práctico",
    description: "Aprende con recetas paso a paso y elabora creaciones profesionales desde el primer día.",
  },
  {
    icon: Shield,
    title: "Acceso Permanente",
    description: "Tus formaciones adquiridas están siempre disponibles para que repases a tu propio ritmo.",
  },
];

function LoginForm({ onSuspended }: { onSuspended: (reason: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // react-doctor-disable-next-line react-doctor/url-prefilled-privileged-action -- `callbackUrl` is validated below: relative paths only, no protocol-relative or absolute URLs
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
    ? rawCallback
    : "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", identifier);
    formData.append("password", password);

    try {
      const statusCheck = await checkPreloginStatus(formData);

      if (statusCheck.isSuspended) {
        onSuspended(statusCheck.reason || "Tu cuenta ha sido desactivada por el administrador.");
        return;
      }

      const res = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3.5 rounded-2xl text-xs font-bold text-center border border-red-100 dark:border-red-800 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-identifier" className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1">
            Email o Nombre
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              id="login-identifier"
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="tu@email.com o tu nombre"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-widest text-muted ml-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-0 top-1/2 -translate-y-1/2 min-h-11 min-w-11 grid place-items-center text-muted hover:text-accent transition-colors"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/olvide-mi-contrasena" className="text-xs font-bold text-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full bg-foreground text-background py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity mt-2 flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Entrar a mi cuenta
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  const [suspendedReason, setSuspendedReason] = useState<string | null>(null);

  if (suspendedReason) {
    return (
      <>
        <Navbar />
        <main id="main-content">
          <PageHero
            title={<>Tu cuenta ha sido suspendida</>}
            subtitle="Tu acceso a la plataforma ha sido revocado."
          />
          <section className="bg-background py-16 px-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-200/20 blur-[130px] rounded-full pointer-events-none" />
            <div className="w-full max-w-lg mx-auto relative z-10 bg-card rounded-2xl p-12 shadow-card text-center border border-card-border">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 bg-red-100 rounded-xl" />
                <div className="relative w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center">
                  <Lock className="text-red-500" size={36} />
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm font-medium mb-8">
                <p className="font-bold text-xs uppercase tracking-wider mb-1">Motivo:</p>
                <p className="italic">&ldquo;{suspendedReason}&rdquo;</p>
              </div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-accent transition-colors">
                Volver al inicio
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content">
        <PageHero
          badge={
            <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit mx-auto text-xs font-semibold text-white/90">
              <LogIn size={16} className="text-pink-200" />
              <span>Área de clientes</span>
            </div>
          }
          title={<>Bienvenido de nuevo</>}
          subtitle="Accede a tu cuenta en Ana's Pastry Shop"
        />
        <section className="bg-background py-16 px-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/[0.06] blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-foreground/[0.04] blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-md mx-auto relative z-10">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-8 md:p-12 shadow-card border border-card-border"
            >
              <div className="text-center mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <ArrowLeft size={14} /> Volver al inicio
                </Link>
              </div>

              <Suspense fallback={<div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-accent" size={24} /></div>}>
                <LoginForm onSuspended={(r) => setSuspendedReason(r)} />
              </Suspense>

              <p className="text-center mt-8 text-sm text-muted">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-accent font-bold hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </m.div>
          </div>
        </section>

        <section className="bg-foreground py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-tight">
                Todo lo que necesitas para<br className="hidden sm:block" /> dominar el arte de la repostería
              </h2>
            </m.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <m.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex gap-5 p-6 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-white mb-1.5">{benefit.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{benefit.description}</p>
                    </div>
                  </m.div>
                );
              })}
            </div>

            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <div className="flex items-center gap-8 text-center">
                <div>
                  <p className="font-display text-3xl font-black text-pink-300">10+</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mt-1">Años de experiencia</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="font-display text-3xl font-black text-pink-300">100%</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mt-1">Práctico y guiado</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="font-display text-3xl font-black text-pink-300">∞</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mt-1">Acceso permanente</p>
                </div>
              </div>
            </m.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
