/*
  Server-only: the site's search proxy, /api/address-search. The browser never
  holds a Fieldgeist credential; it calls this site, and this site asks Fieldgeist
  one of two ways:

  - Deployed (search.fieldgeist.com): like fieldgeist.com's own landing demo, over a
    service binding to the Fieldgeist server's Demo entrypoint. No API key exists
    anywhere; Fieldgeist rate-limits demo calls per visitor IP. The binding is only
    reachable from Workers in the Fieldgeist account, never over HTTP. Called from
    server/middleware/demo-only.ts, which has the Cloudflare env.
  - Local dev (no bindings): the public API with FIELDGEIST_API_KEY from .env, via
    the TanStack route in src/routes/api.address-search.ts.

  Both answer the browser in the same shape, including a `debug` block with the
  exact call to Fieldgeist and its raw answer for the page's network debugger.
*/

const DEFAULT_API_URL = "https://api.fieldgeist.com";
const MAX_QUERY = 256;
const MAX_LIMIT = 8;
const DEFAULT_LIMIT = 6;
const UPSTREAM_TIMEOUT_MS = 4000;
const STATE_RE = /^[A-Za-z]{2}$/;
const ZIP_RE = /^\d{5}$/;
const TRAILING_SLASHES = /\/+$/;

/** The Fieldgeist server's Demo entrypoint (RPC over a service binding). */
export interface FieldgeistDemo {
  run: (
    kind: "search",
    body: unknown,
    ip: string
  ) => Promise<{ body: unknown; serverTiming: string | null; status: number }>;
}

interface UpstreamHit {
  address?: unknown;
  apn?: unknown;
  city?: unknown;
  fieldgeist_id?: unknown;
  fips?: unknown;
  lat?: unknown;
  lon?: unknown;
  state?: unknown;
  street?: unknown;
  zip?: unknown;
}

interface UpstreamPayload {
  error?: unknown;
  hits?: unknown;
  tookMs?: unknown;
  total?: unknown;
}

interface Debug {
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

interface Input {
  limit: number;
  query: string;
  state?: string;
  zip?: string;
}

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.length > 0 ? v : undefined;
const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const round1 = (ms: number) => Math.round(ms * 10) / 10;

export const json = (
  status: number,
  body: unknown,
  headers: HeadersInit = {}
) =>
  new Response(JSON.stringify(body), {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
      ...headers,
    },
    status,
  });

function toHits(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return (raw as UpstreamHit[]).map((h) => ({
    address: str(h.address) ?? "",
    apn: str(h.apn) ?? null,
    city: str(h.city),
    fips: str(h.fips) ?? null,
    id: str(h.fieldgeist_id),
    lat: num(h.lat),
    lon: num(h.lon),
    state: str(h.state),
    street: str(h.street),
    zip: str(h.zip),
  }));
}

const SHOWN_HEADERS = [
  "content-type",
  "server-timing",
  "x-request-id",
  "retry-after",
  "cf-ray",
] as const;

function pickHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of SHOWN_HEADERS) {
    const value = headers.get(name);
    if (value !== null) {
      out[name] = value;
    }
  }
  return out;
}

/** The debugger is public: show the key's kind, never any of its characters. */
const maskKey = (key: string): string =>
  key.startsWith("fg_live_") ? "fg_live_••••••••" : "••••••••";

/** Only pages on this site may use the proxy. */
function crossSite(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return true;
  }
  const origin = request.headers.get("origin");
  return origin !== null && origin !== new URL(request.url).origin;
}

async function readInput(request: Request): Promise<Input | Response> {
  if (crossSite(request)) {
    return json(403, { error: "forbidden" });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length === 0 || query.length > MAX_QUERY) {
    return json(400, { error: "invalid_query" });
  }
  const limit =
    typeof body.limit === "number" && Number.isInteger(body.limit)
      ? Math.min(MAX_LIMIT, Math.max(1, body.limit))
      : DEFAULT_LIMIT;
  const state =
    typeof body.state === "string" && STATE_RE.test(body.state)
      ? body.state
      : undefined;
  const zip =
    typeof body.zip === "string" && ZIP_RE.test(body.zip)
      ? body.zip
      : undefined;
  return { limit, query, state, zip };
}

/** Fieldgeist's body without undefined fields, as it was sent. */
const sentBody = (input: Input): unknown => JSON.parse(JSON.stringify(input));

/** The browser's answer: the hits in the page's shape, plus timing and the debug block. */
function finish(
  debug: Debug,
  payload: UpstreamPayload | null,
  requestId: string | null,
  extraHeaders: HeadersInit = {}
): Response {
  const { status } = debug.response;
  if (status !== 200 || payload === null) {
    return json(
      status >= 400 ? status : 502,
      { debug, error: str(payload?.error) ?? "upstream_error" },
      extraHeaders
    );
  }
  const hits = toHits(payload.hits);
  return json(200, {
    debug,
    hits,
    requestId,
    tookMs: num(payload.tookMs) ?? null,
    total: num(payload.total) ?? hits.length,
    upstreamMs: debug.response.ms,
  });
}

/** Deployed: Fieldgeist's Demo entrypoint over the service binding, no key. */
export async function searchViaDemo(
  request: Request,
  demo: FieldgeistDemo,
  ip: string
): Promise<Response> {
  const input = await readInput(request);
  if (input instanceof Response) {
    return input;
  }
  const started = performance.now();
  let answer: Awaited<ReturnType<FieldgeistDemo["run"]>>;
  try {
    answer = await demo.run("search", input, ip);
  } catch {
    return json(502, { error: "upstream_unavailable" });
  }
  const debug: Debug = {
    request: {
      body: sentBody(input),
      headers: { binding: "service binding, no API key" },
      method: "RPC",
      url: 'Fieldgeist Demo.run("search")',
    },
    response: {
      body: answer.body,
      headers: answer.serverTiming
        ? { "server-timing": answer.serverTiming }
        : {},
      ms: round1(performance.now() - started),
      status: answer.status,
    },
  };
  const retry: HeadersInit =
    answer.status === 429 ? { "retry-after": "60" } : {};
  return finish(debug, answer.body as UpstreamPayload | null, null, retry);
}

/** Local dev: the public API with the key from .env. */
export async function searchViaKey(request: Request): Promise<Response> {
  const key = process.env.FIELDGEIST_API_KEY;
  if (!key) {
    return json(503, {
      error: "not_configured",
      message: "FIELDGEIST_API_KEY is not set on the server",
    });
  }
  const input = await readInput(request);
  if (input instanceof Response) {
    return input;
  }
  const base = (process.env.FIELDGEIST_API_URL ?? DEFAULT_API_URL).replace(
    TRAILING_SLASHES,
    ""
  );
  const url = `${base}/v1/search`;
  const started = performance.now();
  let res: Response;
  try {
    res = await fetch(url, {
      body: JSON.stringify(input),
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      ]),
    });
  } catch {
    return json(504, { error: "upstream_unavailable" });
  }
  const payload = (await res
    .json()
    .catch(() => null)) as UpstreamPayload | null;
  const debug: Debug = {
    request: {
      body: sentBody(input),
      headers: {
        authorization: `Bearer ${maskKey(key)}`,
        "content-type": "application/json",
      },
      method: "POST",
      url,
    },
    response: {
      body: payload,
      headers: pickHeaders(res.headers),
      ms: round1(performance.now() - started),
      status: res.status,
    },
  };
  const retry = res.headers.get("retry-after");
  return finish(
    debug,
    payload,
    res.headers.get("x-request-id"),
    retry ? { "retry-after": retry } : {}
  );
}
