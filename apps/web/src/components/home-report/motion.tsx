import { type ReactNode, useEffect, useState } from "react";

const COUNT_DURATION_MS = 900;
const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

interface CountUpProps {
  className?: string;
  format: (n: number) => string;
  value: number;
}

/** Counts from ~60% of the value to the value on mount. Renders the final value on the server. */
export function CountUp({ value, format, className }: CountUpProps) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const from = value * 0.6;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_DURATION_MS);
      setShown(from + (value - from) * easeOutQuint(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={className}>{format(Math.round(shown))}</span>;
}

interface RevealProps {
  as?: "div" | "section" | "li";
  children: ReactNode;
  className?: string;
  /** Stagger step; maps to a later point in the scroll range. */
  delay?: number;
}

/**
 * Content is always visible. Browsers that support scroll-driven animations get a small rise as the
 * element enters the viewport (see `.reveal` in index.css); everything else renders the final state.
 */
export function Reveal({
  children,
  className = "",
  as = "div",
  delay = 0,
}: RevealProps) {
  const Tag = as;
  const step = Math.min(3, Math.round(delay / 90));
  return (
    <Tag
      className={`reveal ${className}`}
      data-step={step > 0 ? step : undefined}
    >
      {children}
    </Tag>
  );
}
