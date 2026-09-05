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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://academiaomnia.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Academia Omnia | Aprende Herramientas Digitales en Español",
    template: "%s | Academia Omnia",
  },
  description:
    "La plataforma líder en educación digital en español. Aprende herramientas digitales, cursos prácticos y sesiones en vivo para dominar el mundo digital con una visión 360°.",
  keywords: [
    "cursos digitales español",
    "educación digital hispanos",
    "aprender herramientas digitales",
    "cursos online español",
    "formación digital",
    "academia digital",
  ],
  authors: [{ name: "Academia Omnia" }],
  creator: "Academia Omnia",
  openGraph: {
    type: "website",
    locale: "es_US",
    url: siteUrl,
    siteName: "Academia Omnia",
    title: "Academia Omnia | Aprende Herramientas Digitales en Español",
    description:
      "Aprende herramientas digitales, cursos prácticos y sesiones en vivo con una visión 360°. Formación en español para crecer sin fronteras.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Academia Omnia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia Omnia | Aprende Herramientas Digitales en Español",
    description: "Aprende herramientas digitales y cursos prácticos en español con Academia Omnia.",
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Academia Omnia",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://academiaomnia.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://academiaomnia.com"}/logo-acu.png`,
  description:
    "Plataforma líder en educación digital en español. Domina las herramientas del mundo digital con una visión 360°.",
  sameAs: ["https://instagram.com/academiaomnia"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contacto@academiaomnia.com",
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
