// middleware.ts
import { auth } from "@/lib/auth"; // Ajusta la ruta según donde dejaste el archivo
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Si intenta entrar al dashboard sin estar logueado
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // Protección específica para ADMIN (Validación de Pagos)
  if (nextUrl.pathname.startsWith("/dashboard/pagos") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"], // Protege todo lo que empiece por /dashboard
};