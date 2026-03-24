"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Camera, Loader2, Save, CheckCircle } from "lucide-react";
import { updateProfile } from "@/lib/actions/user";

interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function ProfileForm({ initialUser }: { initialUser: UserProfile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Ocultar mensaje de éxito tras unos segundos
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Adorno decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-1" />

        <div className="mb-10 text-center">
          <div className="relative inline-block group mb-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center font-black text-[#5A4FCF] text-3xl overflow-hidden border-4 border-white shadow-xl shadow-indigo-100">
              {initialUser.image ? (
                <img src={initialUser.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initialUser.name?.substring(0, 2).toUpperCase() || "??"
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#1A1A2E] text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>
          <h1 className="text-3xl font-black text-[#1A1A2E]">Ajustes de Perfil</h1>
          <p className="text-gray-400 font-medium">Actualiza tu información personal en AMA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle size={18} /> ¡Perfil actualizado con éxito!
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  defaultValue={initialUser.name || ""}
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-bold"
                />
              </div>
            </div>

            {/* Email (Lectura) */}
            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                Email de Cuenta (No modificable)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={initialUser.email || ""}
                  readOnly
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-400"
                />
              </div>
            </div>

            {/* Foto Mock */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                URL de Foto de Perfil
              </label>
              <div className="relative">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="image"
                  defaultValue={initialUser.image || ""}
                  placeholder="https://urldeimagen.com"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-bold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                Cambiar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium px-2">Solo llena este campo si deseas actualizar tu clave actual.</p>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#1A1A2E] text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
