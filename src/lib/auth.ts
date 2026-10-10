import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
   adapter: PrismaAdapter(prisma),
   session: { strategy: "jwt" },
   secret: process.env.AUTH_SECRET,
   providers: [
      Google({
         clientId: process.env.AUTH_GOOGLE_CLIENT,
         clientSecret: process.env.AUTH_GOOGLE_SECRET,
         allowDangerousEmailAccountLinking: true,
      }),
      Credentials({
         name: "credentials",
         credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
         },
         authorize: async (credentials) => {
            if (!credentials?.email || !credentials?.password) return null;

            const email = String(credentials.email).trim().toLowerCase();
            const user = await prisma.user.findUnique({
               where: { email },
            });

            if (!user || !user.password || user.disabledAt) return null;

            const isValid = await bcrypt.compare(
               credentials.password as string,
               user.password,
            );
            if (!isValid) return null;

            return {
               id: user.id,
               email: user.email,
               name: (user.name ?? "Unnamed").trim(),
               role: user.role,
            };
         },
      }),
   ],
   callbacks: {
      async signIn({ user }) {
         if (!user.id) return false;

         const account = await prisma.user.findUnique({
            where: { id: user.id },
            select: { disabledAt: true },
         });

         return !account?.disabledAt;
      },
      async jwt({ token, user }) {
         if (user) {
            token.id = user.id as string;
            token.role = user.role;
         }

         return token;
      },
      async session({ session, token }) {
         if (session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role;
         }
         return session;
      },
   },
   pages: {
      signIn: "/signin",
   },
});
