import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { Panel, Pill, Td, Th } from "@/components/console/ui";
import { invoices } from "@/lib/mock-data";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

const usage = [
  { label: "Reports this month", used: 3912, limit: 5000, unit: "" },
  { label: "Agent pages", used: 42, limit: 50, unit: "" },
  { label: "Sites and embeds", used: 3, limit: 5, unit: "" },
] as const;

function Meter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, (used / limit) * 100);
  const high = pct > 85;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="tabular text-ink-muted">
          <span className="font-medium text-ink">
            {used.toLocaleString("en-US")}
          </span>{" "}
          / {limit.toLocaleString("en-US")}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-soft">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: high ? "var(--c-warn)" : "var(--c-brand)",
          }}
        />
      </div>
    </div>
  );
}

function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="c-title">Billing</h1>
        <p className="c-label mt-1">
          Plan, usage, and invoices for Harbor & Vale Real Estate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Plan">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-semibold text-xl">Growth</div>
              <div className="c-label">Billed monthly · renews Oct 1, 2026</div>
            </div>
            <div className="tabular font-semibold text-2xl">
              $1,490
              <span className="font-normal text-base text-ink-muted">/mo</span>
            </div>
          </div>
          <ul className="mt-5 space-y-2 text-ink-muted text-sm">
            <li>5,000 reports per month, then $0.18 each</li>
            <li>Unlimited leads and CRM syncs</li>
            <li>Up to 5 sites or embeds and 50 agent pages</li>
            <li>Custom domains with managed SSL</li>
          </ul>
          <div className="mt-5 flex gap-2">
            <button className="btn btn-brand btn-sm" type="button">
              Change plan
            </button>
            <button className="btn btn-ghost btn-sm" type="button">
              Update payment method
            </button>
          </div>
          <p className="c-label mt-4">
            Visa ending 4242 · Next charge $1,490.00
          </p>
        </Panel>

        <Panel sub="Resets on the 1st of each month" title="Usage this month">
          <div className="space-y-5">
            {usage.map((u) => (
              <Meter key={u.label} {...u} />
            ))}
          </div>
          <p className="c-label mt-5">
            At the current pace you'll finish the month around 4,700 reports.
            We'll email you at 90% of the included amount.
          </p>
        </Panel>
      </div>

      <Panel flush title="Invoices">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Invoice</Th>
                <Th>Date</Th>
                <Th align="right">Amount</Th>
                <Th>Status</Th>
                <Th>
                  <span className="sr-only">Download</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr className="last:[&>td]:border-b-0" key={inv.id}>
                  <Td className="font-medium">{inv.id}</Td>
                  <Td>{inv.date}</Td>
                  <Td align="right">{inv.amount}</Td>
                  <Td>
                    <Pill tone="good">{inv.status}</Pill>
                  </Td>
                  <Td align="right">
                    <button
                      aria-label={`Download ${inv.id}`}
                      className="btn btn-ghost btn-sm"
                      type="button"
                    >
                      <Download aria-hidden="true" className="size-4" />
                      PDF
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
