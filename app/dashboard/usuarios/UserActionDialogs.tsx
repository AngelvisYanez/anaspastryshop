"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { avatarFileError, avatarMimeTypes } from "@/lib/avatar";
import { m, AnimatePresence } from "framer-motion";
import { Trash2, X, Loader2, UserRound } from "lucide-react";

export type UserDialogRecord = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

const inputClass =
  "w-full bg-card border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium";
const labelClass =
  "text-[11px] font-black uppercase tracking-widest text-muted mb-1.5 block";

export type EditableUser = UserDialogRecord & {
  whatsappNumber: string | null;
  whatsappMarketing: boolean;
  isApproved: boolean;
  isActive: boolean;
  deactivationReason: string | null;
};

type EditProps = {
  user: EditableUser;
  isOwnAccount: boolean;
  error: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function EditUserDialog({ user, isOwnAccount, error, isPending, onClose, onSubmit }: EditProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isActive, setIsActive] = useState(user.isActive);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const savedPhoto = user.image && /^(https?:\/\/|\/(?!\/))/i.test(user.image) ? user.image : null;
  const photo = preview || (!removeAvatar ? savedPhoto : null);

  return (
    <dialog ref={dialog} aria-labelledby="edit-user-title"
      onCancel={(event) => { event.preventDefault(); if (!isPending) onClose(); }}
      className="m-auto max-h-[calc(100dvh_-_1rem)] w-[calc(100%_-_1rem)] max-w-2xl overflow-y-auto rounded-2xl border border-card-border bg-card text-foreground shadow-2xl backdrop:bg-black/60 sm:max-h-[calc(100dvh_-_2rem)]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-card-border bg-card px-4 py-3 sm:px-6">
        <h2 id="edit-user-title" className="text-lg font-black">Editar usuario</h2>
        <button type="button" onClick={onClose} disabled={isPending} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-section-alt">
          <X size={18} />
        </button>
      </header>
      <form onSubmit={onSubmit}>
        <fieldset disabled={isPending} className="min-w-0 space-y-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-card-border bg-section-alt p-3">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-subtle text-accent">
              {photo ? <Image src={photo} width={64} height={64} alt="Foto de perfil" unoptimized className="size-full object-cover" /> : <UserRound size={24} />}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="user-avatar" className={labelClass}>Foto de perfil</label>
              <input id="user-avatar" ref={fileInput} name="avatar" type="file" accept={avatarMimeTypes.join(",")}
                className="block w-full min-w-0 text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-card file:px-3 file:py-2 file:font-bold file:text-foreground"
                onChange={(event) => {
                  const input = event.currentTarget;
                  const file = input.files?.[0];
                  const problem = file ? avatarFileError(file) : null;
                  if (problem) input.value = "";
                  setFileError(problem ?? "");
                  setPreview(file && !problem ? URL.createObjectURL(file) : "");
                  if (file && !problem) setRemoveAvatar(false);
                }} />
              <p className="text-xs text-muted">JPG, PNG o WebP de hasta 5 MB.</p>
              {fileError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{fileError}</p>}
              {(savedPhoto || preview) && <button type="button" className="min-h-9 text-xs font-bold text-accent underline"
                onClick={() => {
                  if (fileInput.current) fileInput.current.value = "";
                  setPreview("");
                  setFileError("");
                  setRemoveAvatar(!preview && !removeAvatar);
                }}>
                {preview || removeAvatar ? "Deshacer cambio" : "Quitar foto"}
              </button>}
              {removeAvatar && <input type="hidden" name="removeAvatar" value="true" />}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Nombre completo</span>
              <input name="name" defaultValue={user.name ?? ""} required maxLength={120} className={inputClass} />
            </label>
            <label><span className={labelClass}>Correo electrónico</span>
              <input name="email" type="email" defaultValue={user.email} required maxLength={254} className={inputClass} />
            </label>
            <label><span className={labelClass}>WhatsApp</span>
              <input name="whatsappNumber" type="tel" defaultValue={user.whatsappNumber ?? ""} placeholder="+58 412 1234567" className={inputClass} />
            </label>
            <label><span className={labelClass}>Nueva contraseña</span>
              <input name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72}
                placeholder="Opcional" className={inputClass} />
            </label>
            <label><span className={labelClass}>Rol</span>
              <select name="role" defaultValue={user.role} disabled={isOwnAccount} className={inputClass}>
                <option value="USER">Alumno</option><option value="ADMIN">Administrador</option>
              </select>
            </label>
            <label><span className={labelClass}>Acceso</span>
              <select name="isActive" value={String(isActive)} disabled={isOwnAccount} onChange={(event) => setIsActive(event.target.value === "true")} className={inputClass}>
                <option value="true">Activo</option><option value="false">Suspendido</option>
              </select>
            </label>
            {!isActive && <label className="sm:col-span-2"><span className={labelClass}>Motivo de suspensión</span>
              <input name="deactivationReason" defaultValue={user.deactivationReason ?? ""} maxLength={300} className={inputClass} />
            </label>}
            {isOwnAccount && <>
              <input type="hidden" name="role" value={user.role} />
              <input type="hidden" name="isActive" value={String(user.isActive)} />
            </>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="isApproved" defaultChecked={user.isApproved} /> Cuenta aprobada</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="whatsappMarketing" defaultChecked={user.whatsappMarketing} /> Novedades por WhatsApp</label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
        </fieldset>
        <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-card-border bg-card px-4 py-3 sm:px-6">
          <button type="button" onClick={onClose} disabled={isPending} className="min-h-11 rounded-xl border border-card-border px-4 text-sm font-bold">Cancelar</button>
          <button type="submit" disabled={isPending || Boolean(fileError)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-solid px-4 text-sm font-bold text-white disabled:opacity-60">
            {isPending && <Loader2 className="animate-spin" size={16} />}
            Guardar cambios
          </button>
        </footer>
      </form>
    </dialog>
  );
}

type DeleteProps = {
  user: UserDialogRecord;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteUserDialog({ user, isPending, onClose, onConfirm }: DeleteProps) {
  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <m.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-user-title"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="bg-card rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center border border-card-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Trash2 className="text-red-500" size={24} />
          </div>
          <h2 id="delete-user-title" className="text-xl font-black text-foreground mb-1">
            ¿Eliminar usuario?
          </h2>
          <p className="text-muted text-sm mb-1">Vas a eliminar a:</p>
          <p className="font-bold text-foreground mb-0.5">{user.name || "Sin nombre"}</p>
          <p className="text-xs text-muted mb-5">{user.email}</p>
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-6 font-medium">
            Esta acción es irreversible. Se eliminarán también sus inscripciones.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-section-alt text-foreground hover:bg-card-hover transition text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              aria-busy={isPending}
              className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {isPending && <Loader2 className="animate-spin" size={16} />}
              Eliminar
            </button>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}

type SuspendProps = {
  user: UserDialogRecord;
  isReactivating: boolean;
  suspensionReason: string;
  isPending: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function SuspendUserDialog({
  user,
  isReactivating,
  suspensionReason,
  isPending,
  onReasonChange,
  onClose,
  onConfirm,
}: SuspendProps) {
  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <m.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="suspend-user-title"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-card-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-card-border">
            <h2 id="suspend-user-title" className="text-lg font-black text-foreground">
              {isReactivating ? "Reactivar usuario" : "Suspender usuario"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-card-hover rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-muted">
              {isReactivating
                ? `Estás a punto de reactivar el acceso de ${user.name || "este usuario"}.`
                : `Selecciona el motivo para suspender a ${user.name || "este usuario"}.`}
            </p>
            {!isReactivating && (
              <div>
                <label htmlFor="suspension-reason" className={labelClass}>
                  Motivo de Suspensión
                </label>
                <select
                  id="suspension-reason"
                  value={suspensionReason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Selecciona una razón...
                  </option>
                  <option value="Uso de tarjetas dudosas">Uso de tarjetas dudosas</option>
                  <option value="Inyección de código">Inyección de código</option>
                  <option value="Compartir credenciales">Compartir credenciales</option>
                  <option value="Piratería / Grabación de contenido">
                    Piratería / Grabación de contenido
                  </option>
                  <option value="Distribución de materiales">Distribución de materiales</option>
                </select>
              </div>
            )}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold bg-section-alt text-foreground hover:bg-card-hover transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isPending}
                aria-busy={isPending}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm ${
                  isReactivating
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {isPending && <Loader2 className="animate-spin" size={16} />}
                {isReactivating ? "Reactivar" : "Suspender"}
              </button>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
