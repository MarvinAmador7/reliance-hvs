import { Check, Lock } from "lucide-react";
import { useState } from "react";

import { AgreementChart } from "@/components/hvs/agreement-chart";
import { useClaim } from "@/components/hvs/claim-dialog";
import { fmtMoney } from "@/lib/mock-data";
import { track } from "@/lib/track";

interface Source {
  high: number;
  id: string;
  logo: string;
  low: number;
  name: string;
  value: number;
}

interface SellForPanelProps {
  sources: readonly Source[];
}

const conditions = [
  { factor: 0.94, label: "Needs work", value: "needs-work" },
  { factor: 1, label: "Good", value: "good" },
  { factor: 1.05, label: "Excellent", value: "excellent" },
] as const;

type Condition = (typeof conditions)[number]["value"];

const roundK = (n: number) => Math.round(n / 1000) * 1000;

export function SellForPanel({ sources }: SellForPanelProps) {
  const [condition, setCondition] = useState<Condition>("good");
  const { claimed, openClaim } = useClaim();

  const factor = conditions.find((c) => c.value === condition)?.factor ?? 1;
  const overlapLow = Math.max(...sources.map((s) => s.low));
  const overlapHigh = Math.min(...sources.map((s) => s.high));
  const low = roundK(overlapLow * factor);
  const high = roundK(overlapHigh * factor);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.35fr]">
      <div>
        <h3 className="t-h3">What could it sell for?</h3>
        <p className="mt-3 text-ink-muted">
          You could reasonably list between{" "}
          <span className="tabular font-medium text-ink">
            {fmtMoney(low, true)}
          </span>{" "}
          and{" "}
          <span className="tabular font-medium text-ink">
            {fmtMoney(high, true)}
          </span>
          , the band all three sources agree on.
        </p>

        <fieldset className="mt-8">
          <legend className="mb-2 font-medium text-ink text-sm">
            Condition of the home
          </legend>
          <div className="inline-flex rounded-full bg-canvas p-1">
            {conditions.map((c) => (
              <label
                className={`h-9 cursor-pointer rounded-full px-3.5 text-[0.9375rem] leading-9 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand/50 ${
                  condition === c.value
                    ? "bg-ink font-medium text-canvas"
                    : "text-ink-muted hover:text-ink"
                }`}
                key={c.value}
              >
                <input
                  checked={condition === c.value}
                  className="sr-only"
                  name="condition"
                  onChange={() => {
                    setCondition(c.value);
                    track("condition_adjusted", c.label);
                    if (!claimed) {
                      openClaim("the condition you chose");
                    }
                  }}
                  type="radio"
                  value={c.value}
                />
                {c.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-ink-muted text-sm">
            {condition === "excellent"
              ? "Excellent condition lifts the whole range by about 5%."
              : "Excellent condition puts the top of the range in play."}
          </p>
        </fieldset>

        {claimed ? (
          <p className="mt-6 inline-flex items-center gap-1.5 text-ink-muted text-sm">
            <Check aria-hidden="true" className="size-3.5 text-brand" />
            Saved to your home. Changes apply to next month's update.
          </p>
        ) : (
          <button
            className="mt-6 inline-flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink"
            onClick={() => openClaim("your condition")}
            type="button"
          >
            <Lock aria-hidden="true" className="size-3.5" />
            <span className="underline underline-offset-4">
              Claim this home
            </span>{" "}
            to save your condition and edit its details.
          </button>
        )}
      </div>

      <div>
        <AgreementChart sources={sources} />
      </div>
    </div>
  );
}
