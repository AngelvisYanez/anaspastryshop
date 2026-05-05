"use client";
import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, X, Video } from "lucide-react";

interface Props {
  onUpload: (videoUrl: string) => void;
  currentUrl?: string;
}

export default function CloudflareVideoUploader({ onUpload, currentUrl }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("video/")) {
      setError("Solo se aceptan archivos de video");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("El archivo no puede superar 500MB");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const res = await fetch("/api/cloudflare/upload-url", { method: "POST" });
      const { uploadUrl, uid } = await res.json();

      if (!uploadUrl) {
        setError("No se pudo obtener la URL de subida");
        setUploading(false);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload error")));
        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });

      const cfVideoUrl = `https://iframe.videodelivery.net/${uid}`;
      setUploadedUrl(cfVideoUrl);
      onUpload(cfVideoUrl);
      setProgress(100);
    } catch (err) {
      setError("Error al subir el video. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {uploadedUrl && !uploading && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-xl">
          <CheckCircle size={16} className="text-green-500 shrink-0" />
          <span className="text-xs font-bold text-green-700 dark:text-green-400 flex-1 truncate">
            Video subido exitosamente
          </span>
          <button
            type="button"
            onClick={() => { setUploadedUrl(null); onUpload(""); }}
            className="text-green-500 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-accent" />
            <span className="font-bold">Subiendo a Cloudflare Stream... {progress}%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2 border border-card-border overflow-hidden">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-accent-subtle border border-accent/30 text-accent font-bold py-2.5 px-4 rounded-xl hover:bg-accent hover:text-white transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Subir Video
        </button>
        <input
          type="file"
          ref={fileRef}
          accept="video/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      <p className="text-[10px] text-muted font-medium">
        Formatos: MP4, MOV, WebM — Máximo 500MB — Alojado en Cloudflare Stream
      </p>
    </div>
  );
}
