import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Articademy | Formación Digital",
  description: "Articademy — Academia de 4101 Media & Artica Group en toda Latinoamérica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${jakarta.className} antialiased text-[#1A1A2E]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

