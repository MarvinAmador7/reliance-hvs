import { useSyncExternalStore } from "react";

/*
  In-memory log of the autocomplete's requests, for the demo's network debugger.
  The search hook writes one entry per request it sends; the debugger reads them.
  Nothing leaves the browser.
*/

export interface UpstreamDebug {
  request: {
    body: unknown;
    headers: Record<string, string>;
    method: string;
    url: string;
  };
  response: {
    body: unknown;
    headers: Record<string, string>;
    ms: number;
    status: number;
  };
}

export type NetState = "pending" | "done" | "error";

export interface NetEntry {
  debug?: UpstreamDebug;
  error?: string;
  hits?: number;
  id: number;
  /** Browser → this site's proxy → Fieldgeist → back, in ms. */
  ms?: number;
  query: string;
  requestBody: unknown;
  requestId?: string | null;
  startedAt: number;
  state: NetState;
  status?: number;
  /** Answered after a newer search was sent, so the list never showed it. */
  superseded?: boolean;
  /** Search time inside the Fieldgeist index, as Fieldgeist reports it. */
  tookMs?: number | null;
  total?: number;
  /** Proxy → Fieldgeist and back, measured on the proxy. */
  upstreamMs?: number;
}

const MAX_ENTRIES = 100;

let entries: NetEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

export function logStart(query: string, requestBody: unknown): number {
  const id = nextId;
  nextId += 1;
  const entry: NetEntry = {
    id,
    query,
    requestBody,
    startedAt: Date.now(),
    state: "pending",
  };
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  emit();
  return id;
}

export function logUpdate(id: number, patch: Partial<NetEntry>): void {
  entries = entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
  emit();
}

export function clearLog(): void {
  entries = [];
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const EMPTY: NetEntry[] = [];

/** Newest first. */
export const useNetworkLog = (): NetEntry[] =>
  useSyncExternalStore(
    subscribe,
    () => entries,
    () => EMPTY
  );
