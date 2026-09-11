import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";

import { HBars } from "@/components/charts/hbars";
import { LineChart } from "@/components/charts/line-chart";
import { StatTile } from "@/components/console/stat-tile";
import { Panel, Pill, Segmented, Td, Th } from "@/components/console/ui";
import {
  channels,
  daily,
  fmtMoney,
  funnel,
  intent,
  kpis,
  type LeadStatus,
  leads,
  sources,
  topAreas,
} from "@/lib/mock-data";

const statusTone = (status: LeadStatus) => {
  if (status === "New") {
    return "brand" as const;
  }
  return status === "Synced" ? ("good" as const) : ("neutral" as const);
};

export const Route = createFileRoute("/app/")({
  component: Overview,
});

const ranges = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
] as const;

const dayLabels = daily.map((d) =>
  d.day + 10 <= 31 ? `Aug ${d.day + 10}` : `Sep ${d.day - 21}`
);

function Overview() {
  const [range, setRange] = useState<(typeof ranges)[number]["value"]>("30d");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="c-title">Overview</h1>
          <p className="c-label mt-1">
            How your home value site is performing as a line of business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            label="Date range"
            onChange={setRange}
            options={ranges}
            value={range}
          />
          <button className="btn btn-ghost btn-sm" type="button">
            <Download aria-hidden="true" className="size-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <StatTile key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          sub="Reports are address selections; leads are any captured contact."
          title="Reports and leads, daily"
        >
          <LineChart
            height={240}
            labels={dayLabels}
            series={[
              {
                name: "Reports",
                data: daily.map((d) => d.reports),
                color: "#2a78d6",
              },
              {
                name: "Leads",
                data: daily.map((d) => d.leads),
                color: "#eb6834",
              },
            ]}
          />
        </Panel>
        <Panel
          sub="Where visitors drop off before becoming a lead."
          title="From visit to lead"
        >
          <HBars emphasizeLast rows={funnel} share />
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel
          sub="Reports by distribution channel"
          title="Where reports come from"
        >
          <HBars dense rows={channels} />
          <p className="c-label mt-4">
            Channel is set by the site or embed that generated the report, so
            hosted pages and widgets are always attributable.
          </p>
        </Panel>
        <Panel
          sub="First-touch source, from UTM or referrer"
          title="Traffic sources"
        >
          <HBars color="#2a78d6" dense rows={sources} />
        </Panel>
        <Panel
          sub="Answered by leads who requested a visit"
          title="When leads plan to sell"
        >
          <HBars color="#eb6834" dense rows={intent} />
          <p className="c-label mt-4">
            <span className="font-medium text-ink">94</span> homeowners said
            they're selling within 3 months.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Panel flush sub="By ZIP of the address searched" title="Top areas">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Area</Th>
                  <Th align="right">Reports</Th>
                  <Th align="right">Leads</Th>
                  <Th align="right">Rate</Th>
                  <Th align="right">Buyer matches</Th>
                </tr>
              </thead>
              <tbody>
                {topAreas.map((a) => (
                  <tr className="last:[&>td]:border-b-0" key={a.zip}>
                    <Td>
                      <span className="font-medium">{a.name}</span>
                      <span className="ml-2 text-ink-muted">{a.zip}</span>
                    </Td>
                    <Td align="right">{a.reports.toLocaleString("en-US")}</Td>
                    <Td align="right">{a.leads}</Td>
                    <Td align="right">
                      {((a.leads / a.reports) * 100).toFixed(1)}%
                    </Td>
                    <Td align="right">{a.matches}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          action={
            <Link className="btn btn-ghost btn-sm" to="/app/leads">
              All leads
            </Link>
          }
          flush
          sub="Newest first"
          title="Recent leads"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Lead</Th>
                  <Th>Home</Th>
                  <Th>Selling</Th>
                  <Th>Source</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((l) => (
                  <tr className="last:[&>td]:border-b-0" key={l.id}>
                    <Td>
                      <div className="font-medium">{l.name}</div>
                      <div className="c-label">{l.when}</div>
                    </Td>
                    <Td>
                      <div>{l.address}</div>
                      <div className="c-label tabular">
                        {fmtMoney(l.value, true)}
                      </div>
                    </Td>
                    <Td>{l.intent}</Td>
                    <Td>{l.source}</Td>
                    <Td>
                      <Pill dot tone={statusTone(l.status)}>
                        {l.status}
                      </Pill>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
