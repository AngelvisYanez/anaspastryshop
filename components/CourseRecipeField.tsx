"use client";

import { useState } from "react";

export default function CourseRecipeField({ value, onChange }: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (file.type !== "application/pdf" || file.size === 0 || file.size > 25 * 1024 * 1024) {
      setError("Selecciona un PDF de hasta 25 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      let uploadId: string | undefined;
      for (let offset = 0; offset < file.size; offset += 3 * 1024 * 1024) {
        const body = new FormData();
        body.append("recipe", file.slice(offset, offset + 3 * 1024 * 1024, file.type), file.name);
        if (uploadId) body.append("uploadId", uploadId);
        const response = await fetch("/api/course-recipes", { method: "POST", body });
        const result = response.headers.get("content-type")?.includes("application/json")
          ? await response.json() : null;
        if (!response.ok || !result?.id) {
          throw new Error(result?.error || "No se pudo subir el recetario. Inténtalo de nuevo.");
        }
        uploadId = result.id;
      }
      if (uploadId) onChange(uploadId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir el recetario.");
    } finally {
      setUploading(false);
    }
  }

  return <div className="space-y-2">
    <label htmlFor="course-recipe" className="block text-sm font-bold text-foreground">Recetario del curso (PDF)</label>
    <p className="text-xs text-muted">Disponible para descargar cuando se apruebe la compra. Máximo 25 MB.</p>
    <input id="course-recipe" type="file" accept="application/pdf,.pdf" disabled={uploading}
      className="block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent-solid file:px-3 file:py-2 file:text-white disabled:opacity-50"
      onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
    {uploading && <p role="status" className="text-xs text-muted">Subiendo recetario...</p>}
    {value && !uploading && <div className="flex items-center gap-3 text-xs text-emerald-600"><span>PDF cargado</span><button type="button" onClick={() => onChange("")} className="underline">Quitar</button></div>}
    {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
  </div>;
}
