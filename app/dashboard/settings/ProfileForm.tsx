"use client";
import { useState, useRef } from "react";
import { m } from "framer-motion";
import { User, Mail, Lock, Camera, Loader2, Save, CheckCircle, AlertCircle, Trash2, RefreshCcw } from "lucide-react";
import { updateProfile } from "@/lib/actions/user";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function ProfileForm({ initialUser }: { initialUser: UserProfile }) {
  const { update, data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialUser.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convertir file a Base64 para guardarlo en la DB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("La imagen es muy pesada (máx 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    // Si hay una previsualización (Base64), la enviamos como el valor de image
    if (previewImage) {
      formData.set("image", previewImage);
    }

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      
      // Actualizamos la sesión de NextAuth en el cliente
      await update({
        name: formData.get("name"),
        image: previewImage
      });

      // Actualizamos caché local para la Navbar
      if (previewImage && session?.user?.id) {
        localStorage.setItem(`user-img-${session.user.id}`, previewImage);
      }

      setTimeout(() => setSuccess(false), 3000);
      // Recargar para asegurar que el Layout del Dashboard (Server Component) detecte el cambio de imagen
      window.location.reload();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Adorno decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-[100px] -z-1" />

        <div className="mb-10 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative inline-block group">
              <div className="w-28 h-28 bg-amber-50 rounded-3xl flex items-center justify-center font-black text-[#C9A84C] text-4xl overflow-hidden border-4 border-white shadow-xl shadow-amber-100 relative group">
                {previewImage ? (
                  <Image src={previewImage} alt="Avatar" width={112} height={112} className="w-full h-full object-cover" />
                ) : (
                  initialUser.name?.substring(0, 2).toUpperCase() || "??"
                )}
                {/* Overlay en hover (solo si no hay controles abajo, o como atajo) */}
                {!previewImage && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera size={28} className="text-white" />
                  </button>
                )}
              </div>
              
              {/* Botón flotante rápido si NO hay imagen */}
              {!previewImage && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-[#0B1F3A] text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* Controles de Foto - Estilo Premium */}
            {previewImage && (
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B1F3A] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all border border-gray-100"
                >
                  <RefreshCcw size={14} /> Reemplazar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all border border-red-100"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>
          <h1 className="text-3xl font-black text-[#0B1F3A]">Ajustes de Perfil</h1>
          <p className="text-muted font-medium">Actualiza tu información personal en Academia Credito USA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-shake">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
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
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#C9A84C] transition-all outline-none font-bold"
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

            {/* Hidden field for image if we want to also allow URL or just keep it consistent */}
            <input type="hidden" name="image" value={previewImage || ""} />

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
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#C9A84C] transition-all outline-none font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium px-2">Solo llena este campo si deseas actualizar tu clave actual.</p>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#0B1F3A] text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-gray-950 transition-all shadow-xl shadow-amber-100 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}

