import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "./lib/db";

/** Google ile giriş yalnızca AUTH_GOOGLE_ID ve AUTH_GOOGLE_SECRET tanımlıysa açılır. */
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        const email = String(c?.email ?? "").trim().toLowerCase();
        const password = String(c?.password ?? "");
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn({ account, profile }) {
      if (account?.provider === "google") return profile?.email_verified === true;
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const email = user.email.toLowerCase();
        const dbUser = await db.user.upsert({ where: { email }, update: {}, create: { email, name: user.name } });
        token.uid = dbUser.id;
      } else if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
  },
});
