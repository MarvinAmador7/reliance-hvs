import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Sparkline } from "@/components/charts/sparkline";

interface StatTileProps {
  delta: string;
  label: string;
  trend: readonly number[];
  up: boolean;
  /** Whether "up" is a good direction for this metric. */
  upIsGood?: boolean;
  value: string;
}

export function StatTile({
  label,
  value,
  delta,
  up,
  trend,
  upIsGood = true,
}: StatTileProps) {
  const good = up === upIsGood;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="panel flex items-end justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="c-label">{label}</div>
        <div className="mt-1 font-semibold text-[1.625rem] text-ink leading-none tracking-[-0.02em]">
          {value}
        </div>
        <div
          className={`mt-2 inline-flex items-center gap-0.5 text-xs ${
            good ? "text-[oklch(0.42_0.14_145)]" : "text-bad"
          }`}
        >
          <Icon aria-hidden="true" className="size-3.5" />
          <span className="tabular font-medium">{delta}</span>
          <span className="ml-1 text-ink-muted">vs prior 30 days</span>
        </div>
      </div>
      <Sparkline data={trend} />
    </div>
  );
}
