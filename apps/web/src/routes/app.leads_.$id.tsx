import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  ExternalLink,
  Eye,
  Flame,
  Mail,
  MessageSquare,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { Avatar, Panel, Pill, Segmented } from "@/components/console/ui";
import {
  type AgentAction,
  agents,
  HOT_THRESHOLD,
  homesHint,
  initialsOf,
  type Row,
  rows,
  scoreTone,
  statusTone,
} from "@/lib/leads";
import { fmtMoney } from "@/lib/mock-data";

export const Route = createFileRoute("/app/leads_/$id")({
  component: LeadPage,
  loader: ({ params }) => {
    const row = rows.find((r) => r.id === params.id);
    if (!row) {
      throw notFound();
    }
    return row;
  },
  notFoundComponent: LeadMissing,
});

/* Mock "today" for grouping the timeline. */
const TODAY = "Sep 11";
const YESTERDAY = "Sep 10";

interface Entry {
  by: string;
  day: string;
  kind: AgentAction["kind"] | "homeowner";
  label: string;
  t: string;
}

const dayLabel = (day: string): string => {
  if (day === TODAY) {
    return "Today";
  }
  if (day === YESTERDAY) {
    return "Yesterday";
  }
  return day;
};

/* Homeowner events carry a clock time only; the lead's recency tells us the day. */
const homeownerDay = (when: string): string => {
  if (when.includes("min") || when.includes("h ago")) {
    return TODAY;
  }
  if (when === "Yesterday") {
    return YESTERDAY;
  }
  return "Sep 9";
};

const actionDay = (t: string): string => t.split(",")[0] ?? t;
const actionTime = (t: string): string => t.split(", ")[1] ?? t;

const activityOf = (row: Row, notes: AgentAction[]): Entry[] => {
  const homeowner: Entry[] = row.events.map((e) => ({
    by: "Homeowner",
    day: homeownerDay(row.when),
    kind: "homeowner",
    label: e.label,
    t: e.t,
  }));
  const team: Entry[] = [...row.extra.actions, ...notes].map((a) => ({
    by: a.by,
    day: actionDay(a.t),
    kind: a.kind,
    label: a.label,
    t: actionTime(a.t),
  }));
  return [...homeowner, ...team];
};

const groupByDay = (entries: Entry[]): { day: string; items: Entry[] }[] => {
  const groups: { day: string; items: Entry[] }[] = [];
  for (const e of entries) {
    const g = groups.find((x) => x.day === e.day);
    if (g) {
      g.items.push(e);
    } else {
      groups.push({ day: e.day, items: [e] });
    }
  }
  return groups;
};

const feeds = [
  { label: "All", value: "all" },
  { label: "Homeowner", value: "homeowner" },
  { label: "Team", value: "team" },
] as const;
type Feed = (typeof feeds)[number]["value"];

const inFeed = (e: Entry, feed: Feed): boolean => {
  if (feed === "all") {
    return true;
  }
  if (feed === "homeowner") {
    return e.kind === "homeowner";
  }
  return e.kind !== "homeowner";
};

function LeadMissing() {
  return (
    <div className="py-16 text-center">
      <p className="c-section">That lead is not in this workspace.</p>
      <Link className="btn btn-ghost btn-sm mt-4" to="/app/leads">
        Back to leads
      </Link>
    </div>
  );
}

