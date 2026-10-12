import { createObjective } from "../../actions";
import { PeriodSelect } from "../../components";
import { currentPeriod, periodOptions } from "../../../lib/okr";
import { requireUserId } from "../../../lib/session";

export default async function NewObjective({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireUserId();
  const sp = await searchParams;
  return (
    <>
      <h1>Yeni hedef</h1>
      <form action={createObjective} className="form">
        <label>Hedef (Objective)
          <input name="title" required placeholder="ör. Müşteri memnuniyetini belirgin şekilde artırmak" autoFocus />
        </label>
        <label>Açıklama <span className="muted">(isteğe bağlı)</span>
          <textarea name="description" rows={3} placeholder="Neden önemli?" />
        </label>
        <label>Dönem
          <PeriodSelect name="period" defaultValue={sp.period || currentPeriod()} options={periodOptions()} />
        </label>
        <button className="btn" type="submit">Oluştur ve anahtar sonuç ekle</button>
      </form>
    </>
  );
}
