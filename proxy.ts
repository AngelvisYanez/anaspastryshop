// proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname;

  // Auth.js can replace its request origin with AUTH_URL. Preserve the visitor's origin.
  const protect = auth((req, _event: NextFetchEvent) => {
    if (!req.auth && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/iniciar-sesion", request.url));
    }

    if ((path.startsWith("/dashboard/pagos") || path.startsWith("/dashboard/api-config")) &&
        req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  });
  return protect(request, event);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
