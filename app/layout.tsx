import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://academiacreditousa.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Academia Credito USA | Educación Financiera en Español",
    template: "%s | Academia Credito USA",
  },
  description:
    "La plataforma líder en educación financiera y crédito en Estados Unidos para la comunidad hispana. Aprende a construir crédito, acceder a financiamiento y dominar tus finanzas personales.",
  keywords: [
    "crédito USA",
    "educación financiera hispanos",
    "construir crédito Estados Unidos",
    "finanzas personales español",
    "cursos crédito",
    "academia financiera",
  ],
  authors: [{ name: "Academia Credito USA" }],
  creator: "Academia Credito USA",
  openGraph: {
    type: "website",
    locale: "es_US",
    url: siteUrl,
    siteName: "Academia Credito USA",
    title: "Academia Credito USA | Educación Financiera en Español",
    description:
      "Aprende a construir crédito, manejar finanzas y acceder a oportunidades financieras en Estados Unidos. Cursos en español.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Academia Credito USA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia Credito USA | Educación Financiera en Español",
    description: "Aprende a construir crédito y manejar tus finanzas en Estados Unidos.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": 150,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Academia Credito USA",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://academiacreditousa.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://academiacreditousa.com"}/logo-acu.png`,
  description:
    "Plataforma líder en educación financiera y crédito para la comunidad hispana en Estados Unidos.",
  sameAs: ["https://instagram.com/academiacreditousa"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contacto@academiacreditousa.com",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${dmSans.variable} antialiased text-foreground bg-background`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-accent focus:text-[#0B1F3A] focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm"
        >
          Saltar al contenido principal
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
