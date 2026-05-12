"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Loader2, CheckCircle, X, Video, Film } from "lucide-react";
import { getDirectUploadUrl } from "@/lib/actions/cloudflare";

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
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    if (currentUrl) setUploadedUrl(currentUrl);
  }, [currentUrl]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Solo se aceptan archivos de video");
      return;
    }
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const res = await getDirectUploadUrl();

      if (res.error || !res.uploadURL || !res.uid) {
        throw new Error(res.error || "Respuesta inválida del servidor");
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const cfVideoUrl = `https://iframe.videodelivery.net/${res.uid}`;
            setUploadedUrl(cfVideoUrl);
            onUpload(cfVideoUrl);
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText.substring(0, 200)}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Error de red al subir el video")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelado")));

        const formData = new FormData();
        formData.append("file", file);

        xhr.open("POST", res.uploadURL!);
        xhr.send(formData);
      });
    } catch (err: any) {
      console.error("[CloudflareUpload] error:", err);
      setError(err.message || "Error al subir el video. Intenta de nuevo.");
    } finally {
      setUploading(false);
      xhrRef.current = null;
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
    xhrRef.current?.abort();
    xhrRef.current = null;
    setUploading(false);
    setProgress(0);
  };

  if (uploadedUrl && !uploading) {
    return (
      <div className="space-y-2">
        <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video border border-card-border">
          <iframe
            src={uploadedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle size={13} className="text-green-500 shrink-0" />
            <p className="text-[10px] text-green-600 dark:text-green-400 font-bold truncate">{uploadedUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => { setUploadedUrl(null); onUpload(""); }}
            className="flex items-center gap-1 text-[10px] text-muted hover:text-red-500 font-bold transition-colors shrink-0"
          >
            <X size={11} /> Quitar
          </button>
        </div>
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
          disabled={uploading}
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
