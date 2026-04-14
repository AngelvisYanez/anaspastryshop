"use client";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Lock, Chrome, Loader2, Clock, CheckCircle2, BookOpen, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkPreloginStatus } from "@/lib/actions/auth";

function LoginForm({ onPendingMentor, onSuspended }: { onPendingMentor: () => void, onSuspended: (reason: string) => void }) {
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

    const statusCheck = await checkPreloginStatus(formData);

    if (statusCheck.isSuspended) {
      setLoading(false);
      onSuspended(statusCheck.reason || "Sin razón especificada");
      return;
    }

    if (statusCheck.isPendingMentor) {
      setLoading(false);
      onPendingMentor();
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Credenciales inválidas. Por favor intenta de nuevo.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <>
      {registered && (
        <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-bold text-center mb-6">
          ¡Cuenta creada exitosamente! Por favor inicia sesión.
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold text-center mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
            Email o nombre de usuario
          </label>
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              name="email"
              required
              placeholder="tu@email.com o ACUADMIN"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5A4FCF] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-indigo-100 mt-4 flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Entrar a mi cuenta"}
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
      <main className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-orange-100/40 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl shadow-red-100/30 text-center border border-white z-10 relative">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-red-100 rounded-3xl animate-pulse" />
            <div className="relative w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
              <Lock className="text-red-500" size={36} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-[#1A1A2E] mb-4 leading-tight">
            Cuenta Desactivada
          </h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            Tu cuenta ha sido desactivada temporalmente por la siguiente razón:
          </p>

          <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl mb-8">
            {suspendedReason}
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Si crees que es un error, contacta a soporte:{" "}
            <a
              href="mailto:soporte@artica.group"
              className="text-red-500 font-bold hover:underline"
            >
              soporte@artica.group
            </a>
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (isPendingMentor) {
    return (
      <main className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-purple-100/40 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100/30 text-center border border-white z-10 relative">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-orange-100 rounded-3xl animate-pulse" />
            <div className="relative w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center">
              <Clock className="text-orange-500" size={36} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-[#1A1A2E] mb-4 leading-tight">
            Tu cuenta está en revisión
          </h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            Gracias por registrarte como mentor en{" "}
            <span className="font-bold text-[#5A4FCF]">Articademy</span>.
            Un administrador revisará tu solicitud y te dará acceso en las próximas{" "}
            <span className="font-bold text-[#1A1A2E]">24 horas</span>.
          </p>

          <div className="space-y-3 mb-10 text-left">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl">
              <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-[#1A1A2E]">Registro completado</p>
                <p className="text-xs text-gray-400">Tu cuenta fue creada exitosamente.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border-2 border-orange-100">
              <Clock className="text-orange-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-[#1A1A2E]">Revisión del administrador</p>
                <p className="text-xs text-gray-400">En proceso — suele tardar hasta 24 horas.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <BookOpen className="text-gray-300 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-gray-400">Acceso al panel de mentor</p>
                <p className="text-xs text-gray-300">Disponible una vez aprobado.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            ¿Tienes dudas? Escríbenos a{" "}
            <a
              href="mailto:hola@artica.group"
              className="text-[#5A4FCF] font-bold hover:underline"
            >
              hola@artica.group
            </a>
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#5A4FCF] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100/50 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-100/50 z-10 border border-white"
      >
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#5A4FCF] transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <h1 className="text-3xl font-black text-[#1A1A2E] mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-gray-400 font-medium">
            Ingresa a tu panel de alumno en AMA
          </p>
        </div>

        <Suspense fallback={<div className="text-center"><Loader2 className="animate-spin mx-auto text-[#5A4FCF]" /></div>}>
          <LoginForm onPendingMentor={() => setIsPendingMentor(true)} onSuspended={(r) => setSuspendedReason(r)} />
        </Suspense>

        <div className="relative my-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-bold text-gray-300 uppercase tracking-widest">
            O continúa con
          </span>
        </div>

        <button className="w-full bg-white border border-gray-100 text-[#1A1A2E] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
          <Chrome size={20} /> Google
        </button>

        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/signup"
            className="text-[#5A4FCF] font-bold hover:underline"
          >
            Regístrate gratis
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
