import { useEffect, useRef, useState } from "react";

import { logStart, logUpdate, type UpstreamDebug } from "@/lib/network-log";

/** Same origin: the server route adds the Fieldgeist key and forwards to /v1/search. */
const SEARCH_URL = "/api/address-search";
const DEBOUNCE_MS = 200;
const MIN_CHARS = 3;
const LIMIT = 8;

export interface AddressHit {
  address: string;
  apn: string | null;
  city?: string;
  fips: string | null;
  id?: string;
  lat?: number;
  lon?: number;
  state?: string;
  street?: string;
  zip?: string;
}

export interface Suggestion {
  /** Building line without the unit: "1717 N Bayshore Dr". */
  base: string;
  hit: AddressHit;
  /** Full street line: "1717 N Bayshore Dr, Unit A-3739". */
  line1: string;
  line2: string;
  /** Unit label when the address has one: "Unit A-3739", "Apt 4B". */
  unit?: string;
}

/** Suggestions that share one building address, buildings with their units. */
export interface SuggestionGroup {
  base: string;
  hasUnits: boolean;
  items: Suggestion[];
  key: string;
  line2: string;
}

export type SearchStatus = "idle" | "loading" | "ready" | "error";

export interface AddressSearchState {
  /** Round trip from the browser, through the proxy, to Fieldgeist and back. */
  ms: number | null;
  status: SearchStatus;
  suggestions: Suggestion[];
  /** Time inside the Fieldgeist index, as Fieldgeist reports it. */
  tookMs: number | null;
  /** All matches, even those past the limit. */
  total: number;
}

const WORD_BREAKS = /(\s+|-)/;
const LEADING_HASH = /^#\s*/;
const DESIGNATOR = /^([A-Z]+)\s+\S/;

/** USPS secondary unit designators that already name the unit ("APT 4B" stays "Apt 4B"). */
const DESIGNATORS = new Set([
  "APT",
  "BLDG",
  "DEPT",
  "FL",
  "LOT",
  "PH",
  "RM",
  "SPC",
  "STE",
  "TRLR",
  "UNIT",
]);

const UPPER_TOKENS = new Set([
  "N",
  "S",
  "E",
  "W",
  "NE",
  "NW",
  "SE",
  "SW",
  "PO",
]);

