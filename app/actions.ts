"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../lib/db";
import { requireUserId } from "../lib/session";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function num(fd: FormData, key: string, fallback?: number): number {
  const raw = str(fd, key).replace(",", ".");
  if (raw === "" && fallback !== undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`Geçersiz sayı: ${key}`);
  return n;
}

/** Hedef giriş yapmış kullanıcıya ait değilse hata verir. */
async function ownedObjectiveId(id: string, ownerId: string): Promise<string> {
  const o = await db.objective.findFirst({ where: { id, ownerId }, select: { id: true } });
  if (!o) throw new Error("Hedef bulunamadı");
  return o.id;
}

async function ownedKeyResultId(id: string, ownerId: string): Promise<string> {
  const kr = await db.keyResult.findFirst({ where: { id, objective: { ownerId } }, select: { id: true } });
  if (!kr) throw new Error("Anahtar sonuç bulunamadı");
  return kr.id;
}

export async function createObjective(fd: FormData) {
  const ownerId = await requireUserId();
  const title = str(fd, "title");
  if (!title) throw new Error("Başlık gerekli");
  const objective = await db.objective.create({
    data: { ownerId, title, description: str(fd, "description") || null, period: str(fd, "period") },
  });
  redirect(`/objectives/${objective.id}`);
}

export async function updateObjective(fd: FormData) {
  const id = await ownedObjectiveId(str(fd, "id"), await requireUserId());
  const title = str(fd, "title");
  if (!title) throw new Error("Başlık gerekli");
  await db.objective.update({
    where: { id },
    data: { title, description: str(fd, "description") || null, period: str(fd, "period") },
  });
  revalidatePath(`/objectives/${id}`);
  revalidatePath("/");
}

export async function deleteObjective(fd: FormData) {
  const id = await ownedObjectiveId(str(fd, "id"), await requireUserId());
  await db.objective.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}

export async function createKeyResult(fd: FormData) {
  const objectiveId = await ownedObjectiveId(str(fd, "objectiveId"), await requireUserId());
  const title = str(fd, "title");
  if (!title) throw new Error("Başlık gerekli");
  const startValue = num(fd, "startValue", 0);
  await db.keyResult.create({
    data: {
      objectiveId,
      title,
      startValue,
      currentValue: startValue,
      targetValue: num(fd, "targetValue"),
      unit: str(fd, "unit") || null,
    },
  });
  revalidatePath(`/objectives/${objectiveId}`);
  revalidatePath("/");
}

export async function deleteKeyResult(fd: FormData) {
  const id = await ownedKeyResultId(str(fd, "id"), await requireUserId());
  const kr = await db.keyResult.delete({ where: { id } });
  revalidatePath(`/objectives/${kr.objectiveId}`);
  revalidatePath("/");
}

/** İlerleme güncellemesi: değeri kaydeder ve geçmişe check-in ekler. */
export async function checkIn(fd: FormData) {
  const keyResultId = await ownedKeyResultId(str(fd, "keyResultId"), await requireUserId());
  const value = num(fd, "value");
  const note = str(fd, "note") || null;
  const [, kr] = await db.$transaction([
    db.checkIn.create({ data: { keyResultId, value, note } }),
    db.keyResult.update({ where: { id: keyResultId }, data: { currentValue: value } }),
  ]);
  revalidatePath(`/objectives/${kr.objectiveId}`);
  revalidatePath("/");
}
