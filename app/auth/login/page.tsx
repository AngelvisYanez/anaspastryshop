"use client";
import { useState, Suspense } from "react";
import { m } from "framer-motion";
import {
  ArrowLeft, User, Lock, Chrome, Loader2, Clock, CheckCircle2,
  BookOpen, Eye, EyeOff, Shield, TrendingUp, Users, PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkPreloginStatus } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const benefits = [
  {
    icon: PlayCircle,
    title: "8 Módulos Completos",
    description: "Desde los básicos del crédito americano hasta estrategias avanzadas de crédito empresarial.",
  },
  {
    icon: Users,
    title: "Sesiones en Vivo",
    description: "Sesiones dinámicas con Rami Noureddine. Haz tus preguntas y recibe orientación directa.",
  },
  {
    icon: TrendingUp,
    title: "Estrategias Reales",
    description: "Aprende a subir tu puntaje, negociar con bancos y calificar para las mejores condiciones.",
  },
  {
    icon: Shield,
    title: "Actualizaciones Incluidas",
    description: "El sistema crediticio cambia. Tu acceso incluye actualizaciones en tiempo real, siempre al día.",
  },
];

function LoginForm({ onPendingMentor, onSuspended }: { onPendingMentor: () => void; onSuspended: (reason: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", { email, password, redirect: false });

    if (!res?.error) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    const statusCheck = await checkPreloginStatus(formData);
    setLoading(false);

    if (statusCheck.isSuspended) {
      onSuspended(statusCheck.reason || "Sin razón especificada");
    } else if (statusCheck.isPendingMentor) {
      onPendingMentor();
    } else {
      setError("Credenciales inválidas. Por favor intenta de nuevo.");
    }
  }

  return (
    <>
      {registered && (
        <div className="bg-green-50 dark:bg-green-950/30 text-green-600 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-green-100 dark:border-green-800">
          ¡Cuenta creada exitosamente! Por favor inicia sesión.
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
            Email o nombre de usuario
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              id="login-email"
              type="text"
              name="email"
              required
              placeholder="tu@email.com"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 block">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
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

        <button
          disabled={loading}
          className="w-full bg-foreground text-background py-4 rounded-2xl font-bold hover:opacity-90 transition-all mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Entrar a mi cuenta"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  const [isPendingMentor, setIsPendingMentor] = useState(false);
  const [suspendedReason, setSuspendedReason] = useState<string | null>(null);

  if (suspendedReason) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center p-6 pt-32 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-200/20 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-red-100/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="w-full max-w-lg bg-card rounded-2xl p-12 shadow-[var(--shadow-card)] text-center border border-card-border z-10 relative">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-950/30 rounded-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center">
                <Lock className="text-red-500" size={36} />
              </div>
            </div>
            <h1 className="font-display text-3xl font-black text-foreground mb-4 leading-tight tracking-tight">
              Cuenta Desactivada
            </h1>
            <p className="text-muted leading-relaxed mb-6 text-sm">
              Tu cuenta ha sido desactivada temporalmente por la siguiente razón:
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 font-bold p-4 rounded-2xl mb-8 border border-red-100 dark:border-red-800 text-sm">
              {suspendedReason}
            </div>
            <p className="text-xs text-muted mb-6">
              Si crees que es un error, contacta a soporte:{" "}
              <a href="mailto:soporte@academiacreditousa.com" className="text-accent font-bold hover:underline">
                soporte@academiacreditousa.com
              </a>
            </p>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-accent transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isPendingMentor) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center p-6 pt-32 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-foreground/[0.04] blur-[100px] rounded-full pointer-events-none" />
          <div className="w-full max-w-lg bg-card rounded-2xl p-12 shadow-[var(--shadow-card)] text-center border border-card-border z-10 relative">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 bg-accent-subtle rounded-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-accent-subtle rounded-xl flex items-center justify-center">
                <Clock className="text-accent" size={36} />
              </div>
            </div>
            <h1 className="font-display text-3xl font-black text-foreground mb-4 leading-tight tracking-tight">
              Tu cuenta está en revisión
            </h1>
            <p className="text-muted leading-relaxed mb-8 text-sm">
              Gracias por registrarte como mentor en{" "}
              <span className="font-bold text-accent">Academia Credito USA</span>.
              Un administrador revisará tu solicitud en las próximas{" "}
              <span className="font-bold text-foreground">24 horas</span>.
            </p>
            <div className="space-y-3 mb-10 text-left">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900">
                <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-foreground">Registro completado</p>
                  <p className="text-xs text-muted">Tu cuenta fue creada exitosamente.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-accent-subtle rounded-2xl border border-accent/20">
                <Clock className="text-accent shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-foreground">Revisión del administrador</p>
                  <p className="text-xs text-muted">En proceso — hasta 24 horas.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-section-alt rounded-2xl border border-card-border">
                <BookOpen className="text-muted/40 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-muted">Acceso al panel de mentor</p>
                  <p className="text-xs text-muted/60">Disponible una vez aprobado.</p>
                </div>
              </div>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-accent transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content">
        <section className="bg-background pt-32 pb-16 px-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/[0.06] blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-foreground/[0.04] blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-md mx-auto relative z-10">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-xl p-10 shadow-[var(--shadow-card)] border border-card-border"
            >
              <div className="text-center mb-10">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
                >
                  <ArrowLeft size={14} /> Volver al inicio
                </Link>
                <h1 className="font-display text-3xl font-black text-foreground mb-2 tracking-tight">
                  Bienvenido de nuevo
                </h1>
                <p className="text-muted text-sm">
                  Accede a tu cuenta en Academia Credito USA
                </p>
              </div>

              <Suspense fallback={<div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-accent" size={24} /></div>}>
                <LoginForm onPendingMentor={() => setIsPendingMentor(true)} onSuspended={(r) => setSuspendedReason(r)} />
              </Suspense>

              <div className="relative my-8 text-center">
                <hr className="border-card-border" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                  O continúa con
                </span>
              </div>

              <button className="w-full bg-background border border-card-border text-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:border-accent transition-all text-sm">
                <Chrome size={18} /> Google
              </button>

              <p className="text-center mt-8 text-sm text-muted">
                ¿No tienes cuenta?{" "}
                <Link href="/auth/signup" className="text-accent font-bold hover:underline">
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
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">
                Por qué elegir la academia
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-tight">
                Todo lo que necesitas para<br className="hidden sm:block" /> dominar el crédito en USA
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
                  <p className="font-display text-3xl font-black text-accent">7+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Años de experiencia</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="font-display text-3xl font-black text-accent">8</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Módulos completos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="font-display text-3xl font-black text-accent">∞</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Actualizaciones</p>
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
