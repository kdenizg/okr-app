import { redirect } from "next/navigation";
import { auth } from "../auth";
import { db } from "./db";

/** Giriş yapmış kullanıcının id'si; yoksa giriş sayfasına yönlendirir. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const user = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) redirect("/login");
  return id;
}
