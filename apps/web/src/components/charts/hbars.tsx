interface Row {
  label: string;
  /** Marks the row that describes this home; drawn in the brand color while the rest recede. */
  match?: boolean;
  note?: string;
  value: number;
}

interface HBarsProps {
  color?: string;
  dense?: boolean;
  /** Emphasize the last row. */
  emphasizeLast?: boolean;
  /** Emphasize rows flagged `match`; the rest are drawn in gray. */
  emphasizeMatch?: boolean;
  format?: (n: number) => string;
  rows: readonly Row[];
  /** Show each row as a share of the first row (funnel style). */
  share?: boolean;
}

const RECEDE = "oklch(0.86 0 0)";

const emphasisFor = ({
  emphasizeLast,
  emphasizeMatch,
  last,
  match,
}: {
  emphasizeLast: boolean;
  emphasizeMatch: boolean;
  last: boolean;
  match: boolean;
}) => ({
  dimLast: emphasizeLast && !last,
  isMatch: match,
  recede: emphasizeMatch && !match,
  strong: (emphasizeLast && last) || (emphasizeMatch && match),
});

export function HBars({
  rows,
  format = (n) => n.toLocaleString("en-US"),
  color = "var(--c-brand)",
  share = false,
  emphasizeLast = false,
  emphasizeMatch = false,
  dense = false,
}: HBarsProps) {
  const max = Math.max(...rows.map((r) => r.value));
  const first = rows[0]?.value ?? 1;

  return (
    <ol className={dense ? "space-y-2.5" : "space-y-4"}>
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100;
        const last = i === rows.length - 1;
        const { strong, dimLast, recede, isMatch } = emphasisFor({
          emphasizeLast,
          emphasizeMatch,
          last,
          match: row.match === true,
        });
        return (
          <li
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5"
            key={row.label}
          >
            <span className={strong ? "font-semibold text-ink" : "text-ink"}>
              {row.label}
              {row.note ? (
                <span className="ml-2 text-ink-muted text-sm">{row.note}</span>
              ) : null}
              {emphasizeMatch && isMatch ? (
                <span className="chip chip-brand ml-2 h-6 align-middle text-xs">
                  Your home
                </span>
              ) : null}
            </span>
            <span className="tabular text-right text-sm">
              <span
                className={
                  strong ? "font-semibold text-ink" : "font-medium text-ink"
                }
              >
                {format(row.value)}
              </span>
              {share && i > 0 ? (
                <span className="ml-2 text-ink-muted">
                  {Math.round((row.value / first) * 100)}%
                </span>
              ) : null}
            </span>
            <div
              className="col-span-2 h-2 overflow-hidden rounded-full bg-surface"
              title={`${row.label}: ${format(row.value)}`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  background: recede ? RECEDE : color,
                  opacity: dimLast ? 0.45 : 1,
                  width: `${pct}%`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
