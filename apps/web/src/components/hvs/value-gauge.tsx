import { fmtMoney } from "@/lib/mock-data";

interface ValueGaugeProps {
  high: number;
  inverted?: boolean;
  low: number;
  value: number;
}

/** Estimate marker on a low-to-high range. */
export function ValueGauge({
  low,
  high,
  value,
  inverted = false,
}: ValueGaugeProps) {
  const pct = ((value - low) / (high - low)) * 100;
  const track = inverted ? "bg-canvas/20" : "bg-surface";
  const ink = inverted ? "text-canvas/70" : "text-ink-muted";
  return (
    <div className="w-full">
      <div className={`relative h-2 rounded-full ${track}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: inverted ? "var(--c-brand-ink)" : "var(--c-brand)",
            opacity: inverted ? 0.35 : 0.3,
            width: `${pct}%`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-canvas"
          style={{ background: "var(--c-brand)", left: `${pct}%` }}
        />
      </div>
      <div className={`tabular mt-2 flex justify-between text-sm ${ink}`}>
        <span>{fmtMoney(low, true)}</span>
        <span>{fmtMoney(high, true)}</span>
      </div>
    </div>
  );
}
