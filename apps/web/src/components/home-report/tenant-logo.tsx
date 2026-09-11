import { useTenant } from "@/lib/tenant";

interface TenantLogoProps {
  inverted?: boolean;
  size?: "sm" | "md";
}

function Mark({
  kind,
  className,
}: {
  kind: "harbor" | "key" | "peak";
  className: string;
}) {
  if (kind === "harbor") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 28 28"
      >
        <rect fill="var(--c-brand)" height="28" rx="8" width="28" />
        <path
          d="M6 17c2.5-3 5.5-3 8 0s5.5 3 8 0"
          stroke="var(--c-brand-ink)"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d="M14 6v8"
          stroke="var(--c-brand-ink)"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <circle cx="14" cy="21.5" fill="var(--c-brand-ink)" r="1.6" />
      </svg>
    );
  }
  if (kind === "key") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 28 28"
      >
        <rect fill="var(--c-brand)" height="28" rx="6" width="28" />
        <path
          d="M14 5l7 6.5v11H7v-11L14 5z"
          stroke="var(--c-brand-ink)"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M11.5 22.5v-6h5v6"
          stroke="var(--c-brand-ink)"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 28 28"
    >
      <rect fill="var(--c-brand)" height="28" rx="14" width="28" />
      <path d="M6 20l6-9 4 6 2-3 4 6H6z" fill="var(--c-brand-ink)" />
    </svg>
  );
}

export function TenantLogo({ size = "md", inverted = false }: TenantLogoProps) {
  const { tenant } = useTenant();
  const markClass = size === "sm" ? "size-6" : "size-7";
  const textClass = size === "sm" ? "text-[0.9375rem]" : "text-lg";
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark className={markClass} kind={tenant.mark} />
      <span
        className={`${textClass} font-semibold tracking-[-0.01em] ${inverted ? "text-canvas" : "text-ink"}`}
      >
        {tenant.name}
      </span>
    </span>
  );
}

export function RelianceMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 28 28"
    >
      <rect fill="oklch(0.46 0.1 112)" height="28" rx="8" width="28" />
      <path
        d="M8 20V8h6.5a3.5 3.5 0 0 1 0 7H11"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M14 15l5.5 5"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}
