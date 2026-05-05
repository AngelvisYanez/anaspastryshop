"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, CheckCircle, X, Video, Film } from "lucide-react";
import * as tus from "tus-js-client";

interface Props {
  onUpload: (videoUrl: string) => void;
  currentUrl?: string;
}

export default function CloudflareVideoUploader({ onUpload, currentUrl }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Solo se aceptan archivos de video");
      return;
    }
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const res = await fetch("/api/cloudflare/upload-url", { method: "POST" });
      if (!res.ok) throw new Error("No se pudo obtener la URL de subida");
      const { uploadUrl, uid } = await res.json();
      if (!uploadUrl || !uid) throw new Error("Respuesta inválida del servidor");

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          uploadUrl,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            name: file.name,
            filetype: file.type,
          },
          chunkSize: 50 * 1024 * 1024,
          onProgress(bytesUploaded, bytesTotal) {
            setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          },
          onSuccess() {
            const cfVideoUrl = `https://iframe.videodelivery.net/${uid}`;
            setUploadedUrl(cfVideoUrl);
            onUpload(cfVideoUrl);
            resolve();
          },
          onError(err) {
            reject(err);
          },
        });
        uploadRef.current = upload;
        upload.start();
      });
    } catch {
      setError("Error al subir el video. Intenta de nuevo.");
    } finally {
      setUploading(false);
      uploadRef.current = null;
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const cancelUpload = () => {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setUploading(false);
    setProgress(0);
  };

  if (uploadedUrl && !uploading) {
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-xl">
        <CheckCircle size={16} className="text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-green-700 dark:text-green-400">Video subido a Cloudflare Stream</p>
          <p className="text-[10px] text-green-600/70 dark:text-green-500/70 truncate mt-0.5">{uploadedUrl}</p>
        </div>
        <button
          type="button"
          onClick={() => { setUploadedUrl(null); onUpload(""); }}
          className="text-green-500 hover:text-red-500 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="border border-card-border rounded-xl p-4 space-y-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={15} className="animate-spin text-accent" />
            <span className="font-bold">Subiendo a Cloudflare Stream... {progress}%</span>
          </div>
          <button type="button" onClick={cancelUpload} className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors">
            Cancelar
          </button>
        </div>
        <div className="w-full bg-section-alt rounded-full h-2 border border-card-border overflow-hidden">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted font-medium">No cierres esta ventana hasta que el upload finalice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-200 dark:border-red-800">{error}</p>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none
          ${dragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-card-border hover:border-accent/50 hover:bg-section-alt/50"
          }
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-accent text-white" : "bg-section-alt text-muted"}`}>
            {dragging ? <Film size={22} /> : <Upload size={22} />}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {dragging ? "Suelta el video aquí" : "Arrastra tu video aquí"}
            </p>
            <p className="text-xs text-muted mt-1">
              o <span className="text-accent font-bold underline underline-offset-2">selecciona desde tu PC</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
            <Video size={11} />
            <span>MP4, MOV, WebM — Sin límite de tamaño — Cloudflare Stream</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileRef}
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
