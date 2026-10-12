export type KRLike = { startValue: number; targetValue: number; currentValue: number };

/** Anahtar sonucun ilerlemesi, 0–1 arası. Hedef düşüşse (ör. churn) de çalışır. */
export function krProgress(kr: KRLike): number {
  const span = kr.targetValue - kr.startValue;
  if (span === 0) return kr.currentValue === kr.targetValue ? 1 : 0;
  return clamp((kr.currentValue - kr.startValue) / span);
}

/** Hedefin ilerlemesi: anahtar sonuçların ortalaması. */
export function objectiveProgress(krs: KRLike[]): number {
  if (krs.length === 0) return 0;
  return krs.reduce((sum, kr) => sum + krProgress(kr), 0) / krs.length;
}

export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

/** "2026-Q4" gibi bir dönemin ne kadarının geçtiği, 0–1 arası. */
export function periodElapsed(period: string, now = new Date()): number | null {
  const m = /^(\d{4})-Q([1-4])$/.exec(period);
  if (!m) return null;
  const year = Number(m[1]);
  const q = Number(m[2]);
  const start = new Date(year, (q - 1) * 3, 1).getTime();
  const end = new Date(year, q * 3, 1).getTime();
  return clamp((now.getTime() - start) / (end - start));
}

export type Status = "done" | "on-track" | "at-risk" | "behind" | "none";

/** İlerlemeyi dönemin geçen kısmıyla karşılaştırarak durum belirler. */
export function status(progress: number, period: string, hasKRs = true): Status {
  if (!hasKRs) return "none";
  if (progress >= 1) return "done";
  const elapsed = periodElapsed(period);
  if (elapsed === null || elapsed < 0.1) return "on-track";
  const ratio = progress / elapsed;
  if (ratio >= 0.9) return "on-track";
  if (ratio >= 0.6) return "at-risk";
  return "behind";
}

export const statusLabel: Record<Status, string> = {
  done: "Tamamlandı",
  "on-track": "Yolunda",
  "at-risk": "Risk altında",
  behind: "Geride",
  none: "Anahtar sonuç yok",
};

export function pct(n: number): string {
  return `%${Math.round(n * 100)}`;
}

export function periodOptions(now = new Date()): string[] {
  const out: string[] = [];
  const y = now.getFullYear();
  for (const year of [y - 1, y, y + 1]) for (let q = 1; q <= 4; q++) out.push(`${year}-Q${q}`);
  return out;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}
