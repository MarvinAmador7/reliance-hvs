import { useId, useRef, useState } from "react";

import { useWidth } from "./use-size";

interface ColumnChartProps {
  color?: string;
  data: readonly number[];
  format?: (n: number) => string;
  height?: number;
  labels: readonly string[];
  title: string;
}

const MARGIN = { bottom: 26, left: 8, right: 8, top: 22 };
const MAX_BAR = 24;
const RADIUS = 4;

const barPath = (x: number, y: number, w: number, h: number): string => {
  const r = Math.min(RADIUS, w / 2, h);
  return `M${x} ${y + h} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h} Z`;
};

export function ColumnChart({
  data,
  labels,
  height = 200,
  color = "var(--c-brand)",
  format = (n) => n.toLocaleString("en-US"),
  title,
}: ColumnChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();

  const max = Math.max(...data);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const slot = innerW / data.length;
  const barW = Math.min(MAX_BAR, slot * 0.55);
  const maxIndex = data.indexOf(max);
  const lastIndex = data.length - 1;
  const baseline = MARGIN.top + innerH;

  const onMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left - MARGIN.left;
    const idx = Math.floor(px / slot);
    setHover(idx >= 0 && idx < data.length ? idx : null);
  };

  return (
    <div ref={ref}>
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: pointer hover only highlights a bar; the title carries the data */}
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
          {title}: {data.map((v, i) => `${labels[i]} ${format(v)}`).join(", ")}
        </title>
        <line
          stroke="var(--c-line)"
          x1={MARGIN.left}
          x2={width - MARGIN.right}
          y1={baseline}
          y2={baseline}
        />
        {data.map((v, i) => {
          const h = (v / max) * innerH;
          const cx = MARGIN.left + slot * i + slot / 2;
          const x = cx - barW / 2;
          const y = baseline - h;
          const labeled = i === maxIndex || i === lastIndex || hover === i;
          const dimmed = hover !== null && hover !== i;
          return (
            <g key={labels[i]}>
              <path
                d={barPath(x, y, barW, h)}
                fill={color}
                opacity={dimmed ? 0.55 : 1}
              />
              {labeled ? (
                <text
                  className="fill-ink"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  x={cx}
                  y={y - 6}
                >
                  {format(v)}
                </text>
              ) : null}
              <text
                className="fill-ink-muted"
                fontSize="11"
                textAnchor="middle"
                x={cx}
                y={height - 8}
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
