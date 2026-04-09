// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Usamos JWT para manejar roles fácilmente
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // Validamos la contraseña (recuerda usar bcrypt en el registro)
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        if (!user.isActive) {
          throw new Error("UserSuspended");
        }

        if (user.role === "MENTOR" && !user.isApproved) {
          throw new Error("MentorPendingApproval");
        }

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          isApproved: user.isApproved, 
          isActive: user.isActive,
          image: user.image 
        };
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

      // Si se dispara un update manual de la sesión
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        // NO guardamos la imagen en el token para evitar el error 431 (Header too large)
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
        // session.user.image se deja vacío para evitar cookies gigantes
      }
      return session;
    },
  },
});