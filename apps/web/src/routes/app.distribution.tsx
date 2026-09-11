import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Field, Panel, Pill, Switch, Td, Th } from "@/components/console/ui";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/app/distribution")({
  component: DistributionPage,
});

const embedAttributes = [
  [
    "data-site",
    "Which configuration to load. Everything else comes from Customize.",
  ],
  [
    "data-mode",
    "inline (search + report on the page) or modal (report opens over the host page).",
  ],
  [
    "data-sections",
    "Optional override of visible sections for this placement, e.g. value,equity,buyers.",
  ],
  ["data-agent", "Route leads from this placement to a specific agent."],
  ["data-source", "Attribution label for this placement, shown in Overview."],
] as const;

function DistributionPage() {
  const { tenant } = useTenant();
  const [copied, setCopied] = useState(false);
  const [gtm, setGtm] = useState(true);
  const [utm, setUtm] = useState(true);
  const [crm, setCrm] = useState(true);

  const snippet = `<script async src="https://cdn.reliance.com/home-report.js" data-site="${tenant.id}" data-mode="inline"></script>\n<div id="reliance-home-report"></div>`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="c-title">Distribution</h1>
        <p className="c-label mt-1">
          Two ways to put the experience in front of homeowners. Both read the
          same configuration.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          sub="Reliance serves the full site on your domain."
          title="Hosted site"
        >
          <div className="flex items-center justify-between gap-3 rounded-[10px] bg-surface px-3.5 py-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{tenant.hostedDomain}</div>
              <div className="c-label">
                Custom domain · SSL issued by Reliance
              </div>
            </div>
            <Pill dot tone="good">
              Live
            </Pill>
          </div>
          <h3 className="c-label mt-5 mb-2 font-medium">DNS records</h3>
          <div className="overflow-x-auto rounded-[10px] border border-line">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Name</Th>
                  <Th>Value</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td className="font-mono text-xs">CNAME</Td>
                  <Td className="font-mono text-xs">gethomevalue</Td>
                  <Td className="font-mono text-xs">sites.reliance.com</Td>
                  <Td>
                    <Pill tone="good">Verified</Pill>
                  </Td>
                </tr>
                <tr className="last:[&>td]:border-b-0">
                  <Td className="font-mono text-xs">TXT</Td>
                  <Td className="font-mono text-xs">_reliance</Td>
                  <Td className="font-mono text-xs">rl-verify=8f2a…c41</Td>
                  <Td>
                    <Pill tone="good">Verified</Pill>
                  </Td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn btn-ghost btn-sm" type="button">
              Add another domain
            </button>
            <button className="btn btn-ghost btn-sm" type="button">
              Redirect rules
            </button>
          </div>
        </Panel>

        <Panel
          sub="One script on any page of your website or an agent's site."
          title="Embed"
        >
          <div className="relative rounded-[10px] bg-dark p-4 pr-24 font-mono text-[0.8125rem] text-canvas leading-relaxed">
            <pre className="whitespace-pre-wrap break-all">{snippet}</pre>
            <button
              className="btn btn-sm absolute top-3 right-3 bg-canvas/12 text-canvas hover:bg-canvas/20"
              onClick={() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              }}
              type="button"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : (
                <Copy aria-hidden="true" className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <h3 className="c-label mt-5 mb-2 font-medium">Attributes</h3>
          <dl className="divide-y divide-line">
            {embedAttributes.map(([name, desc]) => (
              <div
                className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-sm"
                key={name}
              >
                <dt className="font-mono text-xs leading-5">{name}</dt>
                <dd className="text-ink-muted">{desc}</dd>
              </div>
            ))}
          </dl>
          <p className="c-label mt-4">
            Ordering, visibility, theme, and copy are not attributes on purpose.
            They live in Customize so a change reaches every placement without
            touching any website.
          </p>
        </Panel>
      </div>

      <Panel
        sub="Applies to the hosted site and every embed."
        title="Tracking and attribution"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Field
            hint="Reliance pushes every event to your container as a dataLayer event."
            label="Google Tag Manager"
          >
            <div className="flex items-center gap-3">
              <input
                className="field font-mono text-sm"
                defaultValue="GTM-K7Q2M4"
                type="text"
              />
              <Switch
                checked={gtm}
                label="Google Tag Manager enabled"
                onChange={setGtm}
              />
            </div>
          </Field>
          <Field
            hint="Carries utm_* and referrer from the host page into every lead."
            label="Pass through campaign parameters"
          >
            <div className="flex h-11 items-center">
              <Switch
                checked={utm}
                label="Pass through UTM parameters"
                onChange={setUtm}
              />
            </div>
          </Field>
          <Field
            hint="Follow Up Boss connected. Leads sync within seconds, with the full activity timeline."
            label="Send leads to your CRM"
          >
            <div className="flex h-11 items-center gap-3">
              <Switch
                checked={crm}
                label="Send leads to CRM"
                onChange={setCrm}
              />
              <Pill dot tone="good">
                Connected
              </Pill>
            </div>
          </Field>
        </div>
      </Panel>
    </div>
  );
}
