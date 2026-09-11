import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Code,
  Copy,
  ExternalLink,
  Globe,
  Plus,
  RefreshCw,
  UsersRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { Sparkline } from "@/components/charts/sparkline";
import {
  Avatar,
  Field,
  Panel,
  Pill,
  Segmented,
  Switch,
  Td,
  Th,
} from "@/components/console/ui";
import { daily } from "@/lib/mock-data";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/app/sites")({
  component: SitesPage,
});

/* ---------- Mock model ---------- */

type Kind = "hosted" | "embed" | "agent";
type Status = "live" | "draft" | "attention";

interface HealthCheck {
  detail: string;
  label: string;
  ok: boolean;
}

interface Deployment {
  checks: HealthCheck[];
  detail: string;
  id: string;
  kind: Kind;
  lastEvent: string;
  leads: number;
  name: string;
  reports: number;
  settings: {
    inherit: boolean;
    sections: string;
    routing: string;
    source: string;
    mode?: string;
  };
  status: Status;
  trend: readonly number[];
  version: string;
}

const kindMeta: Record<
  Kind,
  { label: string; icon: typeof Globe; body: string }
> = {
  agent: {
    body: "Every agent gets a branded version of the site with their own contact card, so leads route to the right person.",
    icon: UsersRound,
    label: "Agent pages",
  },
  embed: {
    body: "One script tag on any page of your website. The search box and report render inline or in a modal, with the same configuration as the hosted site.",
    icon: Code,
    label: "Website embed",
  },
  hosted: {
    body: "Reliance serves the full page on your domain. Header, footer, and legal text are composed from blocks you control in Customize.",
    icon: Globe,
    label: "Hosted site",
  },
};

const scale = (factor: number, offset = 0) =>
  daily.map((d, i) =>
    Math.round(d.reports * factor + Math.sin(i / 3) * offset)
  );

const deployments: Deployment[] = [
  {
    checks: [
      {
        detail: "gethomevalue → sites.reliance.com",
        label: "Domain points to Reliance",
        ok: true,
      },
      {
        detail: "Renews automatically, 61 days left",
        label: "SSL certificate",
        ok: true,
      },
      {
        detail: "3 minutes ago, from Coconut Grove",
        label: "Receiving events",
        ok: true,
      },
      {
        detail: "Composable blocks, published Tue",
        label: "Header and footer",
        ok: true,
      },
    ],
    detail: "Custom domain · SSL active",
    id: "hosted",
    kind: "hosted",
    lastEvent: "3 min ago",
    leads: 301,
    name: "gethomevalue.harborvale.com",
    reports: 2268,
    settings: {
      inherit: true,
      routing: "Round robin by ZIP",
      sections: "All sections",
      source: "Hosted site",
    },
    status: "live",
    trend: scale(0.58, 6),
    version: "Latest",
  },
  {
    checks: [
      {
        detail: "harborvale.com/sell-your-home",
        label: "Script found on page",
        ok: true,
      },
      { detail: "Script v3.2, current", label: "Widget version", ok: true },
      { detail: "12 minutes ago", label: "Receiving events", ok: true },
      {
        detail: "Page allows inline frames and fonts",
        label: "Host page policy",
        ok: true,
      },
    ],
    detail: "Inline · Sections: value, equity, buyers",
    id: "embed-sell",
    kind: "embed",
    lastEvent: "12 min ago",
    leads: 132,
    name: "harborvale.com/sell-your-home",
    reports: 1135,
    settings: {
      inherit: false,
      mode: "Inline",
      routing: "Office default",
      sections: "Value, equity, buyers",
      source: "Website embed",
    },
    status: "live",
    trend: scale(0.29, 4),
    version: "v3.2",
  },
  {
    checks: [
      {
        detail: "harborvale.com/agents/*/home-value",
        label: "Pages resolving",
        ok: true,
      },
      {
        detail: "9 agents haven't claimed their page",
        label: "Pages claimed",
        ok: false,
      },
      { detail: "41 minutes ago", label: "Receiving events", ok: true },
    ],
    detail: "harborvale.com/agents/*/home-value",
    id: "agents",
    kind: "agent",
    lastEvent: "41 min ago",
    leads: 53,
    name: "42 agent pages",
    reports: 509,
    settings: {
      inherit: true,
      routing: "Page owner",
      sections: "All sections",
      source: "Agent page",
    },
    status: "attention",
    trend: scale(0.13, 2),
    version: "Latest",
  },
  {
    checks: [
      {
        detail: "No page has loaded the script yet",
        label: "Script found on page",
        ok: false,
      },
      {
        detail: "Snippet generated, not installed",
        label: "Receiving events",
        ok: false,
      },
    ],
    detail: "Modal · Not yet installed",
    id: "embed-spring",
    kind: "embed",
    lastEvent: "Never",
    leads: 0,
    name: "Spring campaign landing page",
    reports: 0,
    settings: {
      inherit: true,
      mode: "Modal",
      routing: "Round robin by ZIP",
      sections: "All sections",
      source: "Spring campaign",
    },
    status: "draft",
    trend: daily.map(() => 0),
    version: "v3.2",
  },
];

