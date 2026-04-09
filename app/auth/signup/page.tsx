"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Sparkles, Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";

export default function SignUpPage() {
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
      router.push("/auth/login?registered=true");
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-200/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-100/50 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-indigo-100/30 z-10 border border-white relative"
      >
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#5A4FCF] transition-colors mb-8 text-xs font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Volver a Articademy
          </Link>
          <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-[#5A4FCF] mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="text-4xl font-black text-[#1A1A2E] mb-3">
            Crea tu cuenta
          </h1>
          <p className="text-gray-400 font-medium">
            Únete a la nueva generación de creadores en Falcón y el mundo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {error && (
            <div className="md:col-span-2 bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}
          {/* Nombre Completo */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
              Nombre Completo
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                type="text"
                name="name"
                required
                placeholder="Ej. Newman Acosta"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                type="email"
                name="email"
                required
                placeholder="tu@email.com"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="md:col-span-2 w-full bg-[#1A1A2E] text-white py-5 rounded-[1.5rem] font-bold hover:bg-black transition-all shadow-xl shadow-indigo-100 mt-4 text-sm uppercase tracking-widest flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Empezar ahora"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-sm text-gray-400 font-medium">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-[#5A4FCF] font-black hover:underline"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
