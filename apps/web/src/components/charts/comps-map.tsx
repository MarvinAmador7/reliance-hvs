import { fmtMoney } from "@/lib/mock-data";

interface Comp {
  address: string;
  dx: number;
  dy: number;
  price: number;
}

interface CompsMapProps {
  active: number | null;
  comps: readonly Comp[];
  onSelect: (index: number | null) => void;
  subjectLabel: string;
}

const W = 600;
const H = 440;

/** A stylized neighborhood map: bay water, a few streets, subject and comparable markers. */
export function CompsMap({
  comps,
  active,
  onSelect,
  subjectLabel,
}: CompsMapProps) {
  return (
    <svg
      aria-label={`Map of ${subjectLabel} and ${comps.length} nearby sales`}
      className="block h-auto w-full rounded-2xl"
      role="img"
      viewBox={`0 0 ${W} ${H}`}
    >
      <rect fill="oklch(0.965 0.004 120)" height={H} rx="16" width={W} />
      <path
        d="M470 0 C 430 90, 480 170, 440 250 S 470 380, 420 440 L600 440 L600 0 Z"
        fill="oklch(0.9 0.035 220)"
      />
      <g
        fill="none"
        stroke="oklch(1 0 0)"
        strokeLinecap="round"
        strokeWidth="10"
      >
        <path d="M-10 120 C 120 110, 240 150, 470 130" />
        <path d="M-10 260 C 140 250, 260 300, 445 280" />
        <path d="M-10 380 C 120 370, 300 400, 430 390" />
        <path d="M140 -10 C 150 120, 130 260, 150 450" />
        <path d="M290 -10 C 300 140, 280 300, 300 450" />
      </g>
      <g
        fill="none"
        stroke="oklch(1 0 0)"
        strokeLinecap="round"
        strokeWidth="5"
      >
        <path d="M60 -10 L 70 450" />
        <path d="M215 -10 L 225 450" />
        <path d="M370 -10 L 360 450" />
        <path d="M-10 190 C 160 180, 300 220, 440 205" />
        <path d="M-10 320 C 160 310, 300 350, 440 335" />
      </g>
      <text className="fill-ink-muted" fontSize="11" x="500" y="60">
        Biscayne Bay
      </text>

      {comps.map((c, i) => {
        const cx = (c.dx / 100) * W;
        const cy = (c.dy / 100) * H;
        const isActive = active === i;
        return (
          // biome-ignore lint/a11y/useSemanticElements: SVG has no button element; the group is keyboard focusable
          <g
            className="cursor-pointer"
            key={c.address}
            onBlur={() => onSelect(null)}
            onFocus={() => onSelect(i)}
            onMouseEnter={() => onSelect(i)}
            onMouseLeave={() => onSelect(null)}
            role="button"
            tabIndex={0}
          >
            <title>
              {c.address} · sold {fmtMoney(c.price)}
            </title>
            <circle cx={cx} cy={cy} fill="var(--c-bg)" r={isActive ? 15 : 12} />
            <circle cx={cx} cy={cy} fill="var(--c-ink)" r={isActive ? 12 : 9} />
            <text
              fill="var(--c-bg)"
              fontSize={isActive ? 11 : 10}
              fontWeight="600"
              textAnchor="middle"
              x={cx}
              y={cy + 4}
            >
              {i + 1}
            </text>
            {isActive && (
              <g>
                <rect
                  fill="var(--c-ink)"
                  height="28"
                  rx="8"
                  width="96"
                  x={cx - 48}
                  y={cy - 52}
                />
                <text
                  fill="var(--c-bg)"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  x={cx}
                  y={cy - 33}
                >
                  {fmtMoney(c.price, true)}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <g>
        <circle
          cx={W * 0.5}
          cy={H * 0.45}
          fill="var(--c-brand)"
          opacity="0.15"
          r="34"
        >
          <animate
            attributeName="r"
            dur="2.6s"
            repeatCount="indefinite"
            values="26;38;26"
          />
        </circle>
        <circle cx={W * 0.5} cy={H * 0.45} fill="var(--c-bg)" r="17" />
        <circle cx={W * 0.5} cy={H * 0.45} fill="var(--c-brand)" r="13" />
        <path
          d={`M${W * 0.5 - 5} ${H * 0.45 + 1} l3 3 l7 -7`}
          fill="none"
          stroke="var(--c-brand-ink)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <text
          className="fill-ink"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
          x={W * 0.5}
          y={H * 0.45 + 38}
        >
          Your home
        </text>
      </g>
    </svg>
  );
}
