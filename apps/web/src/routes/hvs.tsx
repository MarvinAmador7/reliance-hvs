import { createFileRoute, Outlet } from "@tanstack/react-router";

import { tenantVars, useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/hvs")({
  component: HvsLayout,
});

/** Public site wrapper: applies the brokerage theme tokens to everything inside. */
function HvsLayout() {
  const { tenant } = useTenant();
  return (
    <div
      className="hvs min-h-svh bg-canvas text-ink"
      style={tenantVars(tenant)}
    >
      <Outlet />
    </div>
  );
}
