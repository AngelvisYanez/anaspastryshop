"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Save, Trash2, UserRound } from "lucide-react";
import { updateProfile } from "@/lib/actions/user";
import { avatarFileError, avatarMimeTypes } from "@/lib/avatar";

interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null;
  whatsappNumber: string | null;
  whatsappMarketing: boolean;
}

const fieldClass = "mt-1.5 min-h-11 w-full rounded-xl border border-card-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-card-border bg-card px-3 text-xs font-bold text-foreground hover:border-accent focus-visible:outline-2 focus-visible:outline-accent";

export default function ProfileForm({ initialUser }: { initialUser: UserProfile }) {
  const { update } = useSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<{ file: File; preview: string } | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const objectUrl = selection?.preview;
  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setSuccess(false);
    const problem = avatarFileError(file);
    setError(problem ?? "");
    if (problem) return;

    setSelection({ file, preview: URL.createObjectURL(file) });
    setRemovePhoto(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (selection) formData.set("avatar", selection.file);
    if (removePhoto) formData.set("removeAvatar", "true");

    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSelection(null);
      setRemovePhoto(false);
      if (passwordInput.current) passwordInput.current.value = "";
      setSuccess(true);
      await update({}).catch(() => null);
    } catch {
      setError("No se pudo guardar el perfil. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const savedPhoto = initialUser.image && /^(https?:\/\/|\/(?!\/))/i.test(initialUser.image) ? initialUser.image : null;
  const visiblePhoto = objectUrl || (!removePhoto ? savedPhoto : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="profile-title">
      <section className="rounded-2xl border border-card-border bg-card shadow-sm">
        <header className="border-b border-card-border px-4 py-4 sm:px-6">
          <h2 id="profile-title" className="text-lg font-black text-foreground">Mi cuenta</h2>
          <p className="mt-0.5 text-sm text-muted">Foto y datos de tu perfil.</p>
        </header>

        <fieldset disabled={loading} className="min-w-0 divide-y divide-card-border disabled:opacity-60">
          <div className="flex flex-wrap items-center gap-4 bg-section-alt/50 p-4 sm:gap-5 sm:px-6">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-card-border bg-accent-subtle text-accent sm:size-24">
              {visiblePhoto
                ? <Image key={visiblePhoto} src={visiblePhoto} alt="Foto de perfil" width={96} height={96} unoptimized className="size-full object-cover" />
                : <UserRound size={30} aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-sm font-bold text-foreground">Foto de perfil</h3>
              <p id="avatar-help" className="text-xs text-muted">JPG, PNG o WebP de hasta 5 MB.</p>
              <input ref={fileInput} type="file" accept={avatarMimeTypes.join(",")} hidden onChange={choosePhoto} />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={secondaryButton} aria-describedby="avatar-help" onClick={() => fileInput.current?.click()}>
                  <ImagePlus size={15} aria-hidden="true" />{visiblePhoto ? "Cambiar foto" : "Subir foto"}
                </button>
                {selection || removePhoto ? (
                  <button type="button" className={secondaryButton} onClick={() => {
                    setSelection(null);
                    setRemovePhoto(false);
                    setError("");
                  }}>Deshacer</button>
                ) : savedPhoto && (
                  <button type="button" className={secondaryButton} onClick={() => {
                    setRemovePhoto(true);
                    setSuccess(false);
                    setError("");
                  }}><Trash2 size={15} aria-hidden="true" /> Quitar foto</button>
                )}
              </div>
              {(selection || removePhoto) && <p role="status" className="break-all text-xs text-muted">
                {selection ? selection.file.name : "Foto marcada para quitar"} · Guarda los cambios para confirmar.
              </p>}
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:px-6">
            <label className="text-sm font-semibold text-foreground">Nombre completo
              <input name="name" autoComplete="name" defaultValue={initialUser.name || ""} required maxLength={120} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold text-foreground">Correo electrónico
              <input type="email" value={initialUser.email || ""} readOnly className={`${fieldClass} text-muted`} />
            </label>
          </div>
        </fieldset>
      </section>

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:px-6">
        <h3 className="text-sm font-bold text-foreground">Seguridad</h3>
        <label className="mt-3 block max-w-lg text-sm font-semibold text-foreground">Nueva contraseña
          <input ref={passwordInput} type="password" name="newPassword" autoComplete="new-password" disabled={loading}
            placeholder="Deja este campo vacío para conservarla" className={fieldClass} />
        </label>
      </section>

      {initialUser.whatsappNumber && (
        <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:px-6">
          <h3 className="text-sm font-bold text-foreground">Novedades por WhatsApp</h3>
          <p className="mt-0.5 text-sm text-muted"><bdi>{initialUser.whatsappNumber}</bdi></p>
          <input type="hidden" name="whatsappPreferences" value="true" />
          <label className="mt-3 flex items-start gap-3 text-sm text-foreground">
            <input type="checkbox" name="whatsappMarketing" defaultChecked={initialUser.whatsappMarketing} disabled={loading} className="mt-0.5 size-4 accent-accent-solid" />
            Quiero recibir novedades y avisos de nuevos cursos.
          </label>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border bg-card p-3 sm:px-4">
        <div className="text-sm font-semibold">
          {error && <p role="alert" className="flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle size={16} className="shrink-0" />{error}</p>}
          {success && <p role="status" className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={16} /> Perfil actualizado.</p>}
        </div>
        <button type="submit" disabled={loading} className="ml-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-solid px-5 text-sm font-bold text-white hover:bg-accent-solid-hover disabled:opacity-60 sm:w-auto">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
