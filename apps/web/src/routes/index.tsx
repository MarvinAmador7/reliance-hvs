import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { RelianceMark } from "@/components/home-report/tenant-logo";

const BOTTOM_TOLERANCE = 24;

export const Route = createFileRoute("/")({
  component: PreviewIndex,
});

const surfaces = [
  {
    to: "/home-report",
    title: "Homeowner experience",
    body: "The public pages a brokerage's visitors see: an address search and a home report that gives the number first, then earns the lead.",
    screens: ["Search", "Home report"],
  },
  {
    to: "/app",
    title: "Brokerage console",
    body: "Where a brokerage sets up, brands, distributes, and bills its Home Report, and watches it as a line of business.",
    screens: [
      "Overview",
      "Leads",
      "Sites & widgets",
      "Customize",
      "Distribution",
      "Billing",
      "Settings",
    ],
  },
] as const;

function PreviewIndex() {
  return (
    <main className="wrap flex min-h-svh flex-col justify-between py-10">
      <div className="flex items-center gap-2.5">
        <RelianceMark />
        <span className="font-semibold text-ink tracking-[-0.01em]">
          Reliance
        </span>
        <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-medium text-[0.6875rem] text-brand">
          Home Report
        </span>
      </div>

      <div className="py-16 md:py-24">
        <h1 className="t-display max-w-[14ch]">
          A home value platform, reimagined.
        </h1>
        <p className="t-lead measure mt-6 text-ink-muted">
          Design preview for the Reliance home valuation product. Two surfaces,
          one design language, built to be themed per brokerage without custom
          code. Prepared by Mythicbyte, September 2026.
        </p>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {surfaces.map((s, i) => (
            <Link
              className={`group rounded-2xl p-7 transition-colors ${
                i === 0
                  ? "bg-dark text-canvas"
                  : "border border-line hover:bg-surface"
              }`}
              key={s.to}
              to={s.to}
            >
              <div className="flex items-start justify-between gap-6">
                <h2 className="t-h3">{s.title}</h2>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-1"
                />
              </div>
              <p
                className={`t-body mt-3 ${i === 0 ? "text-canvas/75" : "text-ink-muted"}`}
              >
                {s.body}
              </p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {s.screens.map((screen) => (
                  <li
                    className={`rounded-full px-2.5 py-1 text-sm ${
                      i === 0
                        ? "bg-canvas/12 text-canvas"
                        : "bg-surface text-ink"
                    }`}
                    key={screen}
                  >
                    {screen}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link
            className="group rounded-2xl border border-line p-7 transition-colors hover:bg-surface"
            to="/notes"
          >
            <div className="flex items-start justify-between gap-6">
              <h2 className="t-h3">Design notes</h2>
              <ArrowRight
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-1"
              />
            </div>
            <p className="t-body mt-3 text-ink-muted">
              What the two pages can measure, how customization scales across
              hundreds of brokerages, and how hosted pages and embedded widgets
              share one configuration.
            </p>
          </Link>
          <Link
            className="group rounded-2xl border border-line p-7 transition-colors hover:bg-surface"
            to="/system"
          >
            <div className="flex items-start justify-between gap-6">
              <h2 className="t-h3">Design system</h2>
              <ArrowRight
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-1"
              />
            </div>
            <p className="t-body mt-3 text-ink-muted">
              Type, color, spacing, controls, charts, and motion, rendered live
              from the same tokens the pages use.
            </p>
          </Link>
          <div className="rounded-2xl bg-surface p-7 md:col-span-2">
            <h2 className="t-h3">How to use this preview</h2>
            <p className="t-body mt-3 text-ink-muted">
              The Preview button at the bottom left jumps between screens and
              switches the demo brokerage theme. Everything on the homeowner
              pages re-brands from that one switch, which is the customization
              model we propose.
            </p>
          </div>
        </div>
      </div>

      <p className="text-ink-muted text-sm">
        Fictional brokerages and data throughout. Estimates, buyers, and leads
        are illustrative.
      </p>

      <StartHereArrow />
    </main>
  );
}

/** Fixed pointer from a "Start here" label to the Preview button. Appears once the page is scrolled to the bottom. */
function StartHereArrow() {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const check = () => {
      const doc = document.documentElement;
      const reached =
        window.innerHeight + window.scrollY >=
        doc.scrollHeight - BOTTOM_TOLERANCE;
      setAtBottom(reached);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!atBottom) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[3.5rem] left-[5.75rem] z-40 hidden sm:block"
    >
      <svg
        aria-hidden="true"
        className="overflow-visible"
        fill="none"
        height="80"
        viewBox="0 0 130 80"
        width="130"
      >
        <path
          className="arrow-draw"
          d="M122 10 C 90 12, 46 28, 18 64"
          stroke="var(--c-ink)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          className="arrow-head"
          d="M24 48 L18 64 L35 62"
          stroke="var(--c-ink)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span className="rise absolute top-0 left-[8.5rem] -translate-y-1/2 whitespace-nowrap font-semibold text-ink text-sm">
        Start here
      </span>
    </div>
  );
}
