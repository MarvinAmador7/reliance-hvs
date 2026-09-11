import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Info, Lock, Mail, RotateCcw } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

import { HBars } from "@/components/charts/hbars";
import { LineChart } from "@/components/charts/line-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { Panel, Pill, Segmented, Switch } from "@/components/console/ui";
import { RelianceMark, TenantLogo } from "@/components/home-report/tenant-logo";
import { ValueGauge } from "@/components/home-report/value-gauge";
import {
  contrastRatio,
  readTypeMetrics,
  readVar,
  useMeasured,
} from "@/lib/measure";
import { daily, fmtMoney, months12, property } from "@/lib/mock-data";
import {
  type TenantId,
  tenantOrder,
  tenants,
  tenantVars,
  useTenant,
} from "@/lib/tenant";

export const Route = createFileRoute("/system")({
  component: SystemPage,
});

/* ---------- Type ---------- */

const publicType = [
  {
    cls: "t-display",
    label: "Display",
    sample: "Know what your home is worth.",
    note: "Search headline. Fluid, capped at 88px.",
  },
  {
    cls: "t-figure",
    label: "Figure",
    sample: "$798,000",
    note: "The estimate. Light weight so a large number stays calm.",
  },
  {
    cls: "t-h2",
    label: "Section heading",
    sample: "Your equity, estimated.",
    note: "One per section, always a sentence with a period.",
  },
  {
    cls: "t-h3",
    label: "Subheading",
    sample: "What could it sell for?",
    note: "Panels and cards.",
  },
  {
    cls: "t-lead",
    label: "Lead",
    sample: "Three independent estimates, shown side by side.",
    note: "The sentence under a heading.",
  },
  {
    cls: "t-body",
    label: "Body",
    sample:
      "From public records. If something's wrong, claim this home to fix it.",
    note: "17px. Never smaller for prose.",
  },
  {
    cls: "t-caption",
    label: "Caption",
    sample: "Estimates are automated and are not an appraisal.",
    note: "Legal lines, axis labels, footnotes.",
  },
] as const;

const consoleType = [
  { cls: "c-title", label: "Page title", sample: "Overview" },
  {
    cls: "c-section",
    label: "Panel title",
    sample: "Reports and leads, daily",
  },
  {
    cls: "text-[0.9375rem]",
    label: "Body",
    sample:
      "One configuration powers the hosted site, embeds, and agent pages.",
  },
  { cls: "c-label", label: "Label", sample: "vs prior 30 days" },
  {
    cls: "tabular text-sm",
    label: "Table",
    sample: "12,480  ·  3,912  ·  12.4%",
  },
] as const;

