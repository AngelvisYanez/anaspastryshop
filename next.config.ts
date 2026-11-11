import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      { source: "/auth/login", destination: "/iniciar-sesion", permanent: true },
      { source: "/auth/signup", destination: "/registro", permanent: true },
      { source: "/auth/forgot-password", destination: "/olvide-mi-contrasena", permanent: true },
      { source: "/auth/reset-password", destination: "/restablecer-contrasena", permanent: true },
      { source: "/checkout/success", destination: "/pagar/confirmacion", permanent: true },

      // Ruta canónica de un workshop: /workshop/<slug>. El plural queda como alias.
      // Excluye /workshops/calendario (página de cronograma, no un slug de taller).
      { source: "/workshop/calendario", destination: "/workshops/calendario", permanent: false },
      {
        source: "/workshops/:slug((?!calendario$).*)",
        destination: "/workshop/:slug",
        permanent: true,
      },

      // "lesson" -> "leccion" (antes las clases vivían bajo /cursos/<id>/lesson/<lessonId>)
      { source: "/cursos/:course/lesson/:lesson", destination: "/cursos/:course/leccion/:lesson", permanent: true },

      // La clase por título crudo se résuelve ahora por slug de curso y slug de módulo.
      { source: "/clases/:course/:module", destination: "/cursos/:course", permanent: true },

      // Inglés -> español
      { source: "/courses", destination: "/cursos", permanent: true },
      { source: "/workshop", destination: "/workshops", permanent: true },
      { source: "/lessons/:path*", destination: "/cursos", permanent: false },
    ];
  },
  images: {
    // Query strings on local `/api/course-image/...` covers require an explicit
    // localPatterns entry (Next.js 16). Omit `search` to allow any `?v=` stamp.
    localPatterns: [
      { pathname: "/api/course-image/**" },
      { pathname: "/api/gallery-image/**" },
      { pathname: "/**", search: "" },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '**',
      },
      // Avatares de cuentas de Google (NextAuth Google provider).
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
