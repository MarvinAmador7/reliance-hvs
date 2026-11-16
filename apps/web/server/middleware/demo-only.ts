import { defineHandler } from "nitro";

import {
  type FieldgeistDemo,
  json,
  searchViaDemo,
} from "../../src/lib/search-proxy";

/*
  search.fieldgeist.com (the Percy demo) serves only the Fieldgeist search pages.
  Active only when the Worker has DEMO_ONLY=on (set in nitro.config.ts for the
  Cloudflare build); local dev and the Reliance deploys are untouched.

  - "/" goes to the search page.
  - Everything else outside the demo (the Reliance console and preview pages) is 404.
  - Search goes to Fieldgeist's Demo entrypoint over the FIELDGEIST service binding,
    the same way fieldgeist.com's landing demo does it: no API key. Each IP also
    gets SEARCH_LIMITER's budget here before Fieldgeist applies its own.
  Static assets never reach this: Cloudflare serves them before the Worker runs.
*/

const DEMO_PATH = /^\/(?:home-report(?:\/|$)|api\/address-search$|_serverFn\/)/;
const SEARCH_PATH = "/api/address-search";

interface RateLimiter {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
}

interface DemoEnv {
  DEMO_ONLY?: string;
  FIELDGEIST?: FieldgeistDemo;
  SEARCH_LIMITER?: RateLimiter;
}

export default defineHandler(async (event) => {
  const { runtime } = event.req as {
    runtime?: { cloudflare?: { env?: DemoEnv } };
  };
  const { env } = runtime?.cloudflare ?? {};
  if (env?.DEMO_ONLY !== "on") {
    return;
  }

  const url = new URL(event.req.url);
  if (url.pathname === "/") {
    return Response.redirect(new URL("/home-report", url), 302);
  }
  if (!DEMO_PATH.test(url.pathname)) {
    return new Response("Not found", { status: 404 });
  }

  if (url.pathname !== SEARCH_PATH) {
    return;
  }
  const ip = event.req.headers.get("cf-connecting-ip") ?? "unknown";
  if (env.SEARCH_LIMITER) {
    const { success } = await env.SEARCH_LIMITER.limit({ key: ip });
    if (!success) {
      return json(
        429,
        {
          error: "rate_limited",
          message:
            "Too many searches from this address. Try again in a minute.",
        },
        { "retry-after": "60" }
      );
    }
  }
  if (env.FIELDGEIST && event.req.method === "POST") {
    return searchViaDemo(event.req, env.FIELDGEIST, ip);
  }
});
