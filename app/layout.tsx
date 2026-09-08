import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anaspastryshop.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ana's Pastry Shop | Workshops de Pastelería & Panadería Profesional",
    template: "%s | Ana's Pastry Shop",
  },
  description:
    "Fórmate en el arte de la pastelería y repostería profesional en Ana's Pastry Shop con la Chef Anais Flores. Workshops presenciales intensivos de 8 horas y cursos online desde cero.",
  keywords: [
    "talleres de pastelería",
    "cursos de repostería presenciales",
    "Ana's Pastry Shop",
    "Anais Flores pastelera",
    "decoración de pasteles",
    "panadería profesional",
    "workshops repostería",
    "aprender pastelería desde cero",
  ],
  authors: [{ name: "Anais Flores · Ana's Pastry Shop" }],
  creator: "Ana's Pastry Shop",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "Ana's Pastry Shop",
    title: "Ana's Pastry Shop | Workshops de Pastelería & Panadería Profesional",
    description:
      "Fórmate en pastelería y repostería profesional con la Chef Anais Flores. Workshops presenciales intensivos y cursos online desde cero.",
    images: [
      {
        url: "/logo-anas-pastry-shop.png",
        width: 1080,
        height: 1080,
        alt: "Ana's Pastry Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ana's Pastry Shop | Workshops de Pastelería Profesional",
    description: "Workshops presenciales de pastelería, panadería y técnicas modernas con Anais Flores.",
    images: ["/logo-anas-pastry-shop.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo-anas-pastry-shop.png",
    shortcut: "/logo-anas-pastry-shop.png",
    apple: "/logo-anas-pastry-shop.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Ana's Pastry Shop",
  url: siteUrl,
  logo: `${siteUrl}/logo-anas-pastry-shop.png`,
  description:
    "Talleres presenciales y formación en pastelería y panadería profesional en Ana's Pastry Shop con Anais Flores.",
  sameAs: ["https://instagram.com/anaspastryshop"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contacto@anaspastryshop.com",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} ${serifFont.variable} antialiased bg-background text-foreground transition-colors duration-300 font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
