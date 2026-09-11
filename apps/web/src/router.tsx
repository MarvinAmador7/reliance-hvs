import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createTanStackRouter({
    defaultNotFoundComponent: () => (
      <div className="wrap sec">
        <h1 className="t-h2">Page not found</h1>
        <p className="t-body mt-3 text-ink-muted">
          This preview link doesn't exist.
        </p>
      </div>
    ),
    defaultPendingComponent: () => <Loader />,
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
