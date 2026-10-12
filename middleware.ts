import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Giriş yapmamış kullanıcıları /login sayfasına yönlendirir.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
