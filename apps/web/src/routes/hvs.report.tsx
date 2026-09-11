import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  Check,
  ChevronDown,
  Info,
  Ruler,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ColumnChart } from "@/components/charts/column-chart";
import { CompsMap } from "@/components/charts/comps-map";
import { HBars } from "@/components/charts/hbars";
import { LineChart } from "@/components/charts/line-chart";
import {
  ClaimButton,
  ClaimLink,
  ClaimProvider,
} from "@/components/hvs/claim-dialog";
import { CountUp, Reveal } from "@/components/hvs/motion";
import { SectionNav } from "@/components/hvs/section-nav";
import { SellForPanel } from "@/components/hvs/sell-for-panel";
import { SiteFooter, SiteHeader } from "@/components/hvs/site-chrome";
import { ValueGauge } from "@/components/hvs/value-gauge";
import { WatchHome } from "@/components/hvs/watch-home";
import { fmtMoney, fmtNum, months12, property } from "@/lib/mock-data";
import { useTenant } from "@/lib/tenant";
import { track } from "@/lib/track";

export const Route = createFileRoute("/hvs/report")({
  component: ReportPage,
});

const sections = [
  { id: "value", label: "Value" },
  { id: "equity", label: "Equity" },
  { id: "buyers", label: "Buyers" },
  { id: "market", label: "Market" },
  { id: "comps", label: "Nearby sales" },
  { id: "facts", label: "Home facts" },
  { id: "updates", label: "Updates" },
  { id: "agent", label: "Talk to an agent" },
] as const;

const timelines = [
  "Within 3 months",
  "3 to 6 months",
  "6 to 12 months",
  "Just curious",
] as const;

const yearFor = (i: number): string => {
  if (i < 3) {
    return "'24";
  }
  return i < 15 ? "'25" : "'26";
};

const labels24 = Array.from({ length: 24 }, (_, i) => {
  const m = months12[i % 12] ?? "";
  const year = yearFor(i);
  return `${m} ${year}`;
});

const money = (n: number) => fmtMoney(n, true);

const VISIBLE_ROWS = 6;

const factRows: [string, string][] = [
  ["Type", property.facts.type],
  ["Bedrooms", String(property.facts.beds)],
  ["Bathrooms", String(property.facts.baths)],
  ["Living area", `${fmtNum(property.facts.sqft)} sq ft`],
  ["Lot", `${fmtNum(property.facts.lotSqft)} sq ft`],
  ["Year built", String(property.facts.yearBuilt)],
  ["Stories", String(property.facts.stories)],
  ["Garage", property.facts.garage],
  ["Pool", property.facts.pool],
  ["Roof", property.facts.roof],
  ["Cooling", property.facts.cooling],
  ["Annual taxes", fmtMoney(property.facts.taxes)],
  ["Parcel", property.facts.parcel],
];

