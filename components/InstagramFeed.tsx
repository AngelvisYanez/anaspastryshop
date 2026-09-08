import { prisma } from "@/lib/prisma";

const IG_PROFILE_URL = "https://www.instagram.com/anaspastryshopve/";

const INSTAGRAM_POST_SHORTCODES: string[] = [];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

async function getGallery() {
  try {
    return await prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

function ProfileCTA() {
  return (
    <div className="text-center mt-10">
      <a
        href={IG_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-pink-500/25"
      >
        <InstagramIcon className="w-5 h-5" />
        Seguinos en @anaspastryshopve
      </a>
    </div>
  );
}

export default async function InstagramFeed() {
  const galleryItems = await getGallery();

  return (
    <section className="py-24 px-6 bg-section-alt border-y border-card-border">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Nuestro trabajo habla por nosotros
          </h2>
          <p className="text-muted font-medium mt-3 text-sm">
            Síguenos en Instagram para ver todas nuestras creaciones y el proceso detrás de cada pieza.
          </p>
        </div>

        {galleryItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {galleryItems.map((item) => (
                <a
                  key={item.id}
                  href={IG_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] border border-card-border"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.alt || "Creación de Ana's Pastry Shop"}
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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                      Ver en Instagram
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <ProfileCTA />
          </>
        ) : INSTAGRAM_POST_SHORTCODES.length > 0 ? (
          <>
            <style>{`
              .ig-grid { column-count: 3; column-gap: 1rem; }
              .ig-grid .instagram-media { width: 100% !important; min-width: 162px !important; max-width: 100% !important; margin: 0 0 1rem !important; }
              @media (max-width: 900px) { .ig-grid { column-count: 2; } }
              @media (max-width: 560px) { .ig-grid { column-count: 1; } }
            `}</style>
            <div className="ig-grid max-w-3xl mx-auto">
              {INSTAGRAM_POST_SHORTCODES.map((shortcode) => (
                <blockquote
                  key={shortcode}
                  className="instagram-media"
                  data-instgrm-captioned
                  data-instgrm-permalink={`https://www.instagram.com/p/${shortcode}/?utm_source=ig_embed&utm_campaign=loading`}
                  data-instgrm-version="14"
                />
              ))}
            </div>
            <ProfileCTA />
            <script async src="https://www.instagram.com/embed.js" />
          </>
        ) : (
          <>
            <div className="max-w-lg mx-auto bg-card border border-card-border rounded-3xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-orange-950/40 flex items-center justify-center">
                <InstagramIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">
                Conocé nuestras creaciones en Instagram
              </h3>
              <p className="text-sm text-muted font-medium leading-relaxed mb-8">
                Pronto podrás ver aquí la galería completa de tortas y mesas dulces. Mientras tanto, te invitamos a descubrir todo nuestro trabajo en el perfil oficial de Anais Flores.
              </p>
              <a
                href={IG_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-pink-500/25"
              >
                <InstagramIcon className="w-5 h-5" />
                Seguinos en @anaspastryshopve
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}