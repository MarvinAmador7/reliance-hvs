import evlog from "evlog/nitro/v3";
import { defineConfig } from "nitro";

export default defineConfig({
  // Read only by the Cloudflare build (NITRO_PRESET=cloudflare_module): the Percy demo
  // Worker on search.fieldgeist.com. It holds no API key (see src/lib/search-proxy.ts).
  cloudflare: {
    deployConfig: true,
    wrangler: {
      name: "fieldgeist-search-demo",
      observability: { enabled: true },
      ratelimits: [
        {
          name: "SEARCH_LIMITER",
          namespace_id: "4101",
          simple: { limit: 120, period: 60 },
        },
      ],
      routes: [{ custom_domain: true, pattern: "search.fieldgeist.com" }],
      // Fieldgeist's Demo entrypoint, as fieldgeist.com's own landing demo uses it: no API key.
      // The script name is Alchemy's prod server Worker (packages/infra/alchemy.run.ts, "server").
      services: [
        {
          binding: "FIELDGEIST",
          entrypoint: "Demo",
          service: "addriva-server-prod-yixhceynb33xildi",
        },
      ],
      vars: { DEMO_ONLY: "on" },
    },
  },
  experimental: {
    asyncContext: true,
  },
  // A no-op unless DEMO_ONLY=on (only the Cloudflare build sets it).
  handlers: [
    {
      handler: "./server/middleware/demo-only.ts",
      middleware: true,
      route: "/**",
    },
  ],
  modules: [
    evlog({
      env: { service: "reliance-hvs-web" },
    }),
  ],
});
