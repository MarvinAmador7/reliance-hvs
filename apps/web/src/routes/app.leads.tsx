import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  Download,
  ExternalLink,
  Eye,
  Flame,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import {
  Avatar,
  Panel,
  Pill,
  Segmented,
  Td,
  Th,
} from "@/components/console/ui";
import { fmtMoney, type Lead, leads, photos } from "@/lib/mock-data";
import { track } from "@/lib/track";

export const Route = createFileRoute("/app/leads")({
  component: LeadsPage,
});

/* ---------- Enriched mock model ---------- */

type LeadType = "Consult" | "Watch" | "Claimed" | "Buyers";

interface AgentAction {
  by: string;
  kind: "note" | "call" | "email" | "system";
  label: string;
  t: string;
}

interface Watch {
  lastOpened?: string;
  next: string;
  opened: number;
  sent: number;
  since: string;
}

interface Extra {
  actions: AgentAction[];
  crm: { status: "Synced" | "Pending" | "Not sent"; id?: string };
  equity: number;
  nextStep: string;
  photo: string;
  reasons: string[];
  score: number;
  type: LeadType;
  watch?: Watch;
}

const fallbackExtra: Extra = {
  actions: [],
  crm: { status: "Not sent" },
  equity: 0,
  nextStep: "Assign an agent.",
  photo: photos.comps[3],
  reasons: [],
  score: 20,
  type: "Watch",
};

const extras: Record<string, Extra> = {
  "L-4816": {
    actions: [
      {
        by: "System",
        kind: "system",
        label: "Pushed to CRM",
        t: "Sep 8, 7:54 pm",
      },
      {
        by: "Luis Ferrer",
        kind: "call",
        label: "Called, left voicemail",
        t: "Sep 9, 9:10 am",
      },
      {
        by: "Luis Ferrer",
        kind: "note",
        label:
          "Neighbor of a past client. Wants a CMA before listing in November.",
        t: "Sep 9, 9:12 am",
      },
    ],
    crm: { id: "FUB-88104", status: "Synced" },
    equity: 1_725_000 - 610_000,
    nextStep: "Follow up on the voicemail; offer a Saturday visit.",
    photo: photos.comps[1],
    reasons: [
      "Selling within 3 months",
      "Requested a visit",
      "Returned twice this week",
    ],
    score: 88,
    type: "Consult",
  },
  "L-4817": {
    actions: [
      {
        by: "System",
        kind: "system",
        label: "Pushed to CRM",
        t: "Sep 9, 12:24 pm",
      },
    ],
    crm: { id: "FUB-88110", status: "Synced" },
    equity: 890_000 - 512_000,
    nextStep:
      "Low intent. Let the monthly update do the work; check back in 60 days.",
    photo: photos.comps[3],
    reasons: ["Subscribed to monthly updates", "Just curious"],
    score: 24,
    watch: { next: "Oct 1", opened: 0, sent: 0, since: "Sep 9" },
    type: "Watch",
  },
  "L-4818": {
    actions: [
      {
        by: "System",
        kind: "system",
        label: "Pushed to CRM",
        t: "Sep 9, 5:06 pm",
      },
      {
        by: "Dana Whitfield",
        kind: "email",
        label: "Sent the buyer list and a Coral Gables comp sheet",
        t: "Sep 9, 6:40 pm",
      },
    ],
    crm: { id: "FUB-88121", status: "Synced" },
    equity: 1_560_000 - 402_000,
    nextStep: "Ask which of the 19 buyers they'd like introduced.",
    photo: photos.comps[0],
    reasons: [
      "Viewed 19 buyer matches",
      "Selling in 3 to 6 months",
      "Came back from the monthly email",
    ],
    score: 76,
    watch: {
      lastOpened: "Sep 9, 5:02 pm",
      next: "Oct 1",
      opened: 3,
      sent: 3,
      since: "Jun 2",
    },
    type: "Buyers",
  },
  "L-4819": {
    actions: [
      {
        by: "Luis Ferrer",
        kind: "call",
        label: "Spoke for 12 minutes. Wants to finish the kitchen first.",
        t: "Sep 10, 10:02 am",
      },
      {
        by: "Luis Ferrer",
        kind: "note",
        label: "Set a reminder for March.",
        t: "Sep 10, 10:05 am",
      },
    ],
    crm: { status: "Pending" },
    equity: 2_140_000 - 780_000,
    nextStep:
      "Send the condition guide; they claimed the home and set it to Excellent.",
    photo: photos.comps[2],
    reasons: [
      "Claimed the home",
      "Adjusted condition to Excellent",
      "Selling in 6 to 12 months",
    ],
    score: 61,
    watch: { next: "Oct 1", opened: 0, sent: 0, since: "Sep 10" },
    type: "Claimed",
  },
  "L-4820": {
    actions: [],
    crm: { status: "Not sent" },
    equity: 918_000 - 455_000,
    nextStep:
      "Assign an agent; unlocked buyer matches from a Meta ad 38 minutes ago.",
    photo: photos.comps[3],
    reasons: ["Unlocked buyer matches", "First visit, from a Meta ad"],
    score: 42,
    type: "Buyers",
  },
  "L-4821": {
    actions: [],
    crm: { status: "Not sent" },
    equity: 1_284_000 - 486_000,
    nextStep:
      "Call within the hour. Requested a visit and is selling within 3 months.",
    photo: photos.subject,
    reasons: [
      "Selling within 3 months",
      "Requested a visit",
      "Used the sale-price slider 3 times",
    ],
    score: 94,
    type: "Consult",
  },
};

