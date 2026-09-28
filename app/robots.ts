import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://anaspastryshop.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/pagar/",
          "/checkout/",
          "/mis-cursos",
          "/unsubscribe",
          "/iniciar-sesion",
          "/registro",
          "/olvide-mi-contrasena",
          "/restablecer-contrasena",
          "/cursos/*/leccion/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