function LeadPage() {
  const row = Route.useLoaderData();
  const [notes, setNotes] = useState<AgentAction[]>([]);
  const [feed, setFeed] = useState<Feed>("all");
  const agent = agents.find((a) => a.name === row.agent);
  const signals = [...row.extra.signals].sort((a, b) => b.points - a.points);
  const activity = activityOf(row, notes).filter((e) => inFeed(e, feed));
  const groups = groupByDay(activity);

  const addNote = (text: string) =>
    setNotes((n) => [
      ...n,
      { by: "You", kind: "note", label: text, t: `${TODAY}, just now` },
    ]);

  return (
    <div className="pb-20 lg:pb-0">
      <nav aria-label="Breadcrumb" className="c-label flex items-center gap-1">
        <Link className="hover:text-ink" to="/app/leads">
          Leads
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <span className="text-ink">{row.name}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex items-start gap-3">
          <Avatar initials={initialsOf(row.name)} />
          <div>
            <h1 className="c-title flex items-center gap-2">
              {row.name}
              <span className="flex items-center gap-1">
                {row.extra.score >= HOT_THRESHOLD ? (
                  <Flame
                    aria-label="Hot lead"
                    className="size-4 text-[oklch(0.62_0.18_35)]"
                  />
                ) : null}
                {row.extra.claim ? (
                  <BadgeCheck
                    aria-label="Claimed the home"
                    className="size-4 text-good"
                  />
                ) : null}
                {row.extra.watch ? (
                  <Eye
                    aria-label="Watching monthly updates"
                    className="size-4 text-ink-muted"
                  />
                ) : null}
              </span>
              <Pill dot tone={statusTone(row.status)}>
                {row.status}
              </Pill>
            </h1>
            <p className="c-label mt-1">
              {row.extra.type} · {row.source} · {row.channel} · {row.device} ·
              first seen {row.when}
            </p>
          </div>
        </div>
        <div className="hidden flex-wrap gap-2 lg:flex">
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
          <button className="btn btn-ghost btn-sm" type="button">
            <UserRound aria-hidden="true" className="size-3.5" />
            {row.agent === "Unassigned" ? "Assign" : "Reassign"}
          </button>
          <Link
            className="btn btn-ghost btn-sm"
            to="/home-report/2148-bayshore-lane"
          >
            Open report
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Panel className="min-w-0 divide-y divide-line" flush>
          <section className="p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="c-section">Seller intent</h2>
              <p className="tabular">
                <span
                  className={`inline-flex h-7 items-center rounded-full px-2.5 font-semibold text-sm ${scoreTone(row.extra.score)}`}
                >
                  {row.extra.score}
                </span>
                <span className="c-label ml-1.5">of 100</span>
              </p>
            </div>
            <div
              aria-label={`Intent score ${row.extra.score} of 100`}
              className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface"
              role="img"
            >
              {signals.map((s, i) => (
                <span
                  className="h-full grow-x rounded-[2px] bg-brand"
                  key={s.label}
                  style={{
                    animationDelay: `${i * 70}ms`,
                    width: `${s.points}%`,
                  }}
                />
              ))}
            </div>
            <ol className="mt-4 space-y-2">
              {signals.map((s) => (
                <li
                  className="flex items-center justify-between gap-4 text-sm"
                  key={s.label}
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 text-brand"
                    />
                    {s.label}
                  </span>
                  <span className="tabular text-ink-muted">+{s.points}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-line border-t pt-3 text-sm">
              <span className="c-label">Next step · </span>
              {row.extra.nextStep}
            </p>
          </section>

          <section className="p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="c-section">Homes</h2>
              {row.extra.homes ? (
                <span className="c-label tabular">
                  {row.extra.homes.length + 1} viewed
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex gap-4">
              <img
                alt=""
                className="size-24 shrink-0 rounded-[10px] object-cover sm:size-28"
                height={112}
                src={row.extra.photo}
                width={112}
              />
              <div className="min-w-0 flex-1">
                <div className="c-label">Their home</div>
                <div className="font-medium">{row.address}</div>
                <div className="c-label">{row.area}</div>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <dt className="c-label">Value</dt>
                    <dd className="tabular font-semibold text-lg">
                      {fmtMoney(row.value, true)}
                    </dd>
                  </div>
                  <div>
                    <dt className="c-label">Equity</dt>
                    <dd className="tabular font-semibold text-lg">
                      {fmtMoney(row.extra.equity, true)}
                    </dd>
                  </div>
                  <div>
                    <dt className="c-label">Selling</dt>
                    <dd className="font-semibold text-lg">{row.intent}</dd>
                  </div>
                </dl>
              </div>
            </div>
            {row.extra.homes ? (
              <>
                <h3 className="c-label mt-5 font-medium">Also viewed</h3>
                <ul className="mt-1 divide-y divide-line">
                  {row.extra.homes.map((h) => (
                    <li
                      className="flex items-center justify-between gap-4 py-2.5 text-sm"
                      key={h.address}
                    >
                      <div className="min-w-0">
                        <div className="truncate">{h.address}</div>
                        <div className="c-label">
                          {h.area} · {h.when}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="tabular font-medium">
                          {fmtMoney(h.value, true)}
                        </div>
                        <div className="c-label tabular">
                          {h.views} {h.views === 1 ? "view" : "views"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="c-label mt-2">{homesHint(row)}</p>
              </>
            ) : null}
          </section>

          <section className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="c-section">Activity</h2>
              <Segmented
                label="Activity feed"
                onChange={setFeed}
                options={feeds}
                value={feed}
              />
            </div>
            {groups.length === 0 ? (
              <p className="c-label mt-4">Nothing from the team yet.</p>
            ) : null}
            {groups.map((g) => (
              <div className="mt-5" key={g.day}>
                <div className="flex items-center gap-3">
                  <h3 className="c-label font-medium">{dayLabel(g.day)}</h3>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <ol className="mt-3 ml-1 border-line border-l">
                  {g.items.map((e) => (
                    <li
                      className="relative pb-3 pl-4 last:pb-0"
                      key={`${e.t}-${e.label}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-1.5 -left-[4.5px] size-2 rounded-full bg-canvas ring-2 ${e.kind === "homeowner" ? "ring-brand" : "ring-ink"}`}
                      />
                      <div className="text-sm">
                        <span className="tabular mr-2 text-ink-muted">
                          {e.t}
                        </span>
                        {e.kind === "homeowner" ? null : (
                          <span className="mr-1 font-medium">{e.by}:</span>
                        )}
                        {e.label}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        </Panel>

        <Panel
          className="min-w-0 divide-y divide-line self-start lg:sticky lg:top-6"
          flush
        >
          <section className="p-5">
            <h2 className="c-label font-medium">Contact</h2>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="c-label">Email</dt>
                <dd className="truncate">
                  <a className="hover:text-brand" href={`mailto:${row.email}`}>
                    {row.email}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="c-label">Phone</dt>
                <dd className="tabular">
                  <a
                    className="hover:text-brand"
                    href={`tel:${row.phone.replace(/\D/g, "")}`}
                  >
                    {row.phone}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="c-label">Prefers</dt>
                <dd>{row.extra.contact.prefers}</dd>
              </div>
              {row.extra.contact.bestTime ? (
                <div className="flex justify-between gap-3">
                  <dt className="c-label">Best time</dt>
                  <dd>{row.extra.contact.bestTime}</dd>
                </div>
              ) : null}
            </dl>
            <p className="c-label mt-3">{row.extra.contact.consent}</p>
          </section>

          <section className="p-5">
            <h2 className="c-label font-medium">Homeowner status</h2>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <BadgeCheck
                  aria-hidden="true"
                  className="size-4 text-ink-muted"
                />
                Claimed
              </span>
              {row.extra.claim ? (
                <Pill dot tone="good">
                  Verified owner
                </Pill>
              ) : (
                <Pill tone="neutral">Not claimed</Pill>
              )}
            </div>
            <p className="c-label mt-1 pl-5.5">
              {row.extra.claim
                ? `${row.extra.claim.at} · ${row.extra.claim.provider} · owner since ${row.extra.claim.ownedSince}`
                : "Claiming verifies ownership and unlocks report edits."}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-1.5">
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
            <p className="c-label mt-1 pl-5.5">
              {row.extra.watch
                ? `Since ${row.extra.watch.since} · ${row.extra.watch.sent} sent, ${row.extra.watch.opened} opened · next ${row.extra.watch.next}`
                : "Not watching this home."}
            </p>
            <div className="mt-3 flex gap-2">
              {row.extra.claim ? null : (
                <button className="btn btn-ghost btn-sm" type="button">
                  Invite to claim
                </button>
              )}
              {row.extra.watch ? (
                <button className="btn btn-ghost btn-sm" type="button">
                  <Send aria-hidden="true" className="size-3.5" /> Send update
                </button>
              ) : (
                <button className="btn btn-ghost btn-sm" type="button">
                  Invite to watch
                </button>
              )}
            </div>
          </section>

          <section className="p-5">
            <h2 className="c-label font-medium">Assigned agent</h2>
            {agent ? (
              <div className="mt-2 flex items-center gap-3">
                <Avatar initials={initialsOf(agent.name)} photo={agent.photo} />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-medium">{agent.name}</div>
                  <div className="c-label">
                    Responds in {agent.response} · {agent.load} open leads
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="c-label">
                  No agent yet. Suggested: Dana Whitfield.
                </p>
                <button className="btn btn-ghost btn-sm shrink-0" type="button">
                  Assign
                </button>
              </div>
            )}
          </section>

          <NotesSection notes={notes} onAdd={addNote} />
        </Panel>
      </div>

      {/* Phone action bar. Left padding clears the preview tray button in this mockup. */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-line border-t bg-canvas/95 py-3 pr-4 pl-36 backdrop-blur lg:hidden">
        <a
          className="btn btn-brand btn-md flex-1"
          href={`tel:${row.phone.replace(/\D/g, "")}`}
        >
          <Phone aria-hidden="true" className="size-4" /> Call
        </a>
        <a className="btn btn-ghost btn-md flex-1" href={`mailto:${row.email}`}>
          <Mail aria-hidden="true" className="size-4" /> Email
        </a>
      </div>
    </div>
  );
}

function NotesSection({
  notes,
  onAdd,
}: {
  notes: AgentAction[];
  onAdd: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <section className="p-5">
      <h2 className="c-label font-medium">Notes</h2>
      <form
        className="mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            onAdd(draft.trim());
            setDraft("");
          }
        }}
      >
        <label className="sr-only" htmlFor="lead-page-note">
          Add a note
        </label>
        <textarea
          className="field min-h-20 w-full resize-y text-sm"
          id="lead-page-note"
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note for the team"
          value={draft}
        />
        <div className="mt-2 flex justify-end">
          <button
            className="btn btn-ink btn-sm"
            disabled={!draft.trim()}
            type="submit"
          >
            Add note
          </button>
        </div>
      </form>
      {notes.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {notes.map((n) => (
            <li key={`${n.t}-${n.label}`}>
              <span className="c-label">
                {n.by} · {n.t}
              </span>
              <div>{n.label}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