interface Row extends Lead {
  extra: Extra;
}

const rows: Row[] = leads.map((l) => ({
  ...l,
  extra: extras[l.id] ?? fallbackExtra,
}));

const HOT_THRESHOLD = 75;

interface AgentOption {
  coverage: string;
  load: number;
  name: string;
  photo?: string;
  response: string;
  suggested?: boolean;
}

const agents: AgentOption[] = [
  {
    coverage: "33133, 33146",
    load: 12,
    name: "Dana Whitfield",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    response: "22 min",
    suggested: true,
  },
  {
    coverage: "33143, 33156",
    load: 9,
    name: "Luis Ferrer",
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    response: "41 min",
  },
  { coverage: "33129", load: 5, name: "Ana Reyes", response: "1 h 10 min" },
  { coverage: "33133", load: 7, name: "James Kim", response: "35 min" },
];

const views = [
  { label: "All", value: "all" },
  { label: "Needs assignment", value: "unassigned" },
  { label: "Hot this week", value: "hot" },
  { label: "New", value: "new" },
  { label: "Watching", value: "watching" },
] as const;
type View = (typeof views)[number]["value"];

const sorts = [
  { label: "Newest", value: "newest" },
  { label: "Highest intent", value: "score" },
] as const;
type Sort = (typeof sorts)[number]["value"];

const typeTone: Record<LeadType, "brand" | "neutral" | "good" | "warn"> = {
  Buyers: "brand",
  Claimed: "good",
  Consult: "warn",
  Watch: "neutral",
};

const statusTone = (status: Lead["status"]): "brand" | "good" | "neutral" => {
  if (status === "New") {
    return "brand";
  }
  return status === "Synced" ? "good" : "neutral";
};

const scoreTone = (score: number): string => {
  if (score >= HOT_THRESHOLD) {
    return "bg-[oklch(0.94_0.06_40)] text-[oklch(0.45_0.15_35)]";
  }
  if (score >= 50) {
    return "bg-brand-soft text-brand";
  }
  return "bg-surface text-ink-muted";
};

const selectedIds = (row: Row | undefined): string[] => (row ? [row.id] : []);

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");

interface Filters {
  agent: string;
  area: string;
  source: string;
  timeline: string;
  type: string;
}

const emptyFilters: Filters = {
  agent: "",
  area: "",
  source: "",
  timeline: "",
  type: "",
};

const matchesView = (row: Row, view: View, assigned: string): boolean => {
  if (view === "unassigned") {
    return assigned === "Unassigned";
  }
  if (view === "hot") {
    return row.extra.score >= HOT_THRESHOLD;
  }
  if (view === "new") {
    return row.status === "New";
  }
  if (view === "watching") {
    return row.extra.watch !== undefined;
  }
  return true;
};

const matchesFilters = (row: Row, f: Filters, assigned: string): boolean =>
  (f.type === "" || row.extra.type === f.type) &&
  (f.source === "" || row.source === f.source) &&
  (f.agent === "" || assigned === f.agent) &&
  (f.area === "" || row.area === f.area) &&
  (f.timeline === "" || row.intent === f.timeline);

/* ---------- Page ---------- */

