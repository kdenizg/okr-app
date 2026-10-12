"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../lib/db";

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

export async function createObjective(fd: FormData) {
  const title = str(fd, "title");
  if (!title) throw new Error("Başlık gerekli");
  const objective = await db.objective.create({
    data: { title, description: str(fd, "description") || null, period: str(fd, "period") },
  });
  redirect(`/objectives/${objective.id}`);
}

export async function updateObjective(fd: FormData) {
  const id = str(fd, "id");
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
  await db.objective.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/");
  redirect("/");
}

export async function createKeyResult(fd: FormData) {
  const objectiveId = str(fd, "objectiveId");
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
  const kr = await db.keyResult.delete({ where: { id: str(fd, "id") } });
  revalidatePath(`/objectives/${kr.objectiveId}`);
  revalidatePath("/");
}

/** İlerleme güncellemesi: değeri kaydeder ve geçmişe check-in ekler. */
export async function checkIn(fd: FormData) {
  const keyResultId = str(fd, "keyResultId");
  const value = num(fd, "value");
  const note = str(fd, "note") || null;
  const [, kr] = await db.$transaction([
    db.checkIn.create({ data: { keyResultId, value, note } }),
    db.keyResult.update({ where: { id: keyResultId }, data: { currentValue: value } }),
  ]);
  revalidatePath(`/objectives/${kr.objectiveId}`);
  revalidatePath("/");
}
