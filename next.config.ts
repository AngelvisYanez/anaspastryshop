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
    ];
  },
  images: {
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
    ],
  },
};

export default nextConfig;
