"use client";
import { useState, useRef, useEffect } from "react";
import { ImageIcon, X, Upload } from "lucide-react";

const MAX_SIZE_MB = 2;

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(value || "");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || "");
    setError(null);
  }, [value]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes (JPG, PNG, WebP...)");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no puede superar ${MAX_SIZE_MB}MB`);
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onChange(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview("");
    onChange("");
    setError(null);
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-card-border bg-section-alt">
          <img
            src={preview}
            alt="Portada del curso"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-white text-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-accent hover:text-white transition-colors"
            >
              <Upload size={13} /> Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-white text-red-500 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-colors"
            >
              <X size={13} /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-card-border hover:border-accent/50 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-section-alt/50 group"
        >
          <div className="w-12 h-12 rounded-xl bg-section-alt group-hover:bg-accent/10 flex items-center justify-center transition-colors">
            <ImageIcon size={22} className="text-muted group-hover:text-accent transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">Subir imagen de portada</p>
            <p className="text-xs text-muted mt-1">JPG, PNG, WebP — máx. {MAX_SIZE_MB}MB</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <input
        type="url"
        value={preview.startsWith("data:") ? "" : preview}
        onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
        placeholder="O pega una URL de imagen..."
        className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted/70 text-sm"
      />
    </div>
  );
}
