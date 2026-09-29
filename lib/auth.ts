import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/** Avatars as data URLs blow past Node/Next header limits (HTTP 431). Only keep short http(s)/path URLs in the JWT cookie. */
const MAX_SESSION_IMAGE_LEN = 512;

function sessionSafeImage(image: string | null | undefined): string | null {
  if (!image) return null;
  if (image.startsWith("data:")) return null;
  if (image.length > MAX_SESSION_IMAGE_LEN) return null;
  return image;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email o usuario", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const identifier = (credentials.email as string).trim().toLowerCase();
          const user = identifier.includes("@")
            ? await prisma.user.findUnique({ where: { email: identifier } })
            : await prisma.user.findFirst({
                where: { name: { equals: credentials.email as string, mode: "insensitive" } },
              });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) return null;

          if (!user.isActive) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isApproved: user.isApproved,
            isActive: user.isActive,
            image: sessionSafeImage(user.image),
          };
        } catch (error) {
          console.error("[auth] authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isApproved = (user as any).isApproved;
        token.isActive = (user as any).isActive;
        token.picture = sessionSafeImage(user.image) ?? undefined;
      }

      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        if ("image" in session) {
          token.picture = sessionSafeImage(session.image as string | null) ?? undefined;
        }
      }

      // Drop oversized legacy pictures already sitting in existing cookies.
      if (typeof token.picture === "string") {
        token.picture = sessionSafeImage(token.picture) ?? undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = (token.id || token.sub) as string;
        session.user.image = sessionSafeImage(token.picture as string | undefined);
        (session.user as any).isApproved = token.isApproved as boolean;
        (session.user as any).isActive = token.isActive as boolean;
        (session.user as any).deactivationReason = token.deactivationReason as string | null;
      }
      return session;
    },
  },
});