function TypeRow({
  cls,
  label,
  sample,
  note,
}: {
  cls: string;
  label: string;
  sample: string;
  note?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { tenant } = useTenant();
  const m = useMeasured(ref, readTypeMetrics, [tenant.id, cls]);
  return (
    <div className="grid gap-3 border-line border-t py-6 md:grid-cols-[9rem_1fr_12rem] md:gap-8">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {note ? (
          <div className="mt-1 text-ink-muted text-sm">{note}</div>
        ) : null}
      </div>
      <div className={`${cls} min-w-0 break-words`} ref={ref}>
        {sample}
      </div>
      <dl className="tabular grid grid-cols-2 gap-x-3 gap-y-1 self-start text-ink-muted text-xs md:grid-cols-1">
        <div className="flex justify-between gap-2">
          <dt>Size</dt>
          <dd className="text-ink">{m?.fontSize ?? "…"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Weight</dt>
          <dd className="text-ink">{m?.fontWeight ?? "…"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Tracking</dt>
          <dd className="text-ink">{m?.letterSpacing ?? "…"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Leading</dt>
          <dd className="text-ink">{m?.lineHeight ?? "…"}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ---------- Color ---------- */

type TokenKind = "surface" | "text" | "fill" | "line";

const tokenRows: { name: string; role: string; kind: TokenKind }[] = [
  { kind: "surface", name: "--c-bg", role: "Page" },
  { kind: "surface", name: "--c-surface", role: "Panels, sidebar" },
  { kind: "text", name: "--c-ink", role: "Text" },
  { kind: "text", name: "--c-muted", role: "Secondary text" },
  { kind: "line", name: "--c-line", role: "Hairlines" },
  { kind: "fill", name: "--c-brand", role: "Actions, markers" },
  { kind: "surface", name: "--c-brand-soft", role: "Washes, chips" },
  { kind: "fill", name: "--c-dark", role: "Drenched sections" },
];

const gradeFor = (
  ratio: number
): { label: string; tone: "good" | "warn" | "neutral" } => {
  if (ratio >= 7) {
    return { label: "AAA", tone: "good" };
  }
  if (ratio >= 4.5) {
    return { label: "AA", tone: "good" };
  }
  if (ratio >= 3) {
    return { label: "Large only", tone: "warn" };
  }
  return { label: "Decorative", tone: "neutral" };
};

const comparisonFor = (kind: TokenKind): string => {
  if (kind === "text") {
    return "as text on the page";
  }
  if (kind === "fill") {
    return "with white text";
  }
  if (kind === "line") {
    return "against the page";
  }
  return "with body text on it";
};

const swatchInk = (kind: TokenKind, name: string): string => {
  if (kind === "text") {
    return `var(${name})`;
  }
  return kind === "fill" ? "white" : "var(--c-ink)";
};

function Swatch({
  name,
  role,
  kind,
}: {
  name: string;
  role: string;
  kind: TokenKind;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { tenant } = useTenant();
  const data = useMeasured(
    ref,
    (el) => {
      const value = readVar(el, name);
      const bg = readVar(el, "--c-bg");
      const ink = readVar(el, "--c-ink");
      let ratio: number | null = null;
      if (kind === "text" || kind === "line") {
        ratio = contrastRatio(value, bg);
      } else if (kind === "fill") {
        ratio = contrastRatio("white", value);
      } else {
        ratio = contrastRatio(ink, value);
      }
      return { ratio, value };
    },
    [tenant.id, name, kind]
  );
  const ratio = data?.ratio ?? null;
  const isText = kind === "text";
  return (
    <div className="min-w-0" ref={ref}>
      <div
        className="flex h-20 items-end rounded-[12px] p-2.5 ring-1 ring-ink/10 ring-inset"
        style={{
          background: isText ? "var(--c-bg)" : `var(${name})`,
          color: swatchInk(kind, name),
        }}
      >
        <span className={isText ? "font-semibold text-2xl" : "text-xs"}>
          Aa
        </span>
      </div>
      <div className="mt-2 font-mono text-[0.6875rem] text-ink">{name}</div>
      <div className="text-ink-muted text-xs">{role}</div>
      <div className="mt-1 truncate font-mono text-[0.6875rem] text-ink-muted">
        {data?.value ?? "…"}
      </div>
      {ratio ? (
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="tabular text-ink">{ratio.toFixed(1)}:1</span>
          <Pill tone={gradeFor(ratio).tone}>{gradeFor(ratio).label}</Pill>
          <span className="w-full text-[0.6875rem] text-ink-muted">
            {comparisonFor(kind)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Spacing ---------- */

const spaceScale = [4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

/* ---------- Composition ---------- */

function Block({
  name,
  when,
  children,
}: {
  name: string;
  when: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold text-sm">{name}</span>
        <span className="text-ink-muted text-sm">{when}</span>
      </div>
      <div className="rounded-2xl border border-line p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-[14rem_1fr] md:gap-16">
      <div className="md:sticky md:top-8 md:self-start">
        <h2 className="t-h3">{title}</h2>
        {intro ? <p className="mt-2 text-ink-muted text-sm">{intro}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function SystemPage() {
  const { tenant, setTenantId } = useTenant();
  const [replay, setReplay] = useState(0);
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [demoSeg, setDemoSeg] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="bg-canvas text-ink">
      <header className="wrap flex h-[4.5rem] items-center justify-between">
        <Link
          className="inline-flex items-center gap-2 text-ink-muted text-sm hover:text-ink"
          to="/"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Preview index
        </Link>
        <span className="inline-flex items-center gap-2 text-sm">
          <RelianceMark className="size-5" /> Reliance Home Report
        </span>
      </header>

      <main className="wrap pb-24">
        <div className="max-w-[72ch] pt-10 pb-10">
          <h1 className="t-display">Design system.</h1>
          <p className="t-lead mt-6 text-ink-muted">
            Every value on this page is read back from the rendered elements,
            not typed in. Switch the brokerage below and watch the tokens,
            contrast ratios, and controls follow.
          </p>
        </div>

        <div className="mb-16 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-ink-muted text-sm">Brokerage theme</span>
          {tenantOrder.map((id: TenantId) => {
            const t = tenants[id];
            const selected = tenant.id === id;
            return (
              <button
                aria-pressed={selected}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selected ? "border-ink" : "border-line hover:bg-surface"
                }`}
                key={id}
                onClick={() => setTenantId(id)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full"
                  style={{ background: t.theme.brand }}
                />
                {t.name}
              </button>
            );
          })}
        </div>

        <div
          className="home-report @container space-y-20"
          style={tenantVars(tenant)}
        >
          <Section
            intro="One family, Hanken Grotesk, on both surfaces. Public pages use a fluid scale; the console uses fixed sizes."
            title="Type"
          >
            <h3 className="mb-2 font-semibold text-sm">Public pages</h3>
            {publicType.map((t) => (
              <TypeRow key={t.cls} {...t} />
            ))}
            <h3 className="mt-14 mb-2 font-semibold text-sm">Console</h3>
            {consoleType.map((t) => (
              <TypeRow key={t.cls} {...t} />
            ))}
            <p className="mt-8 text-ink-muted text-sm">
              Numbers in tables and axes use tabular figures so columns align.
              Large standalone figures use proportional figures so they don't
              look loose. Display tracking never goes tighter than -0.04em.
            </p>
          </Section>

          <Section
            intro={`Tokens for ${tenant.name}. Each ratio is computed in the browser for the way that token is actually used.`}
            title="Color"
          >
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {tokenRows.map((t) => (
                <Swatch key={t.name} {...t} />
              ))}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-dark p-6 text-canvas">
                <div className="text-canvas/60 text-sm">Drenched, dark</div>
                <div className="t-figure-sm mt-2">$798,000</div>
                <p className="mt-3 text-canvas/70 text-sm">
                  Equity section. One per page. White at 70% for secondary text.
                </p>
              </div>
              <div className="rounded-2xl bg-brand p-6 text-brand-ink">
                <div className="text-brand-ink/70 text-sm">Drenched, brand</div>
                <div className="t-h3 mt-2">Watch this home.</div>
                <p className="mt-3 text-brand-ink/80 text-sm">
                  Monthly update section. The only place the brand color fills a
                  block.
                </p>
              </div>
            </div>
            <p className="mt-6 text-ink-muted text-sm">
              Rules. Pure white page, no tinted paper. The brand color appears
              on actions, markers, and the one drenched section. Gray text is
              never lighter than 4.5:1 on white. Charts use their own fixed
              palette so a brokerage's brand never collides with a data series.
            </p>
          </Section>

          <Section
            intro="A 4pt scale. Tight inside a group, generous between groups."
            title="Spacing and radius"
          >
            <div className="flex flex-wrap items-end gap-3">
              {spaceScale.map((s) => (
                <div className="flex flex-col items-center gap-2" key={s}>
                  <div
                    className="w-8 rounded-sm bg-brand/30"
                    style={{ height: s }}
                  />
                  <span className="tabular text-ink-muted text-xs">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {tenantOrder.map((id) => {
                const t = tenants[id];
                return (
                  <div className="flex items-center gap-3" key={id}>
                    <div
                      className="size-14 shrink-0 border-2 border-ink/70"
                      style={{ borderRadius: t.theme.radius }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{t.name}</div>
                      <div className="tabular text-ink-muted">
                        Radius {t.theme.radius}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-ink-muted text-sm">
              Radius is a brokerage token from 6 to 24px. Cards top out at 16px.
              Pills are full-round regardless. Section padding on public pages
              runs from 72px on phones to 128px on desktop.
            </p>
          </Section>

          <Section
            intro="Every control in its states. Hover to see the rest."
            title="Controls"
          >
            <div className="space-y-8">
              <div>
                <div className="mb-3 text-ink-muted text-sm">Buttons</div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn btn-brand btn-pill" type="button">
                    Talk to {tenant.agent.name.split(" ")[0]}
                  </button>
                  <button className="btn btn-ink btn-pill" type="button">
                    <Mail aria-hidden="true" className="size-4" /> Watch this
                    home
                  </button>
                  <button className="btn btn-ghost btn-pill" type="button">
                    Claim this home
                  </button>
                  <span className="btn btn-soft btn-pill">
                    <Check aria-hidden="true" className="size-4" /> Your home
                  </span>
                  <button
                    className="btn btn-brand btn-pill"
                    disabled
                    type="button"
                  >
                    Disabled
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button className="btn btn-brand btn-md" type="button">
                    Publish changes
                  </button>
                  <button className="btn btn-ghost btn-md" type="button">
                    Discard
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button">
                    Export
                  </button>
                  <button className="btn btn-brand btn-sm" type="button">
                    Assign agent
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-3 text-ink-muted text-sm">Fields</div>
                <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                  <input className="field" placeholder="Default" type="text" />
                  <input className="field" defaultValue="Filled" type="text" />
                  <input
                    aria-invalid="true"
                    className="field ring-2 ring-bad/40"
                    defaultValue="not-an-email"
                    type="text"
                  />
                  <input
                    className="field"
                    disabled
                    placeholder="Disabled"
                    type="text"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 text-ink-muted text-sm">
                  Chips, pills, and status
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">4 bd</span>
                  <span className="chip chip-brand">
                    <Check aria-hidden="true" className="size-3.5" />{" "}
                    Pre-approved
                  </span>
                  <span className="chip chip-brand">Your home</span>
                  <Pill dot tone="good">
                    Live
                  </Pill>
                  <Pill dot tone="brand">
                    New
                  </Pill>
                  <Pill tone="warn">Draft</Pill>
                  <Pill tone="neutral">Contacted</Pill>
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <div className="mb-3 text-ink-muted text-sm">
                    Segmented control
                  </div>
                  <Segmented
                    label="Range"
                    onChange={setDemoSeg}
                    options={[
                      { label: "7 days", value: "7d" },
                      { label: "30 days", value: "30d" },
                      { label: "90 days", value: "90d" },
                    ]}
                    size="md"
                    value={demoSeg}
                  />
                </div>
                <div>
                  <div className="mb-3 text-ink-muted text-sm">
                    Switch and tooltip
                  </div>
                  <div className="flex items-center gap-5">
                    <Switch
                      checked={demoSwitch}
                      label="Demo switch"
                      onChange={setDemoSwitch}
                    />
                    <span className="group relative inline-flex items-center gap-1.5 text-ink-muted text-sm">
                      Powered by
                      <button
                        aria-label="About this estimate"
                        className="rounded-full hover:text-ink"
                        type="button"
                      >
                        <Info aria-hidden="true" className="size-4" />
                      </button>
                      <span
                        className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-52 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-canvas text-xs leading-relaxed opacity-0 shadow-float transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                        role="tooltip"
                      >
                        Nationwide AVM built on public records and MLS data.
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 text-ink-muted text-sm">
                  Range gauge and locked note
                </div>
                <div className="max-w-sm">
                  <ValueGauge
                    high={property.estimate.high}
                    low={property.estimate.low}
                    value={property.estimate.value}
                  />
                </div>
                <p className="mt-4 inline-flex items-center gap-1.5 text-ink-muted text-sm">
                  <Lock aria-hidden="true" className="size-3.5" />
                  Claim this home to save your condition.
                </p>
              </div>
            </div>
          </Section>

          <Section
            intro="One rule set for every chart, so an operator never has to learn a new one."
            title="Charts"
          >
            <div className="grid gap-8 md:grid-cols-2">
              <div className="panel p-5">
                <div className="c-section">Two series, legend on</div>
                <div className="mt-3">
                  <LineChart
                    height={180}
                    labels={months12}
                    series={[
                      {
                        color: "#2a78d6",
                        data: daily.slice(0, 12).map((d) => d.reports),
                        name: "Reports",
                      },
                      {
                        color: "#eb6834",
                        data: daily.slice(0, 12).map((d) => d.leads),
                        name: "Leads",
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="panel p-5">
                <div className="c-section">Emphasis, one row in brand</div>
                <div className="mt-4">
                  <HBars
                    dense
                    emphasizeMatch
                    rows={property.buyers.demand.beds}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-ink-muted text-sm">
              <span className="inline-flex items-center gap-2">
                <Sparkline data={daily.map((d) => d.leads)} /> Sparkline in a
                stat tile
              </span>
            </div>
            <ul className="mt-6 list-disc space-y-1.5 pl-5 text-ink-muted text-sm">
              <li>One axis per chart. Two measures means two charts.</li>
              <li>
                Lines are 2px, bars no thicker than 24px, gridlines are
                hairlines.
              </li>
              <li>
                Categorical series use the fixed palette in order: blue, orange,
                aqua, yellow.
              </li>
              <li>
                Direct-label the end, the max, or the one series the story is
                about. Never every point.
              </li>
              <li>
                Text never wears a series color. A colored mark sits beside it
                instead.
              </li>
            </ul>
          </Section>

          <Section
            intro="Little, and only where it says something."
            title="Motion"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="rise rounded-2xl bg-surface px-6 py-5"
                key={replay}
              >
                <div className="text-ink-muted text-sm">Entrance</div>
                <div className="t-h3">Rises 14px, fades in, 700ms</div>
              </div>
              <button
                className="btn btn-ghost btn-md"
                onClick={() => setReplay((n) => n + 1)}
                type="button"
              >
                <RotateCcw aria-hidden="true" className="size-4" /> Replay
              </button>
            </div>
            <dl className="mt-8 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[12rem_1fr]">
              <dt className="text-ink-muted">Hero entrance</dt>
              <dd>
                Headline, lead, search, and note rise in sequence, 90ms apart.
              </dd>
              <dt className="text-ink-muted">Sections</dt>
              <dd>
                Rise as they enter the viewport, driven by scroll position.
                Visible by default; nothing is gated on the animation.
              </dd>
              <dt className="text-ink-muted">Figures</dt>
              <dd>The estimate counts up over 900ms on load.</dd>
              <dt className="text-ink-muted">Console</dt>
              <dd>150 to 200ms on state changes only. No page choreography.</dd>
              <dt className="text-ink-muted">Reduced motion</dt>
              <dd>
                Every animation has a no-motion path. Content never waits for
                it.
              </dd>
              <dt className="text-ink-muted">Easing</dt>
              <dd className="font-mono text-xs">
                cubic-bezier(0.22, 1, 0.36, 1)
              </dd>
            </dl>
          </Section>

          <Section intro="Widths, rhythm, and where things sit." title="Layout">
            <div className="space-y-3">
              <div
                className="rounded-lg bg-surface px-3 py-2 text-sm"
                style={{ width: "100%" }}
              >
                Console content, up to 1280px
              </div>
              <div
                className="rounded-lg bg-brand/15 px-3 py-2 text-sm"
                style={{ width: "87.5%" }}
              >
                Public content column, up to 1120px
              </div>
              <div
                className="rounded-lg bg-brand/30 px-3 py-2 text-sm"
                style={{ width: "56%" }}
              >
                Prose measure, 62 to 72 characters
              </div>
              <div
                className="rounded-lg bg-brand/45 px-3 py-2 text-sm"
                style={{ width: "34%" }}
              >
                Phone, 390px
              </div>
            </div>
            <dl className="mt-8 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[12rem_1fr]">
              <dt className="text-ink-muted">Public page rhythm</dt>
              <dd>
                Hero, then sections that alternate white, one dark, one photo,
                one brand. Sticky section nav on the report.
              </dd>
              <dt className="text-ink-muted">Section anatomy</dt>
              <dd>
                Heading, one lead sentence, then a two-column body. Figure or
                copy on the left, evidence on the right.
              </dd>
              <dt className="text-ink-muted">Console</dt>
              <dd>
                240px sidebar on a tinted surface, 56px top bar, 24px gutters.
                Panels have a hairline and no shadow.
              </dd>
              <dt className="text-ink-muted">Cards</dt>
              <dd>
                Only when the content is a distinct object. Lists use hairlines.
                Cards never nest.
              </dd>
            </dl>
          </Section>

          <Section
            intro="The repeatable arrangements every screen is built from. New sections reuse these instead of inventing a layout."
            title="Composition"
          >
            <div className="space-y-10">
              <Block
                name="Section anatomy"
                when="Every report section. Heading, one lead sentence, then figure on the left and evidence on the right."
              >
                <h3 className="t-h2">Your equity, estimated.</h3>
                <p className="t-lead mt-3 max-w-[40ch] text-ink-muted">
                  What you'd likely walk away with, before you list.
                </p>
                <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.4fr]">
                  <div>
                    <div className="t-figure-sm tabular">$798,000</div>
                    <p className="mt-2 text-ink-muted">
                      Estimated value less the estimated loan balance.
                    </p>
                  </div>
                  <HBars
                    dense
                    emphasizeMatch
                    format={(n) => fmtMoney(n, true)}
                    rows={[
                      { label: "Estimated value", value: 1_284_000 },
                      { label: "Loan balance", value: 486_000 },
                      { label: "Equity", match: true, value: 798_000 },
                    ]}
                  />
                </div>
              </Block>

              <Block
                name="Triptych"
                when="Three parallel facts of equal weight. Hairline on top, no cards."
              >
                <div className="grid gap-8 sm:grid-cols-3">
                  {[
                    ["Estimated value", "$1.28M", "Three sources, one range."],
                    ["Estimated equity", "$798K", "Before you list."],
                    ["Buyers looking", "27", "Within five miles."],
                  ].map(([label, figure, note]) => (
                    <div className="border-line border-t pt-4" key={label}>
                      <div className="text-ink-muted text-sm">{label}</div>
                      <div className="t-figure-sm tabular mt-2">{figure}</div>
                      <p className="mt-2 text-ink-muted text-sm">{note}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <Block
                name="Stat strip"
                when="Many small numbers with equal weight. Two rows on phones, one on desktop."
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-line border-t pt-6 md:grid-cols-6">
                  {[
                    ["Median sale price", "$1.19M"],
                    ["Homes sold", "148"],
                    ["For sale now", "61"],
                    ["Months of supply", "4.9"],
                    ["Days on market", "38"],
                    ["Sale to list", "97.2%"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-ink-muted text-sm">{label}</div>
                      <div className="tabular mt-1 font-semibold text-2xl tracking-[-0.01em]">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              <Block
                name="Hairline list"
                when="Rows of distinct items. Thumbnail or avatar, two lines of text, a value on the right. Never a card per row."
              >
                <ol className="divide-y divide-line border-line border-y">
                  {property.comps.slice(0, 3).map((c, i) => (
                    <li
                      className="flex items-center gap-4 py-3.5"
                      key={c.address}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-canvas text-xs">
                        {i + 1}
                      </span>
                      <img
                        alt=""
                        className="size-12 shrink-0 rounded-xl object-cover"
                        height={48}
                        src={c.photo}
                        width={48}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{c.address}</div>
                        <div className="text-ink-muted text-sm">
                          {c.beds} bd · {c.baths} ba · {c.distance} mi
                        </div>
                      </div>
                      <div className="tabular font-semibold">
                        ${(c.price / 1_000_000).toFixed(2)}M
                      </div>
                    </li>
                  ))}
                </ol>
              </Block>

              <Block
                name="Soft panel"
                when="An interactive tool inside a section. Surface tint, 24px radius, copy on the left and the control on the right."
              >
                <div className="grid gap-8 rounded-3xl bg-surface p-6 md:grid-cols-[1fr_1.35fr] md:p-8">
                  <div>
                    <h4 className="t-h3">What could it sell for?</h4>
                    <p className="mt-2 text-ink-muted">
                      You could reasonably list between{" "}
                      <span className="tabular font-medium text-ink">
                        $1.21M
                      </span>{" "}
                      and{" "}
                      <span className="tabular font-medium text-ink">
                        $1.33M
                      </span>
                      .
                    </p>
                  </div>
                  <div className="self-center">
                    <ValueGauge
                      high={property.estimate.high}
                      low={property.estimate.low}
                      value={property.estimate.value}
                    />
                  </div>
                </div>
              </Block>

              <Block
                name="Ask"
                when="The one place a section asks for something. Pill field and pill button in a row; on phones they stack."
              >
                <div className="flex max-w-lg flex-col gap-3 sm:flex-row">
                  <input
                    className="field h-13 flex-1 rounded-full px-5 text-base"
                    placeholder="Email address"
                    type="email"
                  />
                  <button className="btn btn-brand btn-pill" type="button">
                    <Mail aria-hidden="true" className="size-4" /> Watch this
                    home
                  </button>
                </div>
              </Block>

              <Block
                name="Console panel"
                when="Every console module. Hairline border, 14px radius, title and one-line subtitle, optional action on the right."
              >
                <Panel
                  action={
                    <button className="btn btn-ghost btn-sm" type="button">
                      All leads
                    </button>
                  }
                  sub="Newest first"
                  title="Recent leads"
                >
                  <HBars
                    dense
                    rows={[
                      { label: "Direct mail QR", value: 1312 },
                      { label: "Meta ads", value: 1018 },
                      { label: "Organic search", value: 743 },
                    ]}
                  />
                </Panel>
              </Block>

              <Block
                name="Section nav"
                when="Sticky under the header on long pages. Pills, the active one filled with ink, scrolls sideways on phones."
              >
                <ul className="flex w-max gap-1">
                  {["Value", "Equity", "Buyers", "Market", "Nearby sales"].map(
                    (label, i) => (
                      <li
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[0.9375rem] ${
                          i === 0
                            ? "bg-ink font-medium text-canvas"
                            : "text-ink-muted"
                        }`}
                        key={label}
                      >
                        {label}
                      </li>
                    )
                  )}
                </ul>
              </Block>
            </div>
          </Section>

          <Section
            intro="The same components, wearing the brokerage."
            title="Brand in place"
          >
            <div className="rounded-3xl border border-line p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <TenantLogo />
                <a className="btn btn-ghost btn-md rounded-full" href="#agent">
                  Talk to an agent
                </a>
              </div>
              <div className="mt-8 text-ink-muted">Estimated value</div>
              <div className="t-figure-sm mt-1">$1,284,000</div>
              <div className="mt-4 max-w-sm">
                <ValueGauge
                  high={property.estimate.high}
                  low={property.estimate.low}
                  value={property.estimate.value}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn btn-brand btn-pill" type="button">
                  Talk to {tenant.agent.name.split(" ")[0]}
                </button>
                <button className="btn btn-ghost btn-pill" type="button">
                  Claim this home
                </button>
              </div>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
