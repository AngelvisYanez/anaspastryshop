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
      { source: "/auth/signup-mentor", destination: "/registro-mentor", permanent: true },
      { source: "/auth/forgot-password", destination: "/olvide-mi-contrasena", permanent: true },
      { source: "/auth/reset-password", destination: "/restablecer-contrasena", permanent: true },
      { source: "/checkout/membresia", destination: "/pagar/membresia", permanent: true },
      { source: "/checkout/success", destination: "/pagar/confirmacion", permanent: true },
      { source: "/planes", destination: "/membresia", permanent: true },
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
        hostname: '*.cloudflarestream.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'customer-*.cloudflarestream.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'iframe.videodelivery.net',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
