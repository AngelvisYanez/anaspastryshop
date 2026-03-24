"use client";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
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
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none"
            />
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
  return (
    <main className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100/50 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-100/50 z-10 border border-white"
      >
        {/* Header del Formulario */}
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
          <LoginForm />
        </Suspense>

        {/* Separador */}
        <div className="relative my-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-bold text-gray-300 uppercase tracking-widest">
            O continúa con
          </span>
        </div>

        {/* Social Login */}
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
