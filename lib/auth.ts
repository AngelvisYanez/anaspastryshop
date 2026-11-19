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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isApproved = (user as any).isApproved;
        token.isActive = (user as any).isActive;
        token.picture = sessionSafeImage(user.image) ?? undefined;
      }

      const userId = token.id || token.sub;
      if (!user && typeof userId === "string") {
        const profile = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true, image: true, role: true, isApproved: true, isActive: true, deactivationReason: true },
        });
        if (!profile) return null;
        token.name = profile.name;
        token.email = profile.email;
        token.picture = sessionSafeImage(profile.image) ?? undefined;
        token.role = profile.isActive ? profile.role : "USER";
        token.isApproved = profile.isApproved;
        token.isActive = profile.isActive;
        token.deactivationReason = profile.deactivationReason;
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
