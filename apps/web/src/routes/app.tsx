import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, CircleHelp } from "lucide-react";

import { Sidebar } from "@/components/console/sidebar";

export const Route = createFileRoute("/app")({
  component: ConsoleLayout,
});

function ConsoleLayout() {
  return (
    <div className="grid min-h-svh bg-canvas text-ink md:grid-cols-[15rem_1fr]">
      <div className="hidden border-line border-r bg-surface md:block">
        <div className="sticky top-0 h-svh">
          <Sidebar />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex h-14 items-center justify-between border-line border-b px-6">
          <div className="text-ink-muted text-sm md:hidden">
            Reliance Home Report console
          </div>
          <div className="hidden text-ink-muted text-sm md:block">
            Harbor & Vale Real Estate · Production
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Help"
              className="rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink"
              type="button"
            >
              <CircleHelp aria-hidden="true" className="size-4" />
            </button>
            <button
              aria-label="Notifications, 2 unread"
              className="relative rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink"
              type="button"
            >
              <Bell aria-hidden="true" className="size-4" />
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand"
              />
            </button>
          </div>
        </div>
        <main className="wrap-wide py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
