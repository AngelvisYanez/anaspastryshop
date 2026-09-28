"use client";

import { m, AnimatePresence } from "framer-motion";
import { Trash2, X, Loader2 } from "lucide-react";

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

type EditProps = {
  user: UserDialogRecord;
  error: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function EditUserDialog({ user, error, isPending, onClose, onSubmit }: EditProps) {
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
          aria-labelledby="edit-user-title"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="bg-card rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-card-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-card-border">
            <h2 id="edit-user-title" className="text-lg font-black text-foreground">
              Editar Usuario
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-card-hover rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="user-name" className={labelClass}>
                Nombre Completo
              </label>
              <input
                id="user-name"
                name="name"
                defaultValue={user.name || ""}
                required
                placeholder="Ej. María González"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="user-image" className={labelClass}>
                Imagen (URL)
              </label>
              <input
                id="user-image"
                name="image"
                defaultValue={user.image || ""}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="user-role" className={labelClass}>
                Rol
              </label>
              <select
                id="user-role"
                name="role"
                defaultValue={user.role}
                className={inputClass}
                disabled
              >
                <option value="USER">Alumno</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {error && (
              <p
                role="alert"
                className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-xl"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="w-full bg-accent-solid text-white py-3 rounded-xl font-bold hover:bg-accent-solid-hover shadow-md shadow-accent/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending && <Loader2 className="animate-spin" size={16} />}
              Guardar Cambios
            </button>
          </form>
        </m.div>
      </m.div>
    </AnimatePresence>
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