interface AgentPage {
  claimed: boolean;
  initials: string;
  leads: number;
  name: string;
  photo?: string;
  reports: number;
  slug: string;
}

const agentPages: AgentPage[] = [
  {
    claimed: true,
    initials: "DW",
    leads: 19,
    name: "Dana Whitfield",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    reports: 142,
    slug: "dana",
  },
  {
    claimed: true,
    initials: "LF",
    leads: 11,
    name: "Luis Ferrer",
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    reports: 96,
    slug: "luis",
  },
  {
    claimed: true,
    initials: "AR",
    leads: 7,
    name: "Ana Reyes",
    reports: 71,
    slug: "ana",
  },
  {
    claimed: true,
    initials: "JK",
    leads: 5,
    name: "James Kim",
    reports: 58,
    slug: "james",
  },
  {
    claimed: false,
    initials: "MT",
    leads: 0,
    name: "Maria Torres",
    reports: 12,
    slug: "maria",
  },
  {
    claimed: false,
    initials: "PB",
    leads: 0,
    name: "Paul Bennett",
    reports: 9,
    slug: "paul",
  },
  {
    claimed: true,
    initials: "SO",
    leads: 3,
    name: "Sofia Ortega",
    reports: 44,
    slug: "sofia",
  },
  {
    claimed: false,
    initials: "RH",
    leads: 0,
    name: "Ryan Hale",
    reports: 4,
    slug: "ryan",
  },
];

const UNCLAIMED_TOTAL = 9;
const AGENTS_TOTAL = 42;

const statusPill: Record<
  Status,
  { tone: "good" | "warn" | "neutral"; label: string }
> = {
  attention: { label: "Needs attention", tone: "warn" },
  draft: { label: "Draft", tone: "neutral" },
  live: { label: "Live", tone: "good" },
};

const detailTabs = [
  { label: "Overview", value: "overview" },
  { label: "Settings", value: "settings" },
  { label: "Install", value: "install" },
] as const;
type DetailTab = (typeof detailTabs)[number]["value"];

const totals = deployments.reduce(
  (acc, d) => ({
    leads: acc.leads + d.leads,
    reports: acc.reports + d.reports,
  }),
  { leads: 0, reports: 0 }
);

/* ---------- Page ---------- */

