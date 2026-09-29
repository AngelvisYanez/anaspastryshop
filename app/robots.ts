import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

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
      {
        userAgent: "Googlebot",
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
    host: siteUrl.replace(/^https?:\/\//, ""),
  };
}
