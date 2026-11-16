import { Check, Copy, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  clearLog,
  type NetEntry,
  type UpstreamDebug,
  useNetworkLog,
} from "@/lib/network-log";

/*
  A small network panel for the demo: every request the autocomplete sends, what
  this site's server forwarded to Fieldgeist (key masked), Fieldgeist's raw answer,
  and where the time went.
*/

type Tab = "timing" | "request" | "response" | "headers";

const TABS: { id: Tab; label: string }[] = [
  { id: "timing", label: "Timing" },
  { id: "request", label: "Request" },
  { id: "response", label: "Response" },
  { id: "headers", label: "Headers" },
];

const fmtMs = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) {
    return "–";
  }
  return ms < 10 ? `${ms.toFixed(1)} ms` : `${Math.round(ms)} ms`;
};

const median = (values: number[]): number | null => {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
};

function StatusPill({ entry }: { entry: NetEntry }) {
  const base =
    "inline-flex h-5 min-w-12 items-center justify-center rounded-md px-1.5 font-medium font-mono text-[0.6875rem] tabular-nums";
  if (entry.state === "pending") {
    return (
      <span className={`${base} bg-ink/6 text-ink/80`}>
        <span className="size-1.5 animate-pulse rounded-full bg-ink/30 motion-reduce:animate-none" />
      </span>
    );
  }
  const ok = entry.state === "done";
  return (
    <span
      className={`${base} ${ok ? "bg-good/12 text-[oklch(0.42_0.13_145)]" : "bg-bad/12 text-[oklch(0.45_0.17_27)]"}`}
    >
      {entry.status ?? "ERR"}
    </span>
  );
}

const JSON_TOKEN =
  /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)/g;

/** Pretty JSON with keys, strings, numbers and literals colored. */
function JsonView({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2) ?? "undefined";
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(JSON_TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) {
      parts.push(text.slice(last, at));
    }
    let color = "text-[oklch(0.5_0.12_60)]";
    if (m[1]) {
      color = "text-[oklch(0.45_0.13_250)]";
    } else if (m[2]) {
      color = "text-[oklch(0.45_0.11_150)]";
    } else if (m[4]) {
      color = "text-[oklch(0.48_0.15_320)]";
    }
    parts.push(
      <span className={color} key={at}>
        {m[0]}
      </span>
    );
    last = at + m[0].length;
  }
  parts.push(text.slice(last));
  return (
    <pre className="overflow-x-auto whitespace-pre rounded-xl bg-canvas p-3.5 font-mono text-[0.75rem] text-ink leading-relaxed ring-1 ring-line">
      {parts}
    </pre>
  );
}

