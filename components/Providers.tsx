"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SessionProvider>
        <CartProvider>
          <LazyMotion features={domAnimation} strict>
            {children}
          </LazyMotion>
          <CartDrawer />
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
