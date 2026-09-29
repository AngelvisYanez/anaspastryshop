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

const fieldClass =
  "w-full bg-section-alt border border-card-border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-accent/40 focus:border-accent transition outline-none font-bold text-foreground text-sm";
const labelClass = "text-[11px] font-black uppercase tracking-widest text-muted ml-1";

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
    <section className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden h-full">
      <div className="p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent-subtle rounded-2xl flex items-center justify-center font-black text-accent text-2xl sm:text-3xl overflow-hidden border border-card-border shadow-sm relative shrink-0 mx-auto sm:mx-0">
            {preview ? (
              <Image src={preview} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              initialUser.name?.substring(0, 2).toUpperCase() || "??"
            )}
          </div>
          <div className="text-center sm:text-left min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-foreground">Tu perfil</h2>
            <p className="text-sm text-muted font-medium mt-0.5">
              Nombre, foto y contraseña de tu cuenta
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div role="status" className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0" /> Perfil actualizado
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className={labelClass}>
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  defaultValue={initialUser.name || ""}
                  required
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5 opacity-70">
              <label htmlFor="profile-email" className={labelClass}>
                Correo (no modificable)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-email"
                  type="email"
                  value={initialUser.email || ""}
                  readOnly
                  className={`${fieldClass} text-muted cursor-not-allowed`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-image" className={labelClass}>
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
                  className={fieldClass}
                />
              </div>
              <p className="text-[11px] text-muted font-medium px-1">
                Usa una URL corta. No subas archivos embebidos (provocan error de sesión).
              </p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-card-border">
              <label htmlFor="profile-new-password" className={labelClass}>
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  id="profile-new-password"
                  type="password"
                  name="newPassword"
                  placeholder="Dejar vacío para no cambiar"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-11 bg-accent-solid text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-accent-solid-hover transition-colors shadow-md uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar perfil
          </button>
        </form>
      </div>
    </section>
  );
}
