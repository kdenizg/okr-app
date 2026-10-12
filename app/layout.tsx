import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "../auth";
import { logout } from "./auth-actions";
import "./globals.css";

export const metadata: Metadata = { title: "OKR", description: "Hedefler ve anahtar sonuçlar" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  return (
    <html lang="tr">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">OKR</Link>
          {user && (
            <div className="topbar-right">
              <span className="muted user">{user.name || user.email}</span>
              <form action={logout}><button className="link" type="submit">Çıkış</button></form>
              <Link href="/objectives/new" className="btn">+ Yeni hedef</Link>
            </div>
          )}
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
