import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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

          const identifier = credentials.email as string;
          const user = identifier.includes("@")
            ? await prisma.user.findUnique({ where: { email: identifier } })
            : await prisma.user.findFirst({
                where: { name: { equals: identifier, mode: "insensitive" } },
              });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) return null;

          if (!user.isActive) return null;

          if (user.role === "MENTOR" && !user.isApproved) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isApproved: user.isApproved,
            isActive: user.isActive,
            image: user.image,
          };
        } catch {
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
      }

      if (trigger === "update" && session) {
        token.name = session.name || token.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = (token.id || token.sub) as string;
        (session.user as any).isApproved = token.isApproved as boolean;
        (session.user as any).isActive = token.isActive as boolean;
        (session.user as any).deactivationReason = token.deactivationReason as string | null;
      }
      return session;
    },
  },
});
