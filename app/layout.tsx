import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "OKR", description: "Hedefler ve anahtar sonuçlar" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">OKR</Link>
          <Link href="/objectives/new" className="btn">+ Yeni hedef</Link>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
