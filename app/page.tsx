import Link from "next/link";
import { db } from "../lib/db";
import { currentPeriod, objectiveProgress, pct, periodElapsed, status, type Status } from "../lib/okr";
import { ProgressBar, StatusBadge } from "./components";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sp = await searchParams;
  const period = sp.period || currentPeriod();

  const [objectives, periodsRaw] = await Promise.all([
    db.objective.findMany({ where: { period }, include: { keyResults: true }, orderBy: { createdAt: "asc" } }),
    db.objective.findMany({ select: { period: true }, distinct: ["period"] }),
  ]);
  const periods = Array.from(new Set([currentPeriod(), period, ...periodsRaw.map((p) => p.period)])).sort().reverse();

  const rows = objectives.map((o) => {
    const progress = objectiveProgress(o.keyResults);
    return { ...o, progress, status: status(progress, o.period, o.keyResults.length > 0) };
  });
  const overall = rows.length ? rows.reduce((s, r) => s + r.progress, 0) / rows.length : 0;
  const elapsed = periodElapsed(period);
  const count = (s: Status) => rows.filter((r) => r.status === s).length;

  return (
    <>
      <div className="page-head">
        <h1>Gösterge paneli</h1>
        <nav className="periods">
          {periods.map((p) => (
            <Link key={p} href={`/?period=${p}`} className={p === period ? "chip active" : "chip"}>{p}</Link>
          ))}
        </nav>
      </div>

      <section className="stats">
        <div className="stat">
          <div className="stat-label">Genel ilerleme</div>
          <div className="stat-value">{pct(overall)}</div>
          {elapsed !== null && <div className="stat-sub">Geçen süre: dönemin {pct(elapsed)}</div>}
        </div>
        <div className="stat"><div className="stat-label">Hedef</div><div className="stat-value">{rows.length}</div></div>
        <div className="stat"><div className="stat-label">Yolunda / Tamamlandı</div><div className="stat-value">{count("on-track") + count("done")}</div></div>
        <div className="stat"><div className="stat-label">Risk altında</div><div className="stat-value warn">{count("at-risk")}</div></div>
        <div className="stat"><div className="stat-label">Geride</div><div className="stat-value bad">{count("behind")}</div></div>
      </section>

      {rows.length === 0 ? (
        <div className="empty">
          <p>{period} dönemi için henüz hedef yok.</p>
          <Link href={`/objectives/new?period=${period}`} className="btn">İlk hedefi ekle</Link>
        </div>
      ) : (
        <ul className="list">
          {rows.map((o) => (
            <li key={o.id} className="card">
              <Link href={`/objectives/${o.id}`} className="card-link">
                <div className="row">
                  <h2>{o.title}</h2>
                  <StatusBadge status={o.status} />
                </div>
                <div className="row">
                  <ProgressBar value={o.progress} status={o.status} />
                  <span className="pct">{pct(o.progress)}</span>
                </div>
                <div className="muted">{o.keyResults.length} anahtar sonuç</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
