"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "../auth";
import { db } from "../lib/db";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

async function signInWithPassword(email: string, password: string, errorUrl: string) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (e) {
    if (e instanceof AuthError) redirect(errorUrl);
    throw e; // başarılı girişteki yönlendirme de bir "hata" olarak gelir
  }
}

export async function login(fd: FormData) {
  await signInWithPassword(str(fd, "email").toLowerCase(), String(fd.get("password") ?? ""), "/login?error=credentials");
}

export async function register(fd: FormData) {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const name = str(fd, "name") || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/login?mode=register&error=email");
  if (password.length < 8) redirect("/login?mode=register&error=password");
  if (await db.user.findUnique({ where: { email } })) redirect("/login?mode=register&error=exists");
  await db.user.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 10) } });
  await signInWithPassword(email, password, "/login?error=credentials");
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