function SitesPage() {
  const [selectedId, setSelectedId] = useState<string>("hosted");
  const [tab, setTab] = useState<DetailTab>("overview");
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [verifying, setVerifying] = useState<"idle" | "running" | "done">(
    "idle"
  );
  const createRef = useRef<HTMLDialogElement>(null);

  const selected =
    deployments.find((d) => d.id === selectedId) ?? deployments[0];

  const select = (id: string) => {
    setSelectedId(id);
    setTab("overview");
    setVerifying("idle");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="c-title">Sites & widgets</h1>
          <p className="c-label mt-1">
            Every place your Home Report is live, whether it's healthy, and what
            each one brings in.
          </p>
        </div>
        <button
          className="btn btn-brand btn-sm"
          onClick={() => createRef.current?.showModal()}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          New site or embed
        </button>
      </div>

      <div className="panel grid gap-6 p-5 md:grid-cols-[auto_auto_auto_1fr] md:items-center">
        <Stat
          label="Reports, 30 days"
          value={totals.reports.toLocaleString("en-US")}
        />
        <Stat
          label="Leads, 30 days"
          value={totals.leads.toLocaleString("en-US")}
        />
        <Stat
          label="Report to lead"
          value={`${((totals.leads / totals.reports) * 100).toFixed(1)}%`}
        />
        <div className="min-w-0">
          <div className="c-label mb-2">Share of reports by placement</div>
          <div className="flex h-3 overflow-hidden rounded-full">
            {deployments
              .filter((d) => d.reports > 0)
              .map((d, i) => (
                <div
                  className={`h-full ${i > 0 ? "ml-0.5" : ""}`}
                  key={d.id}
                  style={{
                    background: shareColor(d.kind),
                    width: `${(d.reports / totals.reports) * 100}%`,
                  }}
                  title={`${d.name}: ${Math.round((d.reports / totals.reports) * 100)}%`}
                />
              ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {(["hosted", "embed", "agent"] as Kind[]).map((k) => {
              const sum = deployments
                .filter((d) => d.kind === k)
                .reduce((n, d) => n + d.reports, 0);
              return (
                <li className="flex items-center gap-1.5" key={k}>
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ background: shareColor(k) }}
                  />
                  <span className="text-ink-muted">{kindMeta[k].label}</span>
                  <span className="tabular font-medium">
                    {Math.round((sum / totals.reports) * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel className="min-w-0" flush>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Deployment</Th>
                  <Th>Health</Th>
                  <th
                    className="c-label hidden whitespace-nowrap border-line border-b px-3 py-2 text-left font-medium 2xl:table-cell"
                    scope="col"
                  >
                    30 days
                  </th>
                  <Th align="right">Reports</Th>
                  <Th align="right">Leads</Th>
                  <Th align="right">Rate</Th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => {
                  const Icon = kindMeta[d.kind].icon;
                  const isSelected = selected?.id === d.id;
                  const failing = d.checks.filter((c) => !c.ok);
                  const isAgents = d.kind === "agent";
                  return [
                    <tr
                      aria-selected={isSelected}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-brand-soft/60" : "hover:bg-surface"}`}
                      key={d.id}
                      onClick={() => select(d.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          select(d.id);
                        }
                      }}
                      tabIndex={0}
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface text-ink-muted">
                            <Icon aria-hidden="true" className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-medium">
                              {d.name}
                              {isAgents ? (
                                <button
                                  aria-expanded={agentsOpen}
                                  aria-label="Show agent pages"
                                  className="rounded p-0.5 text-ink-muted hover:text-ink"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAgentsOpen((v) => !v);
                                  }}
                                  type="button"
                                >
                                  <ChevronDown
                                    aria-hidden="true"
                                    className={`size-4 transition-transform ${agentsOpen ? "rotate-180" : ""}`}
                                  />
                                </button>
                              ) : null}
                            </div>
                            <div className="c-label">
                              {kindMeta[d.kind].label} · {d.detail}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <HealthCell deployment={d} failing={failing} />
                      </Td>
                      <td className="hidden border-line border-b px-3 py-2.5 2xl:table-cell">
                        <Sparkline
                          color={
                            d.reports > 0 ? "var(--c-brand)" : "oklch(0.82 0 0)"
                          }
                          data={d.trend}
                        />
                      </td>
                      <Td align="right">{d.reports.toLocaleString("en-US")}</Td>
                      <Td align="right">{d.leads}</Td>
                      <Td align="right">
                        {d.reports > 0
                          ? `${((d.leads / d.reports) * 100).toFixed(1)}%`
                          : "—"}
                      </Td>
                    </tr>,
                    isAgents && agentsOpen ? (
                      <tr key={`${d.id}-agents`}>
                        <td
                          className="border-line border-b bg-surface/60 px-3 py-3"
                          colSpan={6}
                        >
                          <AgentPagesList />
                        </td>
                      </tr>
                    ) : null,
                  ];
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {selected ? (
          <Panel className="self-start xl:sticky xl:top-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="c-section truncate">{selected.name}</h2>
                <p className="c-label">{kindMeta[selected.kind].label}</p>
              </div>
              <Pill dot tone={statusPill[selected.status].tone}>
                {statusPill[selected.status].label}
              </Pill>
            </div>
            <div className="mt-4">
              <Segmented
                label="Deployment detail"
                onChange={setTab}
                options={detailTabs}
                value={tab}
              />
            </div>

            {tab === "overview" ? (
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="c-label">Reports, last 30 days</span>
                    <span className="tabular font-semibold">
                      {selected.reports.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Sparkline
                      color="var(--c-brand)"
                      data={selected.trend}
                      height={48}
                      width={360}
                    />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="c-label">Last event</dt>
                    <dd className="mt-0.5 font-medium">{selected.lastEvent}</dd>
                  </div>
                  <div>
                    <dt className="c-label">Version</dt>
                    <dd className="mt-0.5 font-medium">{selected.version}</dd>
                  </div>
                  <div>
                    <dt className="c-label">Leads</dt>
                    <dd className="mt-0.5 font-medium">{selected.leads}</dd>
                  </div>
                  <div>
                    <dt className="c-label">Attribution label</dt>
                    <dd className="mt-0.5 font-medium">
                      {selected.settings.source}
                    </dd>
                  </div>
                </dl>
                <div>
                  <h3 className="c-label mb-2 font-medium">Checks</h3>
                  <ul className="divide-y divide-line">
                    {selected.checks.map((c) => (
                      <li
                        className="flex items-start gap-2.5 py-2 text-sm"
                        key={c.label}
                      >
                        {c.ok ? (
                          <CircleCheck
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-good"
                          />
                        ) : (
                          <CircleAlert
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-warn"
                          />
                        )}
                        <div>
                          <div className="font-medium">{c.label}</div>
                          <div className="c-label">{c.detail}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {selected.kind === "agent" ? (
                  <button className="btn btn-brand btn-sm" type="button">
                    Invite {UNCLAIMED_TOTAL} agents to claim their page
                  </button>
                ) : null}
              </div>
            ) : null}

            {tab === "settings" ? <SettingsTab deployment={selected} /> : null}

            {tab === "install" ? (
              <InstallTab
                deployment={selected}
                onVerify={() => {
                  setVerifying("running");
                  window.setTimeout(() => setVerifying("done"), 1200);
                }}
                verifying={verifying}
              />
            ) : null}
          </Panel>
        ) : null}
      </div>

      <CreateDialog ref={createRef} />
    </div>
  );
}

/* ---------- Pieces ---------- */

const shareColor = (kind: Kind): string => {
  if (kind === "hosted") {
    return "var(--c-brand)";
  }
  if (kind === "embed") {
    return "oklch(0.7 0.06 112)";
  }
  return "oklch(0.85 0.03 112)";
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pr-6 md:border-line md:border-r">
      <div className="c-label">{label}</div>
      <div className="tabular mt-1 font-semibold text-2xl tracking-[-0.01em]">
        {value}
      </div>
    </div>
  );
}

function HealthCell({
  deployment,
  failing,
}: {
  deployment: Deployment;
  failing: HealthCheck[];
}) {
  let icon = (
    <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-good" />
  );
  let label = "Healthy";
  let detail = `Last event ${deployment.lastEvent}`;
  if (deployment.status === "draft") {
    icon = (
      <span
        aria-hidden="true"
        className="mx-1 size-2 shrink-0 rounded-full bg-[oklch(0.8_0_0)]"
      />
    );
    label = "Not installed";
    detail = "Snippet ready";
  } else if (failing.length > 0) {
    icon = (
      <CircleAlert aria-hidden="true" className="size-4 shrink-0 text-warn" />
    );
    label = failing[0]?.label ?? "Needs attention";
    detail =
      failing.length === 1
        ? "1 check to fix"
        : `${failing.length} checks to fix`;
  }
  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-sm">
      {icon}
      <div>
        <div>{label}</div>
        <div className="c-label">{detail}</div>
      </div>
    </div>
  );
}

function AgentPagesList() {
  const { tenant } = useTenant();
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="c-label">
          Showing {agentPages.length} of {AGENTS_TOTAL} agents ·{" "}
          {UNCLAIMED_TOTAL} haven't claimed their page
        </span>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" type="button">
            Export list
          </button>
          <button className="btn btn-brand btn-sm" type="button">
            Invite {UNCLAIMED_TOTAL} to claim
          </button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <Th>Agent</Th>
            <Th>Page</Th>
            <Th>Status</Th>
            <Th align="right">Reports</Th>
            <Th align="right">Leads</Th>
          </tr>
        </thead>
        <tbody>
          {agentPages.map((a) => (
            <tr className="last:[&>td]:border-b-0" key={a.slug}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar initials={a.initials} photo={a.photo} size="sm" />
                  <span className="font-medium">{a.name}</span>
                </div>
              </Td>
              <Td>
                <span className="c-label">
                  {tenant.website}/agents/{a.slug}/home-value
                </span>
              </Td>
              <Td>
                {a.claimed ? (
                  <Pill dot tone="good">
                    Claimed
                  </Pill>
                ) : (
                  <Pill tone="warn">Unclaimed</Pill>
                )}
              </Td>
              <Td align="right">{a.reports}</Td>
              <Td align="right">{a.leads}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsTab({ deployment }: { deployment: Deployment }) {
  const [inherit, setInherit] = useState(deployment.settings.inherit);
  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3">
        <div>
          <div className="font-medium text-sm">
            Use the default configuration
          </div>
          <div className="c-label">
            Theme, sections, and copy from Customize.
          </div>
        </div>
        <Switch
          checked={inherit}
          label="Use the default configuration"
          onChange={setInherit}
        />
      </div>
      <div className={inherit ? "pointer-events-none opacity-50" : ""}>
        <Field
          hint="Overrides the default for this placement only."
          label="Sections shown"
        >
          <select
            className="field appearance-none"
            defaultValue={deployment.settings.sections}
          >
            <option>All sections</option>
            <option>Value, equity, buyers</option>
            <option>Value and buyers</option>
            <option>Value only</option>
          </select>
        </Field>
      </div>
      {deployment.settings.mode ? (
        <Field label="Widget mode">
          <select
            className="field appearance-none"
            defaultValue={deployment.settings.mode}
          >
            <option>Inline</option>
            <option>Modal</option>
          </select>
        </Field>
      ) : null}
      <Field label="Lead routing">
        <select
          className="field appearance-none"
          defaultValue={deployment.settings.routing}
        >
          <option>Round robin by ZIP</option>
          <option>Office default</option>
          <option>Page owner</option>
        </select>
      </Field>
      <Field
        hint="Shown as the source in Overview and sent to your CRM."
        label="Attribution label"
      >
        <input
          className="field"
          defaultValue={deployment.settings.source}
          type="text"
        />
      </Field>
      <div className="flex gap-2">
        <button className="btn btn-brand btn-sm" type="button">
          Save
        </button>
        <Link className="btn btn-ghost btn-sm" to="/app/customize">
          Open Customize
        </Link>
      </div>
    </div>
  );
}

function InstallTab({
  deployment,
  verifying,
  onVerify,
}: {
  deployment: Deployment;
  verifying: "idle" | "running" | "done";
  onVerify: () => void;
}) {
  const { tenant } = useTenant();
  const [copied, setCopied] = useState(false);

  if (deployment.kind === "hosted") {
    return (
      <div className="mt-5 space-y-4">
        <h3 className="c-label font-medium">DNS records</h3>
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
        <VerifyRow
          label="Re-check DNS and SSL"
          onVerify={onVerify}
          verifying={verifying}
        />
        <a
          className="btn btn-ghost btn-sm"
          href={`https://${deployment.name}`}
          rel="noopener"
          target="_blank"
        >
          Open site <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    );
  }

  if (deployment.kind === "agent") {
    return (
      <div className="mt-5 space-y-4">
        <p className="text-ink-muted text-sm">
          Agent pages are served by Reliance under your domain. Each agent gets
          a link to claim their page, which adds their photo, contact card, and
          lead routing.
        </p>
        <div className="rounded-[10px] bg-surface px-3.5 py-3 text-sm">
          <div className="c-label">Page pattern</div>
          <div className="font-mono text-xs">
            {tenant.website}/agents/&lt;agent&gt;/home-value
          </div>
        </div>
        <button className="btn btn-brand btn-sm" type="button">
          Invite {UNCLAIMED_TOTAL} agents to claim their page
        </button>
      </div>
    );
  }

  const snippet = `<script async src="https://cdn.reliance.com/home-report.js" data-site="${tenant.id}" data-mode="${(deployment.settings.mode ?? "inline").toLowerCase()}" data-source="${deployment.settings.source}"></script>\n<div id="reliance-home-report"></div>`;

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-[10px] bg-dark p-4 font-mono text-[0.75rem] text-canvas leading-relaxed">
        <pre className="whitespace-pre-wrap break-all">{snippet}</pre>
      </div>
      <button
        className="btn btn-ghost btn-sm"
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
        {copied ? "Copied" : "Copy snippet"}
      </button>
      <p className="c-label">
        Paste before the closing body tag of the page. WordPress and Squarespace
        users can paste it into a code block.
      </p>
      <VerifyRow
        label="Verify install"
        onVerify={onVerify}
        verifying={verifying}
      />
    </div>
  );
}

function VerifyRow({
  label,
  verifying,
  onVerify,
}: {
  label: string;
  verifying: "idle" | "running" | "done";
  onVerify: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-line px-3.5 py-3 text-sm">
      {verifying === "done" ? (
        <span className="flex items-center gap-2">
          <CircleCheck aria-hidden="true" className="size-4 text-good" />
          Checked just now. Everything is in place.
        </span>
      ) : (
        <span className="text-ink-muted">
          {verifying === "running"
            ? "Checking…"
            : "Runs the same checks shown in Overview."}
        </span>
      )}
      <button
        className="btn btn-ghost btn-sm"
        disabled={verifying === "running"}
        onClick={onVerify}
        type="button"
      >
        <RefreshCw
          aria-hidden="true"
          className={`size-3.5 ${verifying === "running" ? "animate-spin" : ""}`}
        />
        {label}
      </button>
    </div>
  );
}

/* ---------- Create flow ---------- */

const steps = ["Type", "Details", "Configuration"] as const;

function CreateDialog({
  ref,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
}) {
  const { tenant } = useTenant();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>("embed");
  const [inherit, setInherit] = useState(true);

  const close = () => {
    ref.current?.close();
    setStep(0);
  };

  return (
    <dialog
      aria-labelledby="create-title"
      className="m-auto w-[min(100%-2rem,34rem)] rounded-2xl bg-canvas p-0 text-ink shadow-frame backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      ref={ref}
    >
      <form
        className="p-6"
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < steps.length - 1) {
            setStep(step + 1);
          } else {
            close();
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="c-section" id="create-title">
              New site or embed
            </h2>
            <ol className="mt-1 flex gap-3 text-xs">
              {steps.map((s, i) => (
                <li
                  className={
                    i === step ? "font-medium text-ink" : "text-ink-muted"
                  }
                  key={s}
                >
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </div>
          <button
            aria-label="Close"
            className="-mt-1 -mr-2 rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink"
            onClick={close}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        {step === 0 ? (
          <fieldset className="mt-5 space-y-2">
            <legend className="sr-only">Deployment type</legend>
            {(["hosted", "embed", "agent"] as Kind[]).map((k) => {
              const meta = kindMeta[k];
              return (
                <label
                  className={`flex cursor-pointer gap-3 rounded-[12px] border p-3.5 transition-colors ${
                    kind === k
                      ? "border-brand bg-brand-soft/50"
                      : "border-line hover:bg-surface"
                  }`}
                  key={k}
                >
                  <input
                    checked={kind === k}
                    className="sr-only"
                    name="kind"
                    onChange={() => setKind(k)}
                    type="radio"
                  />
                  <meta.icon
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-brand"
                  />
                  <span>
                    <span className="block font-medium text-sm">
                      {meta.label}
                    </span>
                    <span className="c-label mt-0.5 block">{meta.body}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        ) : null}

        {step === 1 ? (
          <div className="mt-5 space-y-4">
            <Field label="Name">
              <input
                className="field"
                defaultValue={kind === "agent" ? "Agent pages" : ""}
                placeholder="Spring campaign landing page"
                type="text"
              />
            </Field>
            {kind === "hosted" ? (
              <Field
                hint="We'll give you the DNS records on the next screen."
                label="Domain"
              >
                <input
                  className="field"
                  placeholder={`homevalue.${tenant.website}`}
                  type="text"
                />
              </Field>
            ) : null}
            {kind === "embed" ? (
              <>
                <Field
                  hint="Used to verify the install and to attribute reports."
                  label="Page URL"
                >
                  <input
                    className="field"
                    placeholder={`https://${tenant.website}/sell-your-home`}
                    type="url"
                  />
                </Field>
                <Field label="Widget mode">
                  <select
                    className="field appearance-none"
                    defaultValue="Inline"
                  >
                    <option>Inline</option>
                    <option>Modal</option>
                  </select>
                </Field>
              </>
            ) : null}
            {kind === "agent" ? (
              <Field
                hint="Each agent gets a page at this pattern."
                label="Page pattern"
              >
                <input
                  className="field font-mono text-sm"
                  defaultValue={`${tenant.website}/agents/<agent>/home-value`}
                  type="text"
                />
              </Field>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3">
              <div>
                <div className="font-medium text-sm">
                  Use the default configuration
                </div>
                <div className="c-label">
                  Theme, sections, and copy from Customize. You can override
                  later.
                </div>
              </div>
              <Switch
                checked={inherit}
                label="Use the default configuration"
                onChange={setInherit}
              />
            </div>
            <Field label="Lead routing">
              <select
                className="field appearance-none"
                defaultValue="Round robin by ZIP"
              >
                <option>Round robin by ZIP</option>
                <option>Office default</option>
                {kind === "agent" ? <option>Page owner</option> : null}
              </select>
            </Field>
            <Field
              hint="Shown as the source in Overview and sent to your CRM."
              label="Attribution label"
            >
              <input
                className="field"
                defaultValue={kindMeta[kind].label}
                type="text"
              />
            </Field>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <button
            className="btn btn-ghost btn-sm"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            type="button"
          >
            Back
          </button>
          <button className="btn btn-brand btn-sm" type="submit">
            {step === steps.length - 1
              ? "Create and show install steps"
              : "Continue"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
