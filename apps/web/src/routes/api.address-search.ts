import { createFileRoute } from "@tanstack/react-router";

import { searchViaKey } from "@/lib/search-proxy";

/*
  POST /api/address-search for local dev: the public API with FIELDGEIST_API_KEY.
  On search.fieldgeist.com the request never gets here: server/middleware/demo-only.ts
  answers it through the Fieldgeist Demo service binding (see src/lib/search-proxy.ts).
*/
export const Route = createFileRoute("/api/address-search")({
  server: {
    handlers: {
      POST: ({ request }) => searchViaKey(request),
    },
  },
});
