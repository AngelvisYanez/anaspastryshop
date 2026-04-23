"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SessionProvider refetchInterval={5}>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </SessionProvider>
    </ThemeProvider>
  );
}
