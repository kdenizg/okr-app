import type { NextAuthConfig } from "next-auth";

// Middleware'de de çalışan, veritabanına dokunmayan ayarlar.
export const authConfig = {
  pages: { signIn: "/login" },
  trustHost: true, // Vercel ve yerel `npm start` için
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user || request.nextUrl.pathname.startsWith("/login");
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
} satisfies NextAuthConfig;
