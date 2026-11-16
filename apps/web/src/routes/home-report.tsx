import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { CSSProperties } from "react";

export const Route = createFileRoute("/home-report")({
  component: HvsLayout,
  head: () => ({
    links: [
      { rel: "icon", href: "/fieldgeist-favicon.svg", type: "image/svg+xml" },
    ],
    meta: [
      { title: "Address search · Fieldgeist" },
      {
        name: "description",
        content:
          "Search more than 130 million US addresses as you type, with the parcel's APN and county in every suggestion.",
      },
    ],
  }),
});

/**
 * Fieldgeist's light palette (fieldgeist repo, packages/ui globals.css and apps/web/DESIGN.md):
 * near-black on white and #f5f5f7, hairlines, and one amber signal for what is live,
 * selected or focused.
 */
const FIELDGEIST_THEME = {
  "--c-bg": "#ffffff",
  "--c-brand": "#1d1d1f",
  "--c-brand-ink": "#ffffff",
  "--c-brand-soft": "rgb(0 0 0 / 4%)",
  "--c-dark": "#1d1d1f",
  "--c-ink": "#1d1d1f",
  "--c-line": "rgb(0 0 0 / 10%)",
  "--c-muted": "#6e6e73",
  "--c-radius": "16px",
  "--c-signal": "#FF9F45",
  "--c-surface": "#f5f5f7",
} as CSSProperties;

/** Percy demo wrapper: Fieldgeist's palette for everything inside. */
function HvsLayout() {
  return (
    <div
      className="home-report @container min-h-svh bg-canvas text-ink"
      style={FIELDGEIST_THEME}
    >
      <Outlet />
    </div>
  );
}
