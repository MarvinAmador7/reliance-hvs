import { createFileRoute } from "@tanstack/react-router";
import { Download, ExternalLink, ListFilter, Search } from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  Panel,
  Pill,
  Segmented,
  Td,
  Th,
} from "@/components/console/ui";
import { fmtMoney, type LeadStatus, leads } from "@/lib/mock-data";

export const Route = createFileRoute("/app/leads")({
  component: LeadsPage,
});

const statusOptions = [
  { value: "all", label: "All" },
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Synced", label: "Synced" },
] as const;

type StatusFilter = (typeof statusOptions)[number]["value"];

const tone = (status: LeadStatus) => {
  if (status === "New") {
    return "brand" as const;
  }
  return status === "Synced" ? ("good" as const) : ("neutral" as const);
};

function LeadsPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState(leads[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = leads.filter(
    (l) =>
      (filter === "all" || l.status === filter) &&
      (q === "" ||
        `${l.name} ${l.address} ${l.email}`.toLowerCase().includes(q))
  );
  const selected = leads.find((l) => l.id === selectedId) ?? visible[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="c-title">Leads</h1>
          <p className="c-label mt-1">
            486 leads in the last 30 days · 94 want to sell within 3 months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" type="button">
            <ListFilter aria-hidden="true" className="size-4" />
            Filters
          </button>
          <button className="btn btn-ghost btn-sm" type="button">
            <Download aria-hidden="true" className="size-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="min-w-0" flush>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
            <Segmented
              label="Status"
              onChange={setFilter}
              options={statusOptions}
              value={filter}
            />
            <label className="relative">
              <span className="sr-only">Search leads</span>
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
              />
              <input
                className="field h-8 w-56 pl-8 text-sm"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or address"
                type="search"
                value={query}
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Lead</Th>
                  <Th>Home</Th>
                  <Th>Selling</Th>
                  <Th>Agent</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((l) => {
                  const isSelected = selected?.id === l.id;
                  return (
                    <tr
                      aria-selected={isSelected}
                      className={`cursor-pointer transition-colors last:[&>td]:border-b-0 ${
                        isSelected ? "bg-brand-soft/60" : "hover:bg-surface"
                      }`}
                      key={l.id}
                      onClick={() => setSelectedId(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(l.id);
                        }
                      }}
                      tabIndex={0}
                    >
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
                      <Td
                        className={
                          l.agent === "Unassigned" ? "text-ink-muted" : ""
                        }
                      >
                        {l.agent}
                      </Td>
                      <Td>
                        <Pill dot tone={tone(l.status)}>
                          {l.status}
                        </Pill>
                      </Td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-ink-muted"
                      colSpan={5}
                    >
                      No leads match. Try a different status or search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {selected ? (
          <Panel className="self-start xl:sticky xl:top-20">
            <div className="flex items-start gap-3">
              <Avatar
                initials={selected.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              />
              <div className="min-w-0 flex-1">
                <h2 className="c-section">{selected.name}</h2>
                <p className="c-label">
                  {selected.email} · {selected.phone}
                </p>
              </div>
              <Pill dot tone={tone(selected.status)}>
                {selected.status}
              </Pill>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="c-label">Home</dt>
                <dd className="mt-0.5 font-medium">{selected.address}</dd>
              </div>
              <div>
                <dt className="c-label">Estimated value</dt>
                <dd className="tabular mt-0.5 font-medium">
                  {fmtMoney(selected.value)}
                </dd>
              </div>
              <div>
                <dt className="c-label">Selling timeline</dt>
                <dd className="mt-0.5 font-medium">{selected.intent}</dd>
              </div>
              <div>
                <dt className="c-label">Assigned agent</dt>
                <dd className="mt-0.5 font-medium">{selected.agent}</dd>
              </div>
              <div>
                <dt className="c-label">Source · channel</dt>
                <dd className="mt-0.5 font-medium">
                  {selected.source} · {selected.channel}
                </dd>
              </div>
              <div>
                <dt className="c-label">Device</dt>
                <dd className="mt-0.5 font-medium">{selected.device}</dd>
              </div>
            </dl>

            <h3 className="c-label mt-6 mb-2 font-medium">What they did</h3>
            <ol className="border-line border-l">
              {selected.events.map((e) => (
                <li
                  className="relative pb-3 pl-4 last:pb-0"
                  key={e.t + e.label}
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[4.5px] size-2 rounded-full bg-canvas ring-2 ring-brand"
                  />
                  <div className="text-sm">
                    <span className="tabular mr-2 text-ink-muted">{e.t}</span>
                    {e.label}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn btn-brand btn-sm" type="button">
                Assign agent
              </button>
              <button className="btn btn-ghost btn-sm" type="button">
                Mark contacted
              </button>
              <a
                className="btn btn-ghost btn-sm"
                href="/hvs/report"
                rel="noopener"
                target="_blank"
              >
                Open report
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