function Section({
  title,
  children,
  aside,
}: {
  aside?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium text-[0.6875rem] text-ink-muted uppercase tracking-[0.08em]">
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function KeyValues({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-1.5 font-mono text-[0.75rem]">
      {rows.map(([k, v]) => (
        <div className="contents" key={k}>
          <dt className="text-ink-muted">{k}</dt>
          <dd className="min-w-0 break-all text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function curlFor(debug: UpstreamDebug): string {
  return [
    `curl -X ${debug.request.method} ${debug.request.url} \\`,
    `  -H "Authorization: Bearer $FIELDGEIST_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${JSON.stringify(debug.request.body)}'`,
  ].join("\n");
}

function CopyCurl({ debug }: { debug: UpstreamDebug }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.75rem] text-ink/80 hover:bg-ink/5 hover:text-ink"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(curlFor(debug));
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked (e.g. plain http on another machine); nothing to do.
        }
      }}
      type="button"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-3.5" />
      ) : (
        <Copy aria-hidden="true" className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy as cURL"}
    </button>
  );
}

function TimingBar({
  label,
  detail,
  ms,
  scale,
  offset = 0,
  tone,
}: {
  detail: string;
  label: string;
  ms: number;
  offset?: number;
  scale: number;
  tone: string;
}) {
  const pct = (n: number) =>
    `${Math.max(0, Math.min(100, (n / scale) * 100))}%`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
        <span className="text-ink">{label}</span>
        <span className="font-mono text-ink tabular-nums">{fmtMs(ms)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-ink/8">
        <div
          className={`absolute inset-y-0 rounded-full ${tone}`}
          style={{
            left: pct(offset),
            width: `max(${pct(ms)}, 3px)`,
          }}
        />
      </div>
      <p className="text-[0.75rem] text-ink-muted">{detail}</p>
    </div>
  );
}

function TimingTab({ entry }: { entry: NetEntry }) {
  if (entry.ms === undefined) {
    return (
      <p className="text-ink-muted text-sm">
        {entry.error ?? "Waiting for the answer…"}
      </p>
    );
  }
  const total = entry.ms;
  const upstream = entry.upstreamMs ?? 0;
  const index = entry.tookMs ?? 0;
  const toProxy = Math.max(0, total - upstream);
  const fieldgeistNetwork = Math.max(0, upstream - index);
  return (
    <div className="space-y-5">
      <TimingBar
        detail="Everything the person waits for: this page to the site's server, on to Fieldgeist, and back."
        label="Round trip in the browser"
        ms={total}
        scale={total}
        tone="bg-ink/30"
      />
      <TimingBar
        detail="Measured on this site's server: the call to Fieldgeist and its answer."
        label="Call to Fieldgeist"
        ms={upstream}
        offset={toProxy / 2}
        scale={total}
        tone="bg-ink/45"
      />
      <TimingBar
        detail="Reported by Fieldgeist: time spent searching 130M+ addresses."
        label="Search inside the index"
        ms={index}
        offset={toProxy / 2 + fieldgeistNetwork / 2}
        scale={total}
        tone="bg-[var(--c-signal)]"
      />
      <div className="border-line border-t pt-4">
        <KeyValues
          rows={[
            ["browser ↔ site", fmtMs(toProxy)],
            ["site ↔ Fieldgeist", fmtMs(fieldgeistNetwork)],
            ["index", fmtMs(index)],
          ]}
        />
      </div>
    </div>
  );
}

/** The deployed demo calls Fieldgeist over a service binding (RPC); local dev uses the HTTP API with a key. */
const isHttp = (debug: UpstreamDebug | undefined) =>
  debug?.request.url.startsWith("http") === true;

function RequestTab({ entry }: { entry: NetEntry }) {
  const http = isHttp(entry.debug);
  return (
    <div className="space-y-6">
      {entry.debug ? (
        <Section
          aside={http ? <CopyCurl debug={entry.debug} /> : null}
          title="Sent to Fieldgeist"
        >
          <KeyValues
            rows={[
              ["method", entry.debug.request.method],
              ["url", entry.debug.request.url],
              ...Object.entries(entry.debug.request.headers).map(
                ([k, v]) => [k, v] as [string, string]
              ),
            ]}
          />
          <JsonView value={entry.debug.request.body} />
        </Section>
      ) : null}
      <Section title="Sent by this page">
        <KeyValues
          rows={[
            ["method", "POST"],
            ["url", "/api/address-search"],
          ]}
        />
        <JsonView value={entry.requestBody} />
        <p className="text-[0.75rem] text-ink-muted">
          {http
            ? "The page calls its own server, which adds the API key. The key never reaches the browser."
            : "The page calls its own server, which asks Fieldgeist over a private service binding, the way fieldgeist.com's demo does. No API key is involved."}
        </p>
      </Section>
    </div>
  );
}

function ResponseTab({ entry }: { entry: NetEntry }) {
  if (!entry.debug) {
    return (
      <p className="text-ink-muted text-sm">
        {entry.error ?? "No response yet."}
      </p>
    );
  }
  return (
    <Section title={`Fieldgeist answer · ${entry.debug.response.status}`}>
      <JsonView value={entry.debug.response.body} />
    </Section>
  );
}

function HeadersTab({ entry }: { entry: NetEntry }) {
  if (!entry.debug) {
    return <p className="text-ink-muted text-sm">No response yet.</p>;
  }
  return (
    <Section title="Response headers from Fieldgeist">
      <KeyValues
        rows={[
          ["status", String(entry.debug.response.status)],
          ...Object.entries(entry.debug.response.headers).map(
            ([k, v]) => [k, v] as [string, string]
          ),
        ]}
      />
    </Section>
  );
}

function rowNote(entry: NetEntry): string {
  if (entry.state !== "done") {
    return entry.error ?? "waiting…";
  }
  const counts = `${entry.hits} of ${entry.total?.toLocaleString("en-US")}`;
  // A newer search was already out, so this answer never reached the list.
  return entry.superseded
    ? `${counts} · superseded by a newer search`
    : `${counts} shown`;
}

function RequestRow({
  entry,
  scale,
  selected,
  onSelect,
}: {
  entry: NetEntry;
  onSelect: () => void;
  scale: number;
  selected: boolean;
}) {
  const ms = entry.ms ?? 0;
  const width = Math.max(4, Math.min(100, (ms / scale) * 100));
  const indexWidth =
    ms > 0 ? Math.min(100, ((entry.tookMs ?? 0) / ms) * 100) : 0;
  const dim = entry.superseded === true;
  return (
    <li>
      <button
        aria-pressed={selected}
        className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ${
          selected
            ? "bg-canvas shadow-[0_1px_2px_oklch(0_0_0/6%)] ring-1 ring-line"
            : "hover:bg-ink/5"
        } ${dim ? "opacity-60" : ""}`}
        onClick={onSelect}
        type="button"
      >
        <StatusPill entry={entry} />
        <span className="truncate font-mono text-[0.8125rem] text-ink">
          {entry.query}
        </span>
        <span className="font-mono text-[0.75rem] text-ink/80 tabular-nums">
          {entry.ms === undefined ? "" : fmtMs(entry.ms)}
        </span>
        <span className="col-start-2 text-[0.6875rem] text-ink-muted">
          {rowNote(entry)}
        </span>
        <span
          aria-hidden="true"
          className="col-start-3 h-1 w-16 overflow-hidden rounded-full bg-ink/8"
        >
          {entry.ms === undefined ? null : (
            <span
              className="flex h-full rounded-full bg-ink/25"
              style={{ width: `${width}%` }}
            >
              <span
                className="h-full rounded-full bg-[var(--c-signal)]"
                style={{ width: `${indexWidth}%` }}
              />
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export function NetworkDebugger({ className = "" }: { className?: string }) {
  const entries = useNetworkLog();
  const [pinned, setPinned] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("timing");

  const selected =
    entries.find((e) => e.id === pinned) ?? entries[0] ?? undefined;
  const done = entries.filter((e) => e.state === "done");
  const medianMs = median(done.map((e) => e.ms ?? 0));
  const medianIndex = median(done.map((e) => e.tookMs ?? 0));
  const scale = Math.max(200, ...entries.map((e) => e.ms ?? 0));

  return (
    <aside
      aria-label="Network debugger"
      className={`flex min-h-0 flex-col overflow-hidden bg-surface text-ink ring-1 ring-line ${className}`}
    >
      <header className="flex items-center justify-between gap-4 border-line border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--c-signal)]/60 motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-[var(--c-signal)]" />
          </span>
          <h2 className="font-semibold text-[0.9375rem]">Network</h2>
          <span className="text-[0.8125rem] text-ink-muted">
            Fieldgeist search, live
          </span>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.75rem] text-ink-muted hover:bg-ink/5 hover:text-ink disabled:opacity-40"
          disabled={entries.length === 0}
          onClick={() => {
            clearLog();
            setPinned(null);
          }}
          type="button"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
          Clear
        </button>
      </header>

      <div className="grid grid-cols-3 border-line border-b">
        {[
          ["Requests", String(entries.length)],
          ["Median round trip", fmtMs(medianMs)],
          ["Median index time", fmtMs(medianIndex)],
        ].map(([label, value]) => (
          <div
            className="border-line px-5 py-3 [&:not(:first-child)]:border-l"
            key={label}
          >
            <div className="text-[0.6875rem] text-ink-muted">{label}</div>
            <div className="mt-0.5 font-mono text-[1.0625rem] tabular-nums">
              {value}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-ink">No requests yet.</p>
          <p className="max-w-[34ch] text-ink-muted text-sm">
            Start typing an address. Each search the autocomplete sends shows up
            here with its timing, request and Fieldgeist's answer.
          </p>
        </div>
      ) : (
        <>
          <ol className="max-h-[38%] shrink-0 space-y-0.5 overflow-y-auto border-line border-b p-2">
            {entries.map((e) => (
              <RequestRow
                entry={e}
                key={e.id}
                onSelect={() => setPinned(e.id)}
                scale={scale}
                selected={selected?.id === e.id}
              />
            ))}
          </ol>

          {selected ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-3 border-line border-b px-3">
                <div className="flex" role="tablist">
                  {TABS.map((t) => (
                    <button
                      aria-selected={tab === t.id}
                      className={`-mb-px border-b-2 px-2.5 py-2.5 text-[0.8125rem] transition-colors duration-150 ${
                        tab === t.id
                          ? "border-ink text-ink"
                          : "border-transparent text-ink-muted hover:text-ink"
                      }`}
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      role="tab"
                      type="button"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {pinned !== null && pinned !== entries[0]?.id ? (
                  <button
                    className="rounded-md px-2 py-1 text-[0.75rem] text-ink-muted hover:bg-ink/5 hover:text-ink"
                    onClick={() => setPinned(null)}
                    type="button"
                  >
                    Follow latest
                  </button>
                ) : null}
              </div>
              <div
                className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
                role="tabpanel"
              >
                {tab === "timing" ? <TimingTab entry={selected} /> : null}
                {tab === "request" ? <RequestTab entry={selected} /> : null}
                {tab === "response" ? <ResponseTab entry={selected} /> : null}
                {tab === "headers" ? <HeadersTab entry={selected} /> : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
}
