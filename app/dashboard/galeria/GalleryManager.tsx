"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Loader2,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  Link2,
  X,
} from "lucide-react";
import {
  addGalleryItem,
  deleteGalleryItem,
  updateGalleryItem,
  type GalleryItemData,
} from "@/lib/actions/gallery";

const MAX_SIZE_MB = 3;

export default function GalleryManager({
  initialItems,
}: {
  initialItems: GalleryItemData[];
}) {
  const [items, setItems] = useState<GalleryItemData[]>(initialItems);
  const [image, setImage] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes (JPG, PNG, WebP)");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no puede superar ${MAX_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!image.trim()) {
      setError("Debes seleccionar o pegar una imagen");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.set("imageUrl", image);
    formData.set("alt", alt);
    formData.set("caption", caption);
    formData.set("order", String(items.length));

    startTransition(async () => {
      const result = await addGalleryItem(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      const created = result?.item;
      if (created) setItems((prev) => [...prev, created]);
      setImage("");
      setAlt("");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function reorder(id: string, dir: 1 | -1) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);

    setItems(next);
    startTransition(async () => {
      const movedItem = next[target];
      const swappedItem = next[idx];
      await updateGalleryItem(movedItem.id, { order: target });
      await updateGalleryItem(swappedItem.id, { order: idx });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteGalleryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <div className="space-y-8">
      {error && (
        <p role="alert" className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </p>
      )}

      <form
        onSubmit={handleCreate}
        className="bg-card border border-card-border rounded-2xl p-6 space-y-5"
      >
        <h2 className="font-black text-foreground flex items-center gap-2">
          <ImagePlus size={18} className="text-accent" />
          Agregar foto a la galería
        </h2>

        <div className="space-y-2">
          {image ? (
            <div className="relative group rounded-xl overflow-hidden border border-card-border bg-section-alt">
              <img
                src={image}
                alt="Vista previa de la foto"
                className="w-full max-h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="bg-card text-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-accent-solid hover:text-white transition-colors"
                >
                  <Link2 size={13} /> Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImage("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="bg-card text-red-500 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <X size={13} /> Quitar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-card-border hover:border-accent/50 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors hover:bg-section-alt/50 group"
            >
              <div className="w-12 h-12 rounded-xl bg-section-alt group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                <ImagePlus size={22} className="text-muted group-hover:text-accent transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">Subir foto de creación</p>
                <p className="text-xs text-muted mt-1">JPG, PNG, WebP — máx. {MAX_SIZE_MB}MB</p>
              </div>
            </button>
          )}

          <input
            ref={fileRef}
            id="gallery-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />

          <label htmlFor="gallery-url" className="sr-only">URL de la imagen</label>
          <input
            id="gallery-url"
            type="url"
            value={image.startsWith("data:") ? "" : image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="O pega una URL de imagen..."
            className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent transition text-foreground placeholder:text-muted/70 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gallery-alt" className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
              Texto alternativo (SEO)
            </label>
            <input
              id="gallery-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Ej: Torta de boda con flores"
              className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent transition text-foreground placeholder:text-muted/70 text-sm"
            />
          </div>
          <div>
            <label htmlFor="gallery-caption" className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
              Leyenda (opcional)
            </label>
            <input
              id="gallery-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej: Torta tres leches, evento de XV años"
              className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent transition text-foreground placeholder:text-muted/70 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-accent-solid text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-accent-solid-hover transition shadow-md shadow-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Agregar a la galería
        </button>
      </form>

      <div>
        <h2 className="font-black text-foreground mb-4">
          Fotos en la galería
          <span className="ml-2 text-xs font-bold text-muted bg-section-alt border border-card-border px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </h2>

        {items.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-section-alt flex items-center justify-center">
              <ImagePlus size={24} className="text-muted" />
            </div>
            <p className="font-bold text-foreground">Aún no hay fotos</p>
            <p className="text-xs text-muted mt-1">
              Si guardas el token de Instagram en Configuración, la página de Pastelería muestra el feed de la cuenta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-card border border-card-border rounded-2xl overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={item.imageUrl}
                    alt={item.alt || "Creación de Ana's Pastry Shop"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="bg-card text-red-500 rounded-lg p-2 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-60"
                      title="Eliminar"
                      aria-label="Eliminar foto"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(item.id, -1)}
                      disabled={isPending || idx === 0}
                      className="bg-card text-foreground rounded-lg p-2 hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-40"
                      title="Subir"
                      aria-label="Mover hacia arriba"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(item.id, 1)}
                      disabled={isPending || idx === items.length - 1}
                      className="bg-card text-foreground rounded-lg p-2 hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-40"
                      title="Bajar"
                      aria-label="Mover hacia abajo"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-bold text-foreground truncate">
                    {item.caption || item.alt || "Sin descripción"}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Posición {idx + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
