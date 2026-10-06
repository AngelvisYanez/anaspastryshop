import { X } from "lucide-react";

export type GalleryCard = {
  id: string;
  imageUrl: string;
  alt: string | null;
  caption: string | null;
};

export function GalleryGrid({ items }: { items: GalleryCard[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => {
        const popoverId = `gallery-${item.id}`;
        const label = item.alt || item.caption || "Creación de Ana's Pastry Shop";

        return (
          <div key={item.id}>
            <button
              type="button"
              popoverTarget={popoverId}
              className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-xl transition duration-300 hover:scale-[1.03] border border-card-border text-left cursor-pointer"
              aria-label={`Ver ${label}`}
            >
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                  <p className="text-white text-xs font-bold leading-snug line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-focus-visible:bg-black/30 transition duration-300 flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                  Ver
                </span>
              </div>
            </button>

            <div
              id={popoverId}
              popover="auto"
              className="m-auto w-[min(100vw-2rem,56rem)] max-h-[92dvh] overflow-auto border-0 bg-transparent p-0 backdrop:bg-black/80"
            >
              <figure className="relative mx-auto w-fit max-w-full">
                <button
                  type="button"
                  popoverTarget={popoverId}
                  popoverTargetAction="hide"
                  aria-label="Cerrar"
                  className="absolute top-3 right-3 z-10 min-h-11 min-w-11 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={20} />
                </button>
                <img
                  src={item.imageUrl}
                  alt={label}
                  className="mx-auto max-h-[80dvh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                />
                {(item.caption || item.alt) && (
                  <figcaption className="mt-3 text-center text-sm font-bold text-white">
                    {item.caption || item.alt}
                  </figcaption>
                )}
              </figure>
            </div>
          </div>
        );
      })}
    </div>
  );
}