function LeadsPage() {
  const [view, setView] = useState<View>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, AgentAction[]>>({});
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const assignRef = useRef<HTMLDialogElement>(null);

  const agentOf = (row: Row) => assignments[row.id] ?? row.agent;
  const q = query.trim().toLowerCase();
  const filtered = rows
    .filter(
      (r) =>
        matchesView(r, view, agentOf(r)) &&
        matchesFilters(r, filters, agentOf(r)) &&
        (q === "" ||
          `${r.name} ${r.address} ${r.email}`.toLowerCase().includes(q))
    )
    .sort((a, b) => (sort === "score" ? b.extra.score - a.extra.score : 0));

  const selected = rows.find((r) => r.id === selectedId) ?? filtered[0];
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const counts = {
    hot: rows.filter((r) => r.extra.score >= HOT_THRESHOLD).length,
    newToday: rows.filter(
      (r) => r.when.includes("min") || r.when.includes("h ago")
    ).length,
    unassigned: rows.filter((r) => agentOf(r) === "Unassigned").length,
  };
  const toggleView = (v: View) => setView(view === v ? "all" : v);
  const setFilter = (key: keyof Filters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const uniq = (pick: (r: Row) => string) => [...new Set(rows.map(pick))];

  const toggleAll = () =>
    setChecked((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered.map((r) => r.id))
    );

  const toggleOne = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const addNote = (text: string) => {
    if (!selected) {
      return;
    }
    const note: AgentAction = {
      by: "Maya Ortiz",
      kind: "note",
      label: text,
      t: "Just now",
    };
    setNotes((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), note],
    }));
    track("lead_note_added", selected.name);
  };

  const assign = (name: string) => {
    const ids = checked.size > 0 ? [...checked] : selectedIds(selected);
    setAssignments((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        next[id] = name;
      }
      return next;
    });
    setChecked(new Set());
    assignRef.current?.close();
    track("lead_assigned", `${ids.length} to ${name}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="c-title">Leads</h1>
          <p className="c-label mt-1">
            486 in the last 30 days. Every homeowner who left contact details,
            ranked by how ready they are to sell.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" type="button">
          <Download aria-hidden="true" className="size-4" />
          Export CSV
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatButton
          active={view === "new"}
          label="New today"
          note="Since midnight"
          onClick={() => toggleView("new")}
          value={String(counts.newToday)}
        />
        <StatButton
          active={view === "unassigned"}
          label="Needs assignment"
          note="No agent yet"
          onClick={() => toggleView("unassigned")}
          value={String(counts.unassigned)}
        />
        <StatButton
          active={view === "hot"}
          label="Hot leads"
          note={`Intent score ${HOT_THRESHOLD}+`}
          onClick={() => toggleView("hot")}
          value={String(counts.hot)}
        />
        <StatButton
          label="Median time to first contact"
          note="Last 30 days · target 30 min"
          value="38 min"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel className="min-w-0" flush>
          <div className="space-y-3 px-5 pt-5 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Segmented
                label="Saved view"
                onChange={setView}
                options={views}
                value={view}
              />
              <div className="flex items-center gap-2">
                <Segmented
                  label="Sort"
                  onChange={setSort}
                  options={sorts}
                  value={sort}
                />
                <label className="relative">
                  <span className="sr-only">Search leads</span>
                  <Search
                    aria-hidden="true"
                    className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
                  />
                  <input
                    className="field h-8 w-48 pl-8 text-sm"
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name or address"
                    type="search"
                    value={query}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterSelect
                label="Type"
                onChange={setFilter("type")}
                options={["Consult", "Watch", "Claimed", "Buyers"]}
                value={filters.type}
              />
              <FilterSelect
                label="Source"
                onChange={setFilter("source")}
                options={uniq((r) => r.source)}
                value={filters.source}
              />
              <FilterSelect
                label="Agent"
                onChange={setFilter("agent")}
                options={[
                  ...new Set([
                    ...uniq((r) => r.agent),
                    ...agents.map((a) => a.name),
                  ]),
                ]}
                value={filters.agent}
              />
              <FilterSelect
                label="Area"
                onChange={setFilter("area")}
                options={uniq((r) => r.area)}
                value={filters.area}
              />
              <FilterSelect
                label="Selling"
                onChange={setFilter("timeline")}
                options={uniq((r) => r.intent)}
                value={filters.timeline}
              />
              {activeFilters > 0 ? (
                <button
                  className="c-label inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-ink"
                  onClick={() => setFilters(emptyFilters)}
                  type="button"
                >
                  <X aria-hidden="true" className="size-3" /> Clear{" "}
                  {activeFilters}
                </button>
              ) : null}
            </div>
          </div>

          {checked.size > 0 ? (
            <BulkBar
              count={checked.size}
              onAssign={() => assignRef.current?.showModal()}
              onClear={() => setChecked(new Set())}
            />
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    className="border-line border-b px-3 py-2 text-left"
                    scope="col"
                  >
                    <input
                      aria-label="Select all"
                      checked={
                        filtered.length > 0 && checked.size === filtered.length
                      }
                      className="size-4 accent-[var(--c-brand)]"
                      onChange={toggleAll}
                      type="checkbox"
                    />
                  </th>
                  <Th>Lead</Th>
                  <Th>Type</Th>
                  <Th>Intent</Th>
                  <Th>Home</Th>
                  <Th>Agent</Th>
                  <th
                    className="c-label hidden whitespace-nowrap border-line border-b px-3 py-2 text-left font-medium 2xl:table-cell"
                    scope="col"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <LeadRow
                    agent={agentOf(r)}
                    checked={checked.has(r.id)}
                    key={r.id}
                    onCheck={() => toggleOne(r.id)}
                    onSelect={() => setSelectedId(r.id)}
                    row={r}
                    selected={selected?.id === r.id}
                  />
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-ink-muted"
                      colSpan={7}
                    >
                      No leads match. Try a different view or clear the filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        {selected ? (
          <LeadDetail
            agent={agentOf(selected)}
            notes={notes[selected.id] ?? []}
            onAddNote={addNote}
            onAssign={() => assignRef.current?.showModal()}
            row={selected}
          />
        ) : null}
      </div>

      <dialog
        aria-labelledby="assign-title"
        className="m-auto w-[min(100%-2rem,30rem)] rounded-2xl bg-canvas p-0 text-ink shadow-frame backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        ref={assignRef}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="c-section" id="assign-title">
                Assign{" "}
                {checked.size > 1
                  ? `${checked.size} leads`
                  : (selected?.name ?? "lead")}
              </h2>
              <p className="c-label mt-0.5">
                Round robin suggests the agent with coverage and the lightest
                load.
              </p>
            </div>
            <button
              aria-label="Close"
              className="-mt-1 -mr-2 rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink"
              onClick={() => assignRef.current?.close()}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {agents.map((a) => (
              <li className="flex items-center gap-3 py-3" key={a.name}>
                <Avatar initials={initialsOf(a.name)} photo={a.photo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    {a.name}
                    {a.suggested ? <Pill tone="brand">Suggested</Pill> : null}
                  </div>
                  <div className="c-label">
                    Covers {a.coverage} · {a.load} open leads · replies in{" "}
                    {a.response}
                  </div>
                </div>
                <button
                  className={`btn btn-sm ${a.suggested ? "btn-brand" : "btn-ghost"}`}
                  onClick={() => assign(a.name)}
                  type="button"
                >
                  Assign
                </button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
}

/* ---------- Pieces ---------- */

function LeadRow({
  row,
  agent,
  selected,
  checked,
  onSelect,
  onCheck,
}: {
  row: Row;
  agent: string;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onCheck: () => void;
}) {
  return (
    <tr
      aria-selected={selected}
      className={`cursor-pointer transition-colors last:[&>td]:border-b-0 ${selected ? "bg-brand-soft/60" : "hover:bg-surface"}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
    >
      <td className="border-line border-b px-3 py-2.5">
        <input
          aria-label={`Select ${row.name}`}
          checked={checked}
          className="size-4 accent-[var(--c-brand)]"
          onChange={onCheck}
          onClick={(e) => e.stopPropagation()}
          type="checkbox"
        />
      </td>
      <Td>
        <div className="flex items-center gap-1.5 whitespace-nowrap font-medium">
          {row.name}
          {row.extra.watch ? (
            <Eye
              aria-label="Watching monthly updates"
              className="size-3.5 text-ink-muted"
            />
          ) : null}
          {row.extra.score >= HOT_THRESHOLD ? (
            <Flame
              aria-label="Hot lead"
              className="size-3.5 text-[oklch(0.62_0.18_35)]"
            />
          ) : null}
        </div>
        <div className="c-label">{row.when}</div>
      </Td>
      <Td>
        <Pill tone={typeTone[row.extra.type]}>{row.extra.type}</Pill>
      </Td>
      <Td>
        <span
          className={`tabular inline-flex h-6 min-w-9 items-center justify-center rounded-full px-2 font-semibold text-xs ${scoreTone(row.extra.score)}`}
          title={row.extra.reasons.join(" · ")}
        >
          {row.extra.score}
        </span>
      </Td>
      <Td>
        <div className="max-w-[14rem] truncate">{row.address}</div>
        <div className="c-label tabular">{fmtMoney(row.value, true)}</div>
      </Td>
      <Td className={agent === "Unassigned" ? "text-ink-muted" : ""}>
        {agent}
      </Td>
      <td className="hidden border-line border-b px-3 py-2.5 2xl:table-cell">
        <Pill dot tone={statusTone(row.status)}>
          {row.status}
        </Pill>
      </td>
    </tr>
  );
}

