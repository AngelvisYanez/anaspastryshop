import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
  transpilePackages: [
    "@cloudflare/realtimekit-react",
    "@cloudflare/realtimekit-react-ui",
    "@cloudflare/realtimekit-ui",
    "@cloudflare/realtimekit",
  ],
};

export default nextConfig;
