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

      await update({
        name: formData.get("name"),
        image: previewImage
      });

      if (previewImage && session?.user?.id) {
        localStorage.setItem(`user-img-${session.user.id}`, previewImage);
      }

      setTimeout(() => setSuccess(false), 3000);
      window.location.reload();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-card rounded-xl p-8 md:p-12 shadow-md border border-card-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-accent-subtle rounded-bl-[80px] -z-1" />

        <div className="mb-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative inline-block group">
              <div className="w-24 h-24 bg-accent-subtle rounded-lg flex items-center justify-center font-black text-accent text-3xl overflow-hidden border-2 border-card-border shadow-md relative group">
                {previewImage ? (
                  <Image src={previewImage} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  initialUser.name?.substring(0, 2).toUpperCase() || "??"
                )}
                {!previewImage && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    aria-label="Subir foto de perfil"
                  >
                    <Camera size={24} className="text-white" />
                  </button>
                )}
              </div>

              {!previewImage && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-accent text-white p-2.5 rounded-lg shadow-md hover:scale-110 transition-transform"
                  aria-label="Subir foto de perfil"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>

            {previewImage && (
              <div className="flex items-center gap-2 bg-section-alt p-1.5 rounded-lg border border-card-border shadow-sm">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-card text-foreground text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-card-hover transition-all border border-card-border"
                >
                  <RefreshCcw size={13} /> Reemplazar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-red-100 transition-all border border-red-200 dark:border-red-800"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label="Seleccionar imagen de perfil"
            />
          </div>
          <h1 className="text-2xl font-black text-foreground">Ajustes de Perfil</h1>
          <p className="text-muted font-medium">Actualiza tu información personal en Ana's Pastry Shop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-lg text-sm font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-950/20 text-green-600 p-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle size={16} /> ¡Perfil actualizado con éxito!
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  name="name"
                  defaultValue={initialUser.name || ""}
                  required
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 opacity-60">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Email de Cuenta (No modificable)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  value={initialUser.email || ""}
                  readOnly
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 outline-none font-bold text-muted"
                />
              </div>
            </div>

            <input type="hidden" name="image" value={previewImage || ""} />

            <div className="space-y-2 pt-4 border-t border-card-border">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Cambiar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-bold text-foreground"
                />
              </div>
              <p className="text-[11px] text-muted font-medium px-1">Solo llena este campo si deseas actualizar tu clave actual.</p>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-accent-hover transition-all shadow-md uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
