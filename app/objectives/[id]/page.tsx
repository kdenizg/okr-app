import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import { requireUserId } from "../../../lib/session";
import { krProgress, objectiveProgress, pct, periodElapsed, periodOptions, status } from "../../../lib/okr";
import { checkIn, createKeyResult, deleteKeyResult, deleteObjective, updateObjective } from "../../actions";
import { PeriodSelect, ProgressBar, StatusBadge } from "../../components";

export const dynamic = "force-dynamic";

function fmt(n: number, unit?: string | null) {
  const s = Number.isInteger(n) ? String(n) : n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  return unit ? `${s} ${unit}` : s;
}

export default async function ObjectivePage({ params }: { params: Promise<{ id: string }> }) {
  const ownerId = await requireUserId();
  const { id } = await params;
  const o = await db.objective.findFirst({
    where: { id, ownerId },
    include: {
      keyResults: {
        orderBy: { createdAt: "asc" },
        include: { checkIns: { orderBy: { createdAt: "desc" }, take: 5 } },
      },
    },
  });
  if (!o) notFound();

  const progress = objectiveProgress(o.keyResults);
  const st = status(progress, o.period, o.keyResults.length > 0);
  const elapsed = periodElapsed(o.period);

  return (
    <>
      <Link href={`/?period=${o.period}`} className="muted">← {o.period} panosu</Link>
      <div className="page-head">
        <h1>{o.title}</h1>
        <StatusBadge status={st} />
      </div>
      {o.description && <p className="desc">{o.description}</p>}
      <div className="row">
        <ProgressBar value={progress} status={st} />
        <span className="pct">{pct(progress)}</span>
      </div>
      {elapsed !== null && <p className="muted">Geçen süre: dönemin {pct(elapsed)}.</p>}

      <h2 className="section">Anahtar sonuçlar</h2>
      {o.keyResults.length === 0 && <p className="muted">Bu hedefi ölçmek için 2–5 anahtar sonuç ekleyin.</p>}
      <ul className="list">
        {o.keyResults.map((kr) => {
          const p = krProgress(kr);
          const krSt = status(p, o.period);
          return (
            <li key={kr.id} className="card">
              <div className="row">
                <h3>{kr.title}</h3>
                <form action={deleteKeyResult}>
                  <input type="hidden" name="id" value={kr.id} />
                  <button className="link danger" type="submit" title="Sil">Sil</button>
                </form>
              </div>
              <div className="row">
                <ProgressBar value={p} status={krSt} />
                <span className="pct">{pct(p)}</span>
              </div>
              <div className="muted">
                Başlangıç {fmt(kr.startValue, kr.unit)} · Şu an <strong>{fmt(kr.currentValue, kr.unit)}</strong> · Hedef {fmt(kr.targetValue, kr.unit)}
              </div>
              <form action={checkIn} className="inline-form">
                <input type="hidden" name="keyResultId" value={kr.id} />
                <input name="value" inputMode="decimal" required placeholder="Yeni değer" defaultValue={kr.currentValue} />
                <input name="note" placeholder="Not (isteğe bağlı)" />
                <button className="btn small" type="submit">Güncelle</button>
              </form>
              {kr.checkIns.length > 0 && (
                <details>
                  <summary className="muted">Son güncellemeler</summary>
                  <ul className="history">
                    {kr.checkIns.map((c) => (
                      <li key={c.id}>
                        <span>{c.createdAt.toLocaleDateString("tr-TR")}</span> <strong>{fmt(c.value, kr.unit)}</strong>
                        {c.note && <span className="muted"> — {c.note}</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ul>

      <form action={createKeyResult} className="form card">
        <h3>Anahtar sonuç ekle</h3>
        <input type="hidden" name="objectiveId" value={o.id} />
        <label>Anahtar sonuç
          <input name="title" required placeholder="ör. NPS skorunu 30'dan 50'ye çıkarmak" />
        </label>
        <div className="grid3">
          <label>Başlangıç<input name="startValue" inputMode="decimal" defaultValue="0" /></label>
          <label>Hedef<input name="targetValue" inputMode="decimal" required /></label>
          <label>Birim<input name="unit" placeholder="%, adet, TL…" /></label>
        </div>
        <button className="btn" type="submit">Ekle</button>
      </form>

      <details className="section">
        <summary>Hedefi düzenle</summary>
        <form action={updateObjective} className="form">
          <input type="hidden" name="id" value={o.id} />
          <label>Başlık<input name="title" required defaultValue={o.title} /></label>
          <label>Açıklama<textarea name="description" rows={3} defaultValue={o.description ?? ""} /></label>
          <label>Dönem<PeriodSelect name="period" defaultValue={o.period} options={periodOptions()} /></label>
          <button className="btn" type="submit">Kaydet</button>
        </form>
        <form action={deleteObjective}>
          <input type="hidden" name="id" value={o.id} />
          <button className="link danger" type="submit">Hedefi ve anahtar sonuçlarını sil</button>
        </form>
      </details>
    </>
  );
}