/** "233 S WACKER DR APT 3530" → "233 S Wacker Dr Apt 3530" */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(WORD_BREAKS)
    .map((part) => {
      const upper = part.toUpperCase();
      if (UPPER_TOKENS.has(upper)) {
        return upper;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

function unitLabel(raw: string): string {
  const designator = DESIGNATOR.exec(raw)?.[1];
  if (designator && DESIGNATORS.has(designator)) {
    return titleCase(raw);
  }
  return `Unit ${raw.replace(LEADING_HASH, "")}`;
}

/**
 * Splits Fieldgeist's one-line USPS address into a street line and a city line,
 * and the street line into the building and its unit. The hit's `street` field
 * ("N BAYSHORE DR") marks where the building line ends; anything after it is the unit.
 */
export function toSuggestion(hit: AddressHit): Suggestion {
  const { city, state, zip } = hit;
  const tail = [city, [state, zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  let street = hit.address;
  if (tail && street.toUpperCase().endsWith(`, ${tail.toUpperCase()}`)) {
    street = street.slice(0, street.length - tail.length - 2);
  } else if (street.includes(",")) {
    street = street.slice(0, street.indexOf(","));
  }

  let base = street;
  let unit: string | undefined;
  const at = hit.street
    ? street.toUpperCase().indexOf(hit.street.toUpperCase())
    : -1;
  if (hit.street && at >= 0) {
    const end = at + hit.street.length;
    const rest = street.slice(end).trim();
    base = street.slice(0, end);
    unit = rest.length > 0 ? unitLabel(rest.toUpperCase()) : undefined;
  }
  const baseLine = titleCase(base);

  return {
    base: baseLine,
    hit,
    line1: unit ? `${baseLine}, ${unit}` : baseLine,
    line2: [
      city ? titleCase(city) : null,
      [state, zip].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", "),
    unit,
  };
}

/**
 * Groups suggestions by building, in the order the API ranked them. Inside a group,
 * parcels without a unit (the building's own records) come first, then the units.
 */
export function groupSuggestions(list: Suggestion[]): SuggestionGroup[] {
  const groups = new Map<string, SuggestionGroup>();
  for (const s of list) {
    const key = `${s.base}|${s.line2}`;
    let group = groups.get(key);
    if (!group) {
      group = { base: s.base, hasUnits: false, items: [], key, line2: s.line2 };
      groups.set(key, group);
    }
    group.items.push(s);
    group.hasUnits ||= s.unit !== undefined;
  }
  return [...groups.values()].map((g) => ({
    ...g,
    items: [
      ...g.items.filter((s) => !s.unit),
      ...g.items.filter((s) => s.unit),
    ],
  }));
}

/** A group shows as a building with nested rows when it has units or several parcels. */
export const isNested = (g: SuggestionGroup): boolean =>
  g.hasUnits || g.items.length > 1;

const IDLE: AddressSearchState = {
  ms: null,
  status: "idle",
  suggestions: [],
  tookMs: null,
  total: 0,
};

/** Debounced address autocomplete. Keeps the last answer on screen while the next one loads. */
interface SearchAnswer {
  debug?: UpstreamDebug;
  error?: string;
  hits: AddressHit[];
  requestId?: string | null;
  tookMs: number | null;
  total?: number;
  upstreamMs?: number;
}

/** One search, logged for the debugger. Returns null when the request failed. */
async function runSearch(
  q: string
): Promise<{ id: number; json: SearchAnswer; ms: number } | null> {
  const body = { limit: LIMIT, query: q };
  const id = logStart(q, body);
  const started = performance.now();
  try {
    const res = await fetch(SEARCH_URL, {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const json = (await res.json().catch(() => null)) as SearchAnswer | null;
    const ms = performance.now() - started;
    if (!(res.ok && json)) {
      logUpdate(id, {
        debug: json?.debug,
        error: json?.error ?? `HTTP ${res.status}`,
        ms,
        state: "error",
        status: res.status,
      });
      return null;
    }
    logUpdate(id, {
      debug: json.debug,
      hits: json.hits.length,
      ms,
      requestId: json.requestId,
      state: "done",
      status: res.status,
      tookMs: json.tookMs,
      total: json.total ?? json.hits.length,
      upstreamMs: json.upstreamMs,
    });
    return { id, json, ms };
  } catch (error) {
    console.warn("[address-search]", error);
    logUpdate(id, { error: "network error", state: "error" });
    return null;
  }
}

/**
 * Debounced address autocomplete. Requests are never cancelled mid-flight (a dropped
 * connection is noise for the server); instead, only the newest search may update the
 * list, and older answers that arrive late are marked superseded in the debugger.
 */
export function useAddressSearch(query: string): AddressSearchState {
  const [state, setState] = useState<AddressSearchState>(IDLE);
  const latest = useRef(0);

  useEffect(() => {
    const q = query.trim();
    const seq = latest.current + 1;
    latest.current = seq;
    if (q.length < MIN_CHARS) {
      setState(IDLE);
      return;
    }
    setState((prev) => ({ ...prev, status: "loading" }));

    const timer = window.setTimeout(async () => {
      const answer = await runSearch(q);
      if (seq !== latest.current) {
        if (answer) {
          logUpdate(answer.id, { superseded: true });
        }
        return;
      }
      if (!answer) {
        setState({ ...IDLE, status: "error" });
        return;
      }
      const { json, ms } = answer;
      setState({
        ms,
        status: "ready",
        suggestions: json.hits.map(toSuggestion),
        tookMs: json.tookMs,
        total: json.total ?? json.hits.length,
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  return state;
}
