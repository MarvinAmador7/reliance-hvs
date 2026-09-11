import { useEffect, useState } from "react";

/*
  Browser-side measurement helpers for the design system page. Everything shown
  there is read back from rendered elements, so the page can't drift from the CSS.
*/

export interface TypeMetrics {
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
}

export const readTypeMetrics = (el: HTMLElement): TypeMetrics => {
  const cs = getComputedStyle(el);
  const size = Number.parseFloat(cs.fontSize);
  const lh = Number.parseFloat(cs.lineHeight);
  const ls = Number.parseFloat(cs.letterSpacing);
  return {
    fontSize: `${Math.round(size)}px`,
    fontWeight: cs.fontWeight,
    letterSpacing: Number.isNaN(ls) ? "0" : `${(ls / size).toFixed(3)}em`,
    lineHeight: Number.isNaN(lh) ? cs.lineHeight : (lh / size).toFixed(2),
  };
};

/** Resolves any CSS color (including oklch) to sRGB by painting it on a canvas. */
const toRgb = (color: string): [number, number, number] | null => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r ?? 0, g ?? 0, b ?? 0];
};

const channel = (v: number): number => {
  const c = v / 255;
  return c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG contrast ratio between two CSS colors, or null if either can't be resolved. */
export const contrastRatio = (fg: string, bg: string): number | null => {
  const a = toRgb(fg);
  const b = toRgb(bg);
  if (!(a && b)) {
    return null;
  }
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/** Reads a CSS custom property's resolved value from an element. */
export const readVar = (el: HTMLElement, name: string): string =>
  getComputedStyle(el).getPropertyValue(name).trim();

/** Re-runs a measurement whenever the element or the tenant theme changes. */
export const useMeasured = <T>(
  ref: React.RefObject<HTMLElement | null>,
  measure: (el: HTMLElement) => T,
  deps: readonly unknown[]
): T | null => {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    // Wait a frame so web fonts and theme variables have applied.
    const frame = requestAnimationFrame(() => setValue(measure(el)));
    return () => cancelAnimationFrame(frame);
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps are supplied by the caller on purpose
  }, deps);
  return value;
};
