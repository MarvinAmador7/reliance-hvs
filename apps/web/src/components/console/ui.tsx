import type { ReactNode } from "react";
import { useId } from "react";

/* Small product-register primitives shared across console screens. */

interface PanelProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
  sub?: string;
  title?: string;
}

export function Panel({
  title,
  sub,
  action,
  children,
  className = "",
  flush = false,
}: PanelProps) {
  const hasHeader = Boolean(title) || Boolean(action);
  return (
    <section className={`panel ${flush ? "" : "p-5"} ${className}`}>
      {hasHeader ? (
        <header
          className={`flex items-start justify-between gap-4 ${flush ? "px-5 pt-5" : ""} mb-4`}
        >
          <div>
            {title ? <h2 className="c-section">{title}</h2> : null}
            {sub ? <p className="c-label mt-0.5">{sub}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

type Tone = "neutral" | "good" | "warn" | "brand" | "bad";

const toneClass: Record<Tone, string> = {
  bad: "bg-bad/12 text-bad",
  brand: "bg-brand-soft text-brand",
  good: "bg-good/12 text-[oklch(0.42_0.14_145)]",
  neutral: "bg-surface text-ink",
  warn: "bg-warn/25 text-[oklch(0.45_0.12_80)]",
};

export function Pill({
  tone = "neutral",
  children,
  dot = false,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-medium text-xs ${toneClass[tone]}`}
    >
      {dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (next: boolean) => void;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: SwitchProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-[oklch(0.8_0_0)]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_oklch(0_0_0/0.25)] transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  size?: "sm" | "md";
  value: T;
}

/** Native radio group styled as a segmented control; arrow keys move between options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "sm",
}: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className="inline-flex rounded-[10px] bg-surface p-0.5">
      <legend className="sr-only">{label}</legend>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label
            className={`cursor-pointer rounded-[8px] font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand/50 ${
              size === "sm"
                ? "h-7 px-2.5 text-[0.8125rem] leading-7"
                : "h-9 px-3.5 text-sm leading-9"
            } ${selected ? "bg-canvas text-ink shadow-[0_1px_2px_oklch(0_0_0/0.08)]" : "text-ink-muted hover:text-ink"}`}
            key={o.value}
          >
            <input
              checked={selected}
              className="sr-only"
              name={name}
              onChange={() => onChange(o.value)}
              type="radio"
              value={o.value}
            />
            {o.label}
          </label>
        );
      })}
    </fieldset>
  );
}

export function Avatar({
  initials,
  photo,
  size = "md",
}: {
  initials: string;
  photo?: string;
  size?: "sm" | "md";
}) {
  const px = size === "sm" ? 28 : 36;
  if (photo) {
    return (
      <img
        alt=""
        className={`shrink-0 rounded-full object-cover ${size === "sm" ? "size-7" : "size-9"}`}
        height={px}
        src={photo}
        width={px}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand ${
        size === "sm" ? "size-7 text-[0.6875rem]" : "size-9 text-xs"
      }`}
    >
      {initials}
    </span>
  );
}

export function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`c-label whitespace-nowrap border-line border-b px-3 py-2 font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
      scope="col"
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-line border-b px-3 py-2.5 text-sm ${align === "right" ? "tabular text-right" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control is passed as children and wrapped by this label
    <label className="block">
      <span className="mb-1.5 block font-medium text-ink text-sm">{label}</span>
      {children}
      {hint ? <span className="c-label mt-1.5 block">{hint}</span> : null}
    </label>
  );
}
