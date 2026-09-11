import { fmtMoney } from "@/lib/mock-data";

interface Source {
  high: number;
  id: string;
  logo: string;
  low: number;
  name: string;
  value: number;
}

interface AgreementChartProps {
  sources: readonly Source[];
}

const COLS = "grid-cols-[4.5rem_1fr_4rem] @xl:grid-cols-[7rem_1fr_6rem]";

/**
 * Interval plot: each source's range as a band with a dot at its estimate,
 * and the overlap of all ranges shaded as a column across every row.
 */
export function AgreementChart({ sources }: AgreementChartProps) {
  const min = Math.min(...sources.map((s) => s.low));
  const max = Math.max(...sources.map((s) => s.high));
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const overlapLow = Math.max(...sources.map((s) => s.low));
  const overlapHigh = Math.min(...sources.map((s) => s.high));
  const mid = min + (max - min) / 2;
  const money = (n: number) => fmtMoney(n, true);

  return (
    <div>
      <div className="relative">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 grid ${COLS}`}
        >
          <div />
          <div className="relative">
            <span
              className="absolute inset-y-0 rounded-lg bg-brand/10"
              style={{
                left: `${pct(overlapLow)}%`,
                width: `${pct(overlapHigh) - pct(overlapLow)}%`,
              }}
            />
          </div>
          <div />
        </div>

        <ol className="relative">
          {sources.map((s) => (
            <li className={`grid h-12 items-center gap-x-3 ${COLS}`} key={s.id}>
              <img
                alt={s.name}
                className="h-6 w-auto max-w-full mix-blend-multiply"
                height={24}
                src={s.logo}
                width={75}
              />
              <div className="relative h-full">
                <span
                  className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-ink/12"
                  style={{
                    left: `${pct(s.low)}%`,
                    width: `${pct(s.high) - pct(s.low)}%`,
                  }}
                  title={`${s.name}: ${fmtMoney(s.low)} to ${fmtMoney(s.high)}`}
                />
                <span
                  className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-canvas"
                  style={{ left: `${pct(s.value)}%` }}
                  title={`${s.name}: ${fmtMoney(s.value)}`}
                />
              </div>
              <span className="tabular text-right text-ink text-sm">
                {money(s.value)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className={`grid gap-x-3 ${COLS}`}>
        <div />
        <div className="relative mt-2 h-5 border-line border-t">
          {[
            { align: "", v: min },
            { align: "hidden @xl:block -translate-x-1/2", v: mid },
            { align: "-translate-x-full", v: max },
          ].map(({ v, align }) => (
            <span
              className={`tabular absolute top-1 text-ink-muted text-xs ${align}`}
              key={v}
              style={{ left: `${pct(v)}%` }}
            >
              {money(v)}
            </span>
          ))}
        </div>
        <div />
      </div>

      <p className="mt-3 text-ink-muted text-sm">
        <span
          aria-hidden="true"
          className="mr-1.5 inline-block size-2.5 translate-y-px rounded-sm bg-brand/25"
        />
        Shaded column: where all three ranges overlap.
      </p>
    </div>
  );
}