function BulkBar({
  count,
  onAssign,
  onClear,
}: {
  count: number;
  onAssign: () => void;
  onClear: () => void;
}) {
  const cls = "btn btn-sm bg-canvas/12 text-canvas hover:bg-canvas/20";
  return (
    <div className="mx-5 mb-2 flex flex-wrap items-center gap-2 rounded-[10px] bg-ink px-3 py-2 text-canvas text-sm">
      <span className="mr-2 font-medium">{count} selected</span>
      <button className={cls} onClick={onAssign} type="button">
        <UserRound aria-hidden="true" className="size-3.5" /> Assign
      </button>
      <button className={cls} onClick={onClear} type="button">
        <Check aria-hidden="true" className="size-3.5" /> Mark contacted
      </button>
      <button className={cls} type="button">
        <Send aria-hidden="true" className="size-3.5" /> Push to CRM
      </button>
      <button className={cls} type="button">
        <Download aria-hidden="true" className="size-3.5" /> Export
      </button>
      <button
        aria-label="Clear selection"
        className="ml-auto rounded p-1 text-canvas/70 hover:text-canvas"
        onClick={onClear}
        type="button"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

function LeadDetail({
  row,
  agent,
  notes,
  onAddNote,
  onAssign,
}: {
  row: Row;
  agent: string;
  notes: AgentAction[];
  onAddNote: (text: string) => void;
  onAssign: () => void;
}) {
  const [draft, setDraft] = useState("");
  const assignLabel = agent === "Unassigned" ? "Assign" : agent;
  const activity = [
    ...row.events.map((e) => ({
      by: "Homeowner",
      kind: "homeowner" as const,
      label: e.label,
      t: e.t,
    })),
    ...row.extra.actions,
    ...notes,
  ];

  return (
    <Panel className="self-start xl:sticky xl:top-6">
      <div className="flex items-start gap-3">
        <Avatar initials={initialsOf(row.name)} />
        <div className="min-w-0 flex-1">
          <h2 className="c-section flex items-center gap-1.5">
            {row.name}
            {row.extra.score >= HOT_THRESHOLD ? (
              <Flame
                aria-label="Hot lead"
                className="size-4 text-[oklch(0.62_0.18_35)]"
              />
            ) : null}
          </h2>
          <p className="c-label">
            {row.extra.type} · {row.when} · {row.source} · {row.channel}
          </p>
        </div>
        <Pill dot tone={statusTone(row.status)}>
          {row.status}
        </Pill>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          className="btn btn-brand btn-sm"
          href={`tel:${row.phone.replace(/\D/g, "")}`}
        >
          <Phone aria-hidden="true" className="size-3.5" /> Call
        </a>
        <a className="btn btn-ghost btn-sm" href={`mailto:${row.email}`}>
          <Mail aria-hidden="true" className="size-3.5" /> Email
        </a>
        <button className="btn btn-ghost btn-sm" type="button">
          <MessageSquare aria-hidden="true" className="size-3.5" /> Text
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onAssign}
          type="button"
        >
          <UserRound aria-hidden="true" className="size-3.5" /> {assignLabel}
        </button>
      </div>

      <div className="mt-5 flex gap-3 rounded-[12px] border border-line p-3">
        <img
          alt=""
          className="size-16 shrink-0 rounded-[10px] object-cover"
          height={64}
          src={row.extra.photo}
          width={64}
        />
        <div className="min-w-0 flex-1 text-sm">
          <div className="truncate font-medium">{row.address}</div>
          <div className="c-label">{row.area}</div>
          <div className="mt-1.5 flex gap-4">
            <span>
              <span className="c-label">Value </span>
              <span className="tabular font-medium">
                {fmtMoney(row.value, true)}
              </span>
            </span>
            <span>
              <span className="c-label">Equity </span>
              <span className="tabular font-medium">
                {fmtMoney(row.extra.equity, true)}
              </span>
            </span>
          </div>
        </div>
        <Link
          className="self-center text-ink-muted hover:text-ink"
          title="Open report"
          to="/home-report/2148-bayshore-lane"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="mt-4 rounded-[12px] bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Seller intent</span>
          <span
            className={`tabular inline-flex h-6 items-center rounded-full px-2 font-semibold text-xs ${scoreTone(row.extra.score)}`}
          >
            {row.extra.score} / 100
          </span>
        </div>
        <ul className="mt-2 space-y-1 text-sm">
          {row.extra.reasons.map((r) => (
            <li className="flex items-center gap-2" key={r}>
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 text-brand"
              />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-line border-t pt-2 text-sm">
          <span className="c-label">Next step · </span>
          {row.extra.nextStep}
        </p>
      </div>

      <div className="mt-4 rounded-[12px] border border-line p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-sm">
            <Eye aria-hidden="true" className="size-4 text-ink-muted" />
            Monthly updates
          </span>
          {row.extra.watch ? (
            <Pill dot tone="good">
              Subscribed
            </Pill>
          ) : (
            <Pill tone="neutral">Not subscribed</Pill>
          )}
        </div>
        {row.extra.watch ? (
          <>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="c-label">Since</dt>
                <dd className="mt-0.5 font-medium">{row.extra.watch.since}</dd>
              </div>
              <div>
                <dt className="c-label">Sent · opened</dt>
                <dd className="tabular mt-0.5 font-medium">
                  {row.extra.watch.sent} · {row.extra.watch.opened}
                </dd>
              </div>
              <div>
                <dt className="c-label">Next send</dt>
                <dd className="mt-0.5 font-medium">{row.extra.watch.next}</dd>
              </div>
            </dl>
            <p className="c-label mt-2">
              {row.extra.watch.lastOpened
                ? `Last opened ${row.extra.watch.lastOpened}.`
                : "No update sent yet. The first one goes out with the next monthly run."}
            </p>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-ghost btn-sm" type="button">
                <Send aria-hidden="true" className="size-3.5" /> Send now
              </button>
              <button className="c-label px-2 hover:text-ink" type="button">
                Unsubscribe
              </button>
            </div>
          </>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="c-label">
              Not watching this home. An invite adds them to the monthly run.
            </p>
            <button className="btn btn-ghost btn-sm shrink-0" type="button">
              Invite to watch
            </button>
          </div>
        )}
      </div>

      <h3 className="c-label mt-5 mb-2 font-medium">Activity</h3>
      <ol className="border-line border-l">
        {activity.map((e) => (
          <li
            className="relative pb-3 pl-4 last:pb-0"
            key={`${e.t}-${e.label}`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1.5 -left-[4.5px] size-2 rounded-full bg-canvas ring-2 ${e.kind === "homeowner" ? "ring-brand" : "ring-ink"}`}
            />
            <div className="text-sm">
              <span className="tabular mr-2 text-ink-muted">{e.t}</span>
              {e.kind === "homeowner" ? null : (
                <span className="mr-1 font-medium">{e.by}:</span>
              )}
              {e.label}
            </div>
          </li>
        ))}
      </ol>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            onAddNote(draft.trim());
            setDraft("");
          }
        }}
      >
        <label className="sr-only" htmlFor="lead-note">
          Add a note
        </label>
        <input
          className="field h-9 flex-1 text-sm"
          id="lead-note"
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note for the team"
          type="text"
          value={draft}
        />
        <button
          className="btn btn-ink btn-sm"
          disabled={!draft.trim()}
          type="submit"
        >
          Add
        </button>
      </form>
    </Panel>
  );
}

function StatButton({
  label,
  value,
  note,
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  note: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="c-label">{label}</div>
      <div className="tabular mt-1 font-semibold text-2xl tracking-[-0.01em]">
        {value}
      </div>
      <div className="c-label mt-1">{note}</div>
    </>
  );
  if (!onClick) {
    return <div className="panel p-4">{body}</div>;
  }
  return (
    <button
      aria-pressed={active}
      className={`panel p-4 text-left transition-colors hover:bg-surface ${active ? "border-brand bg-brand-soft/40" : ""}`}
      onClick={onClick}
      type="button"
    >
      {body}
    </button>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className={`inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs ${
        value ? "border-ink bg-ink text-canvas" : "border-line text-ink-muted"
      }`}
    >
      <span>{label}</span>
      <select
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="max-w-[9rem] appearance-none bg-transparent font-medium outline-none"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
