import { pct, statusLabel, type Status } from "../lib/okr";

export function ProgressBar({ value, status }: { value: number; status: Status }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`bar-fill s-${status}`} style={{ width: pct(value) }} />
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge s-${status}`}>{statusLabel[status]}</span>;
}

export function PeriodSelect({ name, defaultValue, options }: { name: string; defaultValue: string; options: string[] }) {
  return (
    <select name={name} defaultValue={defaultValue}>
      {options.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
