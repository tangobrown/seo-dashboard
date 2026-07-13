import { healthClass } from "@/lib/format";

export function HealthBar({
  score,
  width = 120,
  large = false,
  showLabel = true,
}: {
  score: number | null | undefined;
  width?: number;
  large?: boolean;
  showLabel?: boolean;
}) {
  const s = score ?? null;
  return (
    <span className="split">
      <span className={`health-bar${large ? " lg" : ""}`} style={{ width }}>
        <span
          className={`health-bar-fill ${healthClass(s)}`}
          style={{ width: `${s ?? 0}%` }}
        />
      </span>
      {showLabel && (
        <span className="tiny muted" style={{ minWidth: 32 }}>
          {s === null ? "—" : `${s}%`}
        </span>
      )}
    </span>
  );
}