function ReportPage() {
  const { tenant } = useTenant();
  const { estimate, facts, sources, equity, buyers, market, comps } = property;
  const [salePrice, setSalePrice] = useState<number>(estimate.value);
  const [activeComp, setActiveComp] = useState<number | null>(null);
  const lastComp = useRef<number | null>(null);

  useEffect(() => {
    track("report_viewed", property.line1);
  }, []);
  const selectComp = (index: number | null) => {
    setActiveComp(index);
    if (index !== null && index !== lastComp.current) {
      lastComp.current = index;
      track("comp_viewed", comps[index]?.address);
    }
  };
  const [allFacts, setAllFacts] = useState(false);
  const [allHistory, setAllHistory] = useState(false);
  const [consultSent, setConsultSent] = useState(false);
  const [timeline, setTimeline] =
    useState<(typeof timelines)[number]>("3 to 6 months");

  const equityValue = estimate.value - equity.mortgageBalance;
  const fees = Math.round(salePrice * (equity.commissionPct / 100));
  const proceeds = salePrice - fees - equity.mortgageBalance;
  const firstValue = property.valueHistory[0] ?? estimate.value;
  const yearAgoValue = property.valueHistory[12] ?? estimate.value;
  const gainTwoYears = estimate.value - firstValue;
  const gainOneYear = estimate.value - yearAgoValue;

  return (
    <ClaimProvider
      addressLine1={property.line1}
      addressLine2={property.line2}
      purchaseYear={facts.lastSale.date.slice(-4)}
    >
      <SiteHeader compact />
      <main id="top">
        <section className="wrap grid items-center gap-10 pt-6 pb-14 md:grid-cols-[1.05fr_1fr] md:pt-10 md:pb-20">
          <div>
            <Link
              className="inline-flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink md:hidden"
              to="/hvs"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Search another address
            </Link>
            <h1 className="t-h2 rise mt-3 md:mt-0">{property.line1}</h1>
            <p className="t-lead rise rise-2 mt-1 text-ink-muted">
              {property.line2}
            </p>
            <ul className="rise rise-2 mt-5 flex flex-wrap gap-2">
              <li className="chip">
                <BedDouble
                  aria-hidden="true"
                  className="size-4 text-ink-muted"
                />{" "}
                {facts.beds} bd
              </li>
              <li className="chip">
                <Bath aria-hidden="true" className="size-4 text-ink-muted" />{" "}
                {facts.baths} ba
              </li>
              <li className="chip">
                <Ruler aria-hidden="true" className="size-4 text-ink-muted" />{" "}
                {fmtNum(facts.sqft)} sq ft
              </li>
              <li className="chip">
                <Calendar
                  aria-hidden="true"
                  className="size-4 text-ink-muted"
                />{" "}
                Built {facts.yearBuilt}
              </li>
            </ul>

            <div className="rise rise-3 mt-10">
              <div className="text-ink-muted">Estimated value</div>
              <div className="t-figure mt-1 text-ink">
                <CountUp format={(n) => fmtMoney(n)} value={estimate.value} />
              </div>
              <p className="mt-3 text-ink-muted">
                Likely between{" "}
                <span className="tabular font-medium text-ink">
                  {money(estimate.low)}
                </span>{" "}
                and{" "}
                <span className="tabular font-medium text-ink">
                  {money(estimate.high)}
                </span>{" "}
                · {estimate.confidence} confidence · 3 sources
              </p>
              <div className="mt-5 max-w-md">
                <ValueGauge
                  high={estimate.high}
                  low={estimate.low}
                  value={estimate.value}
                />
              </div>
            </div>

            <div className="rise rise-4 mt-8 flex flex-wrap gap-3">
              {/* biome-ignore lint/a11y/useValidAnchor: the click handler only records analytics; the href still navigates */}
              <a
                className="btn btn-brand btn-pill"
                href="#agent"
                onClick={() => track("cta_clicked", "Talk to agent (hero)")}
              >
                Talk to {tenant.agent.name.split(" ")[0]}
              </a>
              <ClaimButton reason="your home's details" />
            </div>
          </div>
          <figure className="rise rise-2 relative">
            <img
              alt="2148 Bayshore Lane: a white two-story home with a pool and palm trees"
              className="aspect-[4/3] w-full rounded-3xl object-cover"
              height={1200}
              src={property.photo}
              width={1600}
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-canvas/90 px-3 py-1.5 text-ink text-sm backdrop-blur">
              Street view · Updated Sep 2026
            </figcaption>
          </figure>
        </section>

        <SectionNav items={sections} />

        <section className="wrap sec-tight scroll-mt-16" id="value">
          <Reveal>
            <h2 className="t-h2 max-w-[20ch]">
              How we got to {fmtMoney(estimate.value)}.
            </h2>
            <p className="t-lead measure mt-4 text-ink-muted">
              Three independent estimates, shown side by side. The headline is
              the highest of the three.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {sources.map((s, i) => (
              <Reveal
                as="li"
                className="border-line border-t pt-6"
                delay={i * 90}
                key={s.id}
              >
                <div className="flex items-center gap-1.5 text-ink-muted text-sm">
                  {s.kicker}
                  <span className="group relative inline-flex">
                    <button
                      aria-describedby={`source-note-${s.id}`}
                      aria-label={`About the ${s.name} estimate`}
                      className="rounded-full text-ink-muted hover:text-ink focus-visible:text-ink"
                      type="button"
                    >
                      <Info aria-hidden="true" className="size-4" />
                    </button>
                    <span
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-canvas text-xs leading-relaxed opacity-0 shadow-float transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
                      id={`source-note-${s.id}`}
                      role="tooltip"
                    >
                      {s.note}
                    </span>
                  </span>
                </div>
                <img
                  alt={`${s.name} logo`}
                  className="mt-2 h-10 w-auto mix-blend-multiply"
                  height={40}
                  src={s.logo}
                  width={125}
                />
                <div className="t-figure-sm tabular mt-6 text-ink">
                  {fmtMoney(s.value)}
                </div>
                <div className="tabular mt-2 text-ink-muted">
                  {fmtMoney(s.low)} to {fmtMoney(s.high)}
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-14 rounded-3xl bg-surface p-7 md:p-9">
            <SellForPanel sources={sources} />
          </Reveal>

          <div className="mt-20 grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <Reveal>
              <h3 className="t-h2">What you've gained.</h3>
              <div className="t-figure-sm tabular mt-6 text-brand">
                +{money(gainTwoYears)}
              </div>
              <p className="mt-2 text-ink-muted">
                In the last two years, about{" "}
                {money(Math.round(gainTwoYears / 23))} a month.
              </p>
              <dl className="mt-8 divide-y divide-line border-line border-y">
                <div className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-ink-muted">
                    Since you bought, {facts.lastSale.date}
                  </dt>
                  <dd className="tabular text-right">
                    <span className="font-semibold text-ink">
                      +{money(estimate.value - facts.lastSale.price)}
                    </span>
                    <span className="ml-2 text-ink-muted">
                      +
                      {Math.round(
                        ((estimate.value - facts.lastSale.price) /
                          facts.lastSale.price) *
                          100
                      )}
                      %
                    </span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-ink-muted">Last 12 months</dt>
                  <dd className="tabular text-right">
                    <span className="font-semibold text-ink">
                      +{money(gainOneYear)}
                    </span>
                    <span className="ml-2 text-ink-muted">
                      +{Math.round((gainOneYear / yearAgoValue) * 100)}%
                    </span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-ink-muted">Purchase price</dt>
                  <dd className="tabular font-semibold text-ink">
                    {fmtMoney(facts.lastSale.price)}
                  </dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={90}>
              <div className="flex items-baseline justify-between gap-4">
                <h4 className="font-semibold text-ink">
                  Estimated value, monthly
                </h4>
                <span className="text-ink-muted text-sm">
                  Oct 2024 to Sep 2026
                </span>
              </div>
              <div className="mt-4">
                <LineChart
                  area
                  formatTooltip={(n) => fmtMoney(n)}
                  formatY={money}
                  height={280}
                  labelEvery={6}
                  labels={labels24}
                  series={[
                    {
                      name: "Estimated value",
                      data: property.valueHistory,
                      color: "var(--c-brand)",
                    },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="scroll-mt-16 bg-dark text-canvas" id="equity">
          <div className="wrap sec grid gap-14 md:grid-cols-2">
            <Reveal>
              <h2 className="t-h2">Your equity, estimated.</h2>
              <div className="t-figure mt-8">{fmtMoney(equityValue)}</div>
              <dl className="mt-8 max-w-sm divide-y divide-canvas/15 border-canvas/15 border-y">
                <div className="flex justify-between py-3">
                  <dt className="text-canvas/70">Estimated value</dt>
                  <dd className="tabular font-medium">
                    {fmtMoney(estimate.value)}
                  </dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-canvas/70">Estimated loan balance</dt>
                  <dd className="tabular font-medium">
                    − {fmtMoney(equity.mortgageBalance)}
                  </dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-medium">Equity</dt>
                  <dd className="tabular font-semibold">
                    {fmtMoney(equityValue)}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 max-w-sm text-canvas/60 text-sm">
                Loan balance is estimated from the{" "}
                {fmtMoney(equity.originalLoan)} mortgage recorded in{" "}
                {equity.loanDate} at {equity.rate}%. Claim your home to correct
                it.
              </p>
            </Reveal>
            <Reveal className="rounded-3xl bg-canvas/8 p-7 md:p-9" delay={90}>
              <h3 className="t-h3">If you sold today</h3>
              <p className="mt-1 text-canvas/70">
                Drag to see what you'd likely walk away with.
              </p>
              <label className="mt-8 block">
                <span className="flex items-baseline justify-between">
                  <span className="text-canvas/70">Sale price</span>
                  <span className="tabular font-semibold text-2xl">
                    {fmtMoney(salePrice)}
                  </span>
                </span>
                <input
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-canvas/25 accent-[var(--c-brand-ink)]"
                  max={estimate.high}
                  min={estimate.low}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  onKeyUp={() =>
                    track("sale_price_adjusted", fmtMoney(salePrice))
                  }
                  onPointerUp={() =>
                    track("sale_price_adjusted", fmtMoney(salePrice))
                  }
                  step={1000}
                  type="range"
                  value={salePrice}
                />
                <span className="tabular mt-2 flex justify-between text-canvas/60 text-sm">
                  <span>{money(estimate.low)}</span>
                  <span>{money(estimate.high)}</span>
                </span>
              </label>
              <dl className="mt-8 divide-y divide-canvas/15 border-canvas/15 border-t">
                <div className="flex justify-between py-3">
                  <dt className="text-canvas/70">
                    Selling costs ({equity.commissionPct}%)
                  </dt>
                  <dd className="tabular">− {fmtMoney(fees)}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-canvas/70">Loan payoff</dt>
                  <dd className="tabular">
                    − {fmtMoney(equity.mortgageBalance)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between py-4">
                  <dt className="font-medium">Estimated proceeds</dt>
                  <dd className="tabular font-semibold text-3xl">
                    {fmtMoney(proceeds)}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        <section className="wrap sec-tight scroll-mt-16" id="buyers">
          <Reveal>
            <h2 className="t-h2 max-w-[20ch]">
              {buyers.matched} buyers are looking for a home like yours.
            </h2>
            <p className="t-lead measure mt-4 text-ink-muted">
              Active buyers registered with {tenant.name} and partner brokerages
              in the last 30 days, narrowed to the ones this home fits.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <HBars emphasizeLast rows={buyers.funnel} share />
            </Reveal>
            <Reveal delay={90}>
              <ul className="divide-y divide-line border-line border-y">
                {buyers.featured.map((b) => (
                  <li className="flex items-start gap-4 py-4" key={b.initials}>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand text-sm">
                      {b.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink">{b.from}</div>
                      <div className="text-ink-muted">
                        {b.budget} · {b.beds}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {b.preapproved ? (
                          <span className="chip chip-brand h-7">
                            <Check aria-hidden="true" className="size-3.5" />{" "}
                            Pre-approved
                          </span>
                        ) : null}
                        <span className="chip h-7">{b.timeline}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* biome-ignore lint/a11y/useValidAnchor: the click handler only records analytics; the href still navigates */}
              <a
                className="btn btn-brand btn-pill mt-6"
                href="#updates"
                onClick={() =>
                  track("buyers_cta_clicked", `${buyers.matched} matches`)
                }
              >
                See all {buyers.matched} matches
                <ArrowDown aria-hidden="true" className="size-4" />
              </a>
              <p className="mt-3 text-ink-muted text-sm">
                The full list arrives with your monthly update, along with new
                buyers as they match.
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-20">
            <h3 className="t-h2 max-w-[22ch]">
              Your home is what they're shopping for.
            </h3>
            <p className="t-lead measure mt-4 text-ink-muted">
              Of the {fmtNum(buyers.funnel[0].value)} active buyers within five
              miles, the largest groups want a {facts.beds}-bedroom in{" "}
              {property.neighborhood} between $1M and $1.5M.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              { rows: buyers.demand.price, title: "By budget" },
              { rows: buyers.demand.beds, title: "By bedrooms" },
              { rows: buyers.demand.area, title: "By neighborhood" },
            ].map((group, i) => (
              <Reveal
                className="border-line border-t pt-5"
                delay={i * 90}
                key={group.title}
              >
                <h4 className="mb-5 font-semibold text-ink">{group.title}</h4>
                <HBars dense emphasizeMatch rows={group.rows} />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-ink-muted text-sm">
            Buyers registered with {tenant.name} and partner brokerages,
            searching within five miles in the last 90 days.
          </p>
        </section>

        <section className="scroll-mt-16 bg-surface" id="market">
          <div className="wrap sec-tight">
            <Reveal>
              <h2 className="t-h2">
                {property.neighborhood}, the last 12 months.
              </h2>
            </Reveal>
            <Reveal
              className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-line border-t pt-8 md:grid-cols-6"
              delay={60}
            >
              {[
                ["Median sale price", money(market.medianSale)],
                ["Homes sold", fmtNum(market.sold12mo)],
                ["For sale now", fmtNum(market.active)],
                ["Months of supply", market.monthsSupply.toFixed(1)],
                ["Days on market", fmtNum(market.daysOnMarket)],
                ["Sale to list", `${market.saleToList}%`],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-ink-muted text-sm">{label}</div>
                  <div className="tabular mt-1 font-semibold text-2xl text-ink tracking-[-0.01em]">
                    {value}
                  </div>
                </div>
              ))}
            </Reveal>
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <Reveal className="rounded-2xl bg-canvas p-6">
                <h3 className="font-semibold text-ink">Homes sold per month</h3>
                <div className="mt-4">
                  <ColumnChart
                    data={market.monthlySales}
                    labels={months12}
                    title="Homes sold per month"
                  />
                </div>
              </Reveal>
              <Reveal className="rounded-2xl bg-canvas p-6" delay={90}>
                <h3 className="font-semibold text-ink">Median sale price</h3>
                <div className="mt-4">
                  <LineChart
                    formatTooltip={(n) => fmtMoney(n)}
                    formatY={money}
                    height={200}
                    labelEvery={3}
                    labels={months12}
                    series={[
                      {
                        name: "Median sale price",
                        data: market.monthlyMedian,
                        color: "var(--c-brand)",
                      },
                    ]}
                    yTicks={3}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="wrap sec-tight scroll-mt-16" id="comps">
          <Reveal>
            <h2 className="t-h2">Sold nearby.</h2>
            <p className="t-lead measure mt-4 text-ink-muted">
              The recent sales that most resemble your home, within half a mile.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_1fr]">
            <Reveal>
              <CompsMap
                active={activeComp}
                comps={comps}
                onSelect={selectComp}
                subjectLabel={property.line1}
              />
            </Reveal>
            <Reveal delay={90}>
              <ol className="divide-y divide-line border-line border-y">
                {comps.map((c, i) => (
                  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover only mirrors the map highlight; the map markers are keyboard focusable
                  <li
                    className={`flex items-center gap-4 py-3.5 transition-colors ${activeComp === i ? "bg-surface" : ""}`}
                    key={c.address}
                    onMouseEnter={() => selectComp(i)}
                    onMouseLeave={() => selectComp(null)}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-canvas text-xs">
                      {i + 1}
                    </span>
                    <img
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                      height={64}
                      loading="lazy"
                      src={c.photo}
                      width={64}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">
                        {c.address}
                      </div>
                      <div className="text-ink-muted text-sm">
                        {c.beds} bd · {c.baths} ba · {fmtNum(c.sqft)} sq ft ·{" "}
                        {c.distance} mi
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="tabular font-semibold text-ink">
                        {fmtMoney(c.price)}
                      </div>
                      <div className="tabular text-ink-muted text-sm">
                        {c.date} · ${Math.round(c.price / c.sqft)}/sq ft
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="wrap sec-tight scroll-mt-16" id="facts">
          <div className="grid gap-12 md:grid-cols-2">
            <Reveal>
              <h2 className="t-h2">Home facts.</h2>
              <p className="t-body mt-3 text-ink-muted">
                From public records. If something's wrong,{" "}
                <ClaimLink reason="corrections to these facts" /> to fix it and
                sharpen your estimate.
              </p>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-0 divide-y divide-line border-line border-y">
                {(allFacts ? factRows : factRows.slice(0, VISIBLE_ROWS)).map(
                  ([k, v]) => (
                    <div
                      className="col-span-2 grid grid-cols-subgrid py-2.5"
                      key={k}
                    >
                      <dt className="text-ink-muted">{k}</dt>
                      <dd className="text-ink">{v}</dd>
                    </div>
                  )
                )}
              </dl>
              <button
                aria-expanded={allFacts}
                className="btn btn-ghost btn-md mt-5 rounded-full"
                onClick={() => {
                  setAllFacts((v) => !v);
                  track("facts_expanded", allFacts ? "collapse" : "expand");
                }}
                type="button"
              >
                {allFacts
                  ? "Show fewer facts"
                  : `Show all ${factRows.length} facts`}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${allFacts ? "rotate-180" : ""}`}
                />
              </button>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="t-h2">History.</h2>
              <ol className="mt-8 border-line border-l">
                {(allHistory
                  ? property.history
                  : property.history.slice(0, VISIBLE_ROWS)
                ).map((h) => (
                  <li
                    className="relative pb-6 pl-6 last:pb-0"
                    key={`${h.date}-${h.label}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-canvas ring-2 ring-ink"
                    />
                    <div className="text-ink-muted text-sm">{h.date}</div>
                    <div className="flex flex-wrap justify-between gap-x-6">
                      <span className="text-ink">{h.label}</span>
                      <span className="tabular font-medium text-ink">
                        {h.value}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
              {property.history.length > VISIBLE_ROWS ? (
                <button
                  aria-expanded={allHistory}
                  className="btn btn-ghost btn-md mt-5 rounded-full"
                  onClick={() => {
                    setAllHistory((v) => !v);
                    track(
                      "history_expanded",
                      allHistory ? "collapse" : "expand"
                    );
                  }}
                  type="button"
                >
                  {allHistory
                    ? "Show recent only"
                    : `Show all ${property.history.length} events`}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 transition-transform ${allHistory ? "rotate-180" : ""}`}
                  />
                </button>
              ) : null}
            </Reveal>
          </div>
        </section>

        <section className="scroll-mt-16 bg-brand" id="updates">
          <WatchHome
            addressLine1={property.line1}
            addressLine2={property.line2}
            daysOnMarket={market.daysOnMarket}
            monthDelta={6000}
            newBuyers={3}
            newSales={2}
            value={estimate.value}
          />
        </section>

        <section className="wrap sec scroll-mt-16" id="agent">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <img
                alt={tenant.agent.name}
                className="size-20 rounded-full object-cover"
                height={80}
                src={tenant.agent.photo}
                width={80}
              />
              <h2 className="t-h2 mt-6">
                Want a precise number? Talk to {tenant.agent.name.split(" ")[0]}
                .
              </h2>
              <p className="t-body mt-4 text-ink-muted">
                {tenant.agent.name} is a {tenant.agent.title.toLowerCase()} with{" "}
                {tenant.name}, and has sold 14 homes in {property.neighborhood}{" "}
                in the last two years. A visit takes 30 minutes and comes with
                no obligation.
              </p>
              <p className="mt-4 text-ink-muted text-sm">
                Lic. {tenant.agent.license} · {tenant.phone} ·{" "}
                {tenant.agent.email}
              </p>
            </Reveal>
            <Reveal
              className="rounded-3xl border border-line p-7 md:p-9"
              delay={90}
            >
              {consultSent ? (
                <div>
                  <h3 className="t-h3">Thanks, we'll be in touch.</h3>
                  <p className="t-body mt-3 text-ink-muted">
                    {tenant.agent.name.split(" ")[0]} will reach out within one
                    business day about {property.line1}.
                  </p>
                </div>
              ) : (
                <form
                  className="grid gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setConsultSent(true);
                    track("consult_requested", timeline);
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block font-medium text-sm">
                        Name
                      </span>
                      <input className="field" required type="text" />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block font-medium text-sm">
                        Phone
                      </span>
                      <input className="field" type="tel" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block font-medium text-sm">
                      Email
                    </span>
                    <input className="field" required type="email" />
                  </label>
                  <fieldset>
                    <legend className="mb-2 font-medium text-sm">
                      When are you thinking of selling?
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {timelines.map((t) => (
                        <label
                          className={`cursor-pointer rounded-full px-3.5 py-2 text-[0.9375rem] ring-1 transition-colors ${
                            timeline === t
                              ? "bg-ink text-canvas ring-ink"
                              : "text-ink ring-line hover:bg-surface"
                          }`}
                          key={t}
                        >
                          <input
                            checked={timeline === t}
                            className="sr-only"
                            name="timeline"
                            onChange={() => {
                              setTimeline(t);
                              track("selling_timeline_selected", t);
                            }}
                            type="radio"
                            value={t}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="block">
                    <span className="mb-1.5 block font-medium text-sm">
                      Anything we should know? (optional)
                    </span>
                    <textarea
                      className="field h-24 resize-none py-2.5"
                      rows={3}
                    />
                  </label>
                  <button
                    className="btn btn-brand btn-pill justify-self-start"
                    type="submit"
                  >
                    Talk to {tenant.agent.name.split(" ")[0]}
                  </button>
                  <p className="text-ink-muted text-xs leading-relaxed">
                    By sending this you agree to be contacted by{" "}
                    {tenant.legalName} about this property. We never sell your
                    information.
                  </p>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </ClaimProvider>
  );
}
