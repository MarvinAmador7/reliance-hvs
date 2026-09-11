import { useId, useRef, useState } from "react";

import { useWidth } from "./use-size";

export interface LineSeries {
  color: string;
  data: readonly number[];
  name: string;
}

interface LineChartProps {
  area?: boolean;
  formatTooltip?: (n: number) => string;
  formatY?: (n: number) => string;
  height?: number;
  labelEvery?: number;
  labels: readonly string[];
  series: readonly LineSeries[];
  yTicks?: number;
}

const MARGIN = { bottom: 28, left: 48, right: 16, top: 16 };
const TICKS = 4;

/** Rounds a raw tick size up to 1, 2, 2.5, or 5 times a power of ten. */
const niceTick = (raw: number): number => {
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate >= n) ?? 10;
  return step * pow;
};

const niceMin = (min: number, max: number): number => {
  if (min <= 0) {
    return 0;
  }
  const floor = min - (max - min) * 0.35;
  if (floor <= 0) {
    return 0;
  }
  const pow = 10 ** Math.floor(Math.log10(floor));
  return Math.floor(floor / pow) * pow;
};

export function LineChart({
  series,
  labels,
  height = 240,
  formatY = (n) => n.toLocaleString("en-US"),
  formatTooltip,
  area = false,
  yTicks = TICKS,
  labelEvery,
}: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();

  const all = series.flatMap((s) => s.data);
  const rawMax = Math.max(...all);
  const rawMin = Math.min(...all);
  const yMin = niceMin(rawMin, rawMax);
  const tick = niceTick((rawMax - yMin) / yTicks);
  const yMax = yMin + tick * yTicks;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const count = labels.length;
  const x = (i: number) => MARGIN.left + (i / (count - 1)) * innerW;
  const y = (v: number) =>
    MARGIN.top + (1 - (v - yMin) / (yMax - yMin || 1)) * innerH;
  const every =
    labelEvery ?? Math.max(1, Math.ceil(count / Math.floor(innerW / 64)));
  const tipFormat = formatTooltip ?? formatY;
  const showLabel = (i: number) =>
    i === count - 1 || (i % every === 0 && count - 1 - i >= every / 2);

  const onMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left - MARGIN.left;
    const idx = Math.round((px / innerW) * (count - 1));
    setHover(Math.max(0, Math.min(count - 1, idx)));
  };

  const hoverRows =
    hover === null
      ? []
      : series.map((s) => ({
          color: s.color,
          name: s.name,
          value: s.data[hover] ?? 0,
        }));
  const tipX = hover === null ? 0 : x(hover);
  const tipLeft = tipX > width * 0.6;

  return (
    <div className="relative" ref={ref}>
      {series.length > 1 ? (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {series.map((s) => (
            <li className="flex items-center gap-2" key={s.name}>
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-4 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-ink-muted">{s.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: pointer hover only reveals a tooltip; the title carries the data */}
      <svg
        aria-labelledby={`${id}-title`}
        className="block w-full overflow-visible"
        height={height}
        onMouseLeave={() => setHover(null)}
        onMouseMove={onMove}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        <title id={`${id}-title`}>
          {series
            .map(
              (s) => `${s.name}: ${s.data.map((v) => formatY(v)).join(", ")}`
            )
            .join(". ")}
        </title>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = yMin + ((yMax - yMin) * i) / yTicks;
          return (
            <g key={v}>
              <line
                stroke="var(--c-line)"
                strokeWidth="1"
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(v)}
                y2={y(v)}
              />
              <text
                className="fill-ink-muted"
                fontSize="11"
                textAnchor="end"
                x={MARGIN.left - 8}
                y={y(v) + 4}
              >
                {formatY(v)}
              </text>
            </g>
          );
        })}
        {labels.map((label, i) =>
          showLabel(i) ? (
            <text
              className="fill-ink-muted"
              fontSize="11"
              key={label}
              textAnchor="middle"
              x={x(i)}
              y={height - 8}
            >
              {label}
            </text>
          ) : null
        )}
        {series.map((s) => {
          const d = s.data
            .map(
              (v, i) =>
                `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`
            )
            .join(" ");
          const last = s.data.length - 1;
          return (
            <g key={s.name}>
              {area ? (
                <path
                  d={`${d} L${x(last).toFixed(1)} ${y(yMin).toFixed(1)} L${x(0).toFixed(1)} ${y(yMin).toFixed(1)} Z`}
                  fill={s.color}
                  opacity="0.1"
                />
              ) : null}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <circle
                cx={x(last)}
                cy={y(s.data[last] ?? 0)}
                fill={s.color}
                r="4"
                stroke="var(--c-bg)"
                strokeWidth="2"
              />
            </g>
          );
        })}
        {hover === null ? null : (
          <g>
            <line
              stroke="var(--c-ink)"
              strokeOpacity="0.25"
              strokeWidth="1"
              x1={tipX}
              x2={tipX}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
            />
            {series.map((s) => (
              <circle
                cx={tipX}
                cy={y(s.data[hover] ?? 0)}
                fill={s.color}
                key={s.name}
                r="4.5"
                stroke="var(--c-bg)"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>
      {hover === null ? null : (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-lg bg-ink px-3 py-2 text-canvas text-xs shadow-float"
          style={tipLeft ? { right: width - tipX + 12 } : { left: tipX + 12 }}
        >
          <div className="mb-1 font-medium opacity-70">{labels[hover]}</div>
          {hoverRows.map((r) => (
            <div
              className="flex items-center justify-between gap-4"
              key={r.name}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: r.color }}
                />
                {r.name}
              </span>
              <span className="tabular font-medium">{tipFormat(r.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
