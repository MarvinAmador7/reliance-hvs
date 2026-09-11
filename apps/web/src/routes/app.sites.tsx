import { createFileRoute, Link } from "@tanstack/react-router";
import { Code, Globe, Plus, UsersRound } from "lucide-react";

import { Panel, Pill, Td, Th } from "@/components/console/ui";
import { sites } from "@/lib/mock-data";

export const Route = createFileRoute("/app/sites")({
  component: SitesPage,
});

const kindIcon = {
  "Hosted site": Globe,
  "Website embed": Code,
  "Agent pages": UsersRound,
} as const;

const channelsExplained = [
  {
    icon: Globe,
    title: "Hosted site",
    body: "Reliance serves the full page on your domain. Header, footer, and legal text are composed from blocks you control in Customize.",
  },
  {
    icon: Code,
    title: "Website embed",
    body: "One script tag on any page of your site. The search box and report render inline or in a modal, with the same configuration as the hosted site.",
  },
  {
    icon: UsersRound,
    title: "Agent pages",
    body: "Every agent gets a branded version of the site with their own contact card, so leads route to the right person.",
  },
] as const;

function SitesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="c-title">Sites & widgets</h1>
          <p className="c-label mt-1">
            Every place your home value experience is live, and how each one
            performs.
          </p>
        </div>
        <button className="btn btn-brand btn-sm" type="button">
          <Plus aria-hidden="true" className="size-4" />
          New site or embed
        </button>
      </div>

      <Panel flush>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Deployment</Th>
                <Th>Status</Th>
                <Th align="right">Reports, 30d</Th>
                <Th align="right">Leads, 30d</Th>
                <Th align="right">Report to lead</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => {
                const Icon = kindIcon[s.kind];
                return (
                  <tr className="last:[&>td]:border-b-0" key={s.name}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface text-ink-muted">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium">{s.name}</div>
                          <div className="c-label">
                            {s.kind} · {s.detail}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Pill dot tone={s.status === "Live" ? "good" : "neutral"}>
                        {s.status}
                      </Pill>
                    </Td>
                    <Td align="right">{s.reports.toLocaleString("en-US")}</Td>
                    <Td align="right">{s.leads}</Td>
                    <Td align="right">{s.rate}</Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          className="btn btn-ghost btn-sm"
                          to="/app/customize"
                        >
                          Customize
                        </Link>
                        <Link
                          className="btn btn-ghost btn-sm"
                          to="/app/distribution"
                        >
                          Install
                        </Link>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        {channelsExplained.map((c) => (
          <div
            className="flex gap-3.5 rounded-[14px] bg-surface p-5"
            key={c.title}
          >
            <c.icon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-brand"
            />
            <div>
              <h2 className="font-semibold">{c.title}</h2>
              <p className="mt-1 text-ink-muted text-sm leading-relaxed">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
