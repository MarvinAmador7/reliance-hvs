interface SparklineProps {
  color?: string;
  data: readonly number[];
  height?: number;
  muted?: string;
  width?: number;
}

const PAD = 3;

export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "var(--c-brand)",
  muted = "oklch(0.82 0 0)",
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = (width - PAD * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - (v - min) / span) * (height - PAD * 2);
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const last = points.at(-1) ?? [0, 0];

  return (
    <svg
      aria-hidden="true"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <path
        d={path}
        fill="none"
        stroke={muted}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d={path}
        fill="none"
        pathLength={100}
        stroke={color}
        strokeDasharray="30 100"
        strokeDashoffset="-70"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        fill={color}
        r="2.5"
        stroke="var(--c-bg)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
