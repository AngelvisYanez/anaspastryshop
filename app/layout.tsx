import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academia Credito USA | Domina el Crédito en Estados Unidos",
  description: "Academia Credito USA — La plataforma líder en educación financiera y crédito en Estados Unidos para hispanohablantes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${jakarta.className} antialiased text-foreground bg-background`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
