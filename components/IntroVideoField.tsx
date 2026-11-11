"use client";

import { useState } from "react";

export default function IntroVideoField({ value, onChange, className }: {
  value: string;
  onChange: (value: string) => void;
  className: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (file.size > 25 * 1024 * 1024) {
      setError("El video no puede superar 25 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      let uploadId: string | undefined;
      let url = "";
      for (let offset = 0; offset < file.size; offset += 3 * 1024 * 1024) {
        const body = new FormData();
        body.append("video", file.slice(offset, offset + 3 * 1024 * 1024, file.type), file.name);
        if (uploadId) body.append("uploadId", uploadId);
        const response = await fetch("/api/intro-videos", { method: "POST", body });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "No se pudo subir el video.");
        url = result.url;
        uploadId = url.split("/").at(-1);
      }
      onChange(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir el video.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        id="course-intro-video"
        value={value}
        onChange={(event) => { onChange(event.target.value); setError(null); }}
        type="text"
        className={className}
        placeholder="URL de Google Drive, YouTube o Vimeo"
      />
      <label className="block text-xs text-muted">
        O sube un video (MP4, WebM u Ogg; máximo 25 MB)
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          disabled={uploading}
          className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent-solid file:px-3 file:py-2 file:text-white disabled:opacity-50"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </label>
      {uploading && <p role="status" className="text-xs text-muted">Subiendo video...</p>}
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
