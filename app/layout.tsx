import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import JsonLd from "@/components/JsonLd";
import {
  buildOrganizationJsonLd,
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  GEO,
  getSiteUrl,
  SITE_KEYWORDS,
  SITE_NAME,
} from "@/lib/seo";

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

const siteUrl = getSiteUrl();

let metadataBase: URL;
try {
  metadataBase = new URL(siteUrl);
} catch {
  metadataBase = new URL("https://anaspastryshop.com");
}

const pageDefaults = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  keywords: SITE_KEYWORDS,
});

export const metadata: Metadata = {
  metadataBase,
  ...pageDefaults,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  authors: [{ name: "Anais Flores · Ana's Pastry Shop", url: `${siteUrl}/nosotros` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  applicationName: SITE_NAME,
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-VE" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content={GEO.regionMeta} />
        <meta name="geo.placename" content={GEO.placename} />
        <meta name="geo.position" content={`${GEO.latitude};${GEO.longitude}`} />
        <meta name="ICBM" content={`${GEO.latitude}, ${GEO.longitude}`} />
        <JsonLd data={buildOrganizationJsonLd()} />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} ${serifFont.variable} antialiased bg-background text-foreground transition-colors duration-300 font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
