"use client";
import { useState } from "react";
import { User, Mail, Lock, Loader2, Save, CheckCircle, AlertCircle, Link2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/user";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null;
}

function isSafeImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith("data:")) return false;
  if (value.length > 2048) return false;
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
}

export default function ProfileForm({ initialUser }: { initialUser: UserProfile }) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    isSafeImageUrl(initialUser.image) ? initialUser.image : ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const trimmed = imageUrl.trim();
    formData.set("image", trimmed);

    try {
      const result = await updateProfile(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);

      await update({
        name: formData.get("name"),
        image: isSafeImageUrl(trimmed) ? trimmed : null,
      });

      setTimeout(() => setSuccess(false), 3000);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const preview = isSafeImageUrl(imageUrl.trim()) ? imageUrl.trim() : null;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-card rounded-xl p-8 md:p-12 shadow-md border border-card-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-accent-subtle rounded-bl-[80px] -z-1" />

        <div className="mb-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-24 h-24 bg-accent-subtle rounded-lg flex items-center justify-center font-black text-accent text-3xl overflow-hidden border-2 border-card-border shadow-md relative">
              {preview ? (
                <Image src={preview} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                initialUser.name?.substring(0, 2).toUpperCase() || "??"
              )}
            </div>
          </div>
          <h1 className="text-2xl font-black text-foreground">Ajustes de Perfil</h1>
          <p className="text-muted font-medium">Actualiza tu información personal en Ana&apos;s Pastry Shop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-lg text-sm font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success && (
            <div role="status" className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle size={16} /> ¡Perfil actualizado con éxito!
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  defaultValue={initialUser.name || ""}
                  required
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-accent transition outline-none font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 opacity-60">
              <label htmlFor="profile-email" className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Email de Cuenta (No modificable)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-email"
                  type="email"
                  value={initialUser.email || ""}
                  readOnly
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 outline-none font-bold text-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-image" className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Foto de perfil (URL)
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-image"
                  type="url"
                  name="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://… o /ruta-local.webp"
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-accent transition outline-none font-bold text-foreground"
                />
              </div>
              <p className="text-[11px] text-muted font-medium px-1">
                Solo URLs cortas. No subas archivos embebidos: hinchan la sesión y provocan error 431.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-card-border">
              <label htmlFor="profile-new-password" className="text-[11px] font-black uppercase tracking-widest text-muted ml-1">
                Cambiar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-new-password"
                  type="password"
                  name="newPassword"
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  className="w-full bg-section-alt border border-card-border rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-accent transition outline-none font-bold text-foreground"
                />
              </div>
              <p className="text-[11px] text-muted font-medium px-1">Solo llena este campo si deseas actualizar tu clave actual.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-solid text-white py-3 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-accent-solid-hover transition-colors shadow-md uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
