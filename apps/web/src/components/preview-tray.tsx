import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, X } from "lucide-react";
import { useState } from "react";

import { type TenantId, tenantOrder, tenants, useTenant } from "@/lib/tenant";
import { useTrackedEvents } from "@/lib/track";

const groups = [
  {
    items: [
      { label: "Search", to: "/home-report" },
      { label: "Home report", to: "/home-report/2148-bayshore-lane" },
    ],
    title: "Homeowner",
  },
  {
    items: [
      { label: "Overview", to: "/app" },
      { label: "Leads", to: "/app/leads" },
      { label: "Lead profile", params: { id: "L-4821" }, to: "/app/leads/$id" },
      { label: "Sites & widgets", to: "/app/sites" },
      { label: "Customize", to: "/app/customize" },
      { label: "Distribution", to: "/app/distribution" },
      { label: "Billing", to: "/app/billing" },
      { label: "Settings", to: "/app/settings" },
    ],
    title: "Brokerage console",
  },
  {
    items: [
      { label: "Preview index", to: "/" },
      { label: "Design notes", to: "/notes" },
      { label: "Design system", to: "/system" },
    ],
    title: "Overview",
  },
] as const;

/** Floating navigator for the design preview: jump between screens and switch the demo brokerage. */
export function PreviewTray() {
  const [open, setOpen] = useState(false);
  const { tenant, setTenantId } = useTenant();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const events = useTrackedEvents();

  return (
    <div
      className="fixed bottom-4 left-4 z-50 print:hidden"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {open ? (
        <div
          aria-label="Preview navigator"
          className="mb-2 w-72 rounded-2xl border border-[oklch(0.9_0_0)] bg-white p-3 text-[oklch(0.17_0_0)] shadow-[0_2px_6px_oklch(0_0_0/0.06),0_24px_64px_oklch(0_0_0/0.16)]"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-sm">Design preview</span>
            <button
              aria-label="Close preview navigator"
              className="rounded-full p-1 text-[oklch(0.45_0_0)] hover:bg-[oklch(0.96_0_0)]"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="mb-3">
            <div className="mb-1.5 text-[0.75rem] text-[oklch(0.45_0_0)]">
              Demo brokerage theme
            </div>
            <div className="grid grid-cols-1 gap-1">
              {tenantOrder.map((id: TenantId) => {
                const t = tenants[id];
                const selected = tenant.id === id;
                return (
                  <button
                    aria-pressed={selected}
                    className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[0.8125rem] transition-colors ${
                      selected
                        ? "border-[oklch(0.17_0_0)]"
                        : "border-[oklch(0.9_0_0)] hover:bg-[oklch(0.97_0_0)]"
                    }`}
                    key={id}
                    onClick={() => setTenantId(id)}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: t.theme.brand }}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {groups.map((g) => (
            <div className="mb-2 last:mb-0" key={g.title}>
              <div className="mb-1 text-[0.75rem] text-[oklch(0.45_0_0)]">
                {g.title}
              </div>
              <ul className="grid grid-cols-2 gap-1">
                {g.items.map((item) => {
                  const href =
                    "params" in item
                      ? item.to.replace("$id", item.params.id)
                      : item.to;
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        className={`block rounded-lg px-2 py-1.5 text-[0.8125rem] transition-colors ${
                          active
                            ? "bg-[oklch(0.17_0_0)] text-white"
                            : "text-[oklch(0.25_0_0)] hover:bg-[oklch(0.96_0_0)]"
                        }`}
                        onClick={() => setOpen(false)}
                        params={"params" in item ? item.params : undefined}
                        to={item.to}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      <ol aria-live="polite" className="mb-2 flex flex-col items-start gap-1.5">
        {events.map((e) => (
          <li
            className="rise flex items-baseline gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.8125rem] text-[oklch(0.17_0_0)] shadow-[0_1px_2px_oklch(0_0_0/0.08),0_8px_24px_oklch(0_0_0/0.14)]"
            key={e.id}
          >
            <span className="font-semibold">{e.name}</span>
            {e.value ? (
              <span className="text-[oklch(0.45_0_0)]">{e.value}</span>
            ) : null}
          </li>
        ))}
      </ol>
      <button
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full bg-[oklch(0.17_0_0)] pr-4 pl-3 font-medium text-[0.8125rem] text-white shadow-[0_8px_24px_oklch(0_0_0/0.25)] transition-transform hover:scale-[1.02]"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <LayoutGrid aria-hidden="true" className="size-4" />
        Preview
        <span
          aria-hidden="true"
          className="ml-1 size-2 rounded-full"
          style={{ background: tenant.theme.brand }}
        />
      </button>
    </div>
  );
}
