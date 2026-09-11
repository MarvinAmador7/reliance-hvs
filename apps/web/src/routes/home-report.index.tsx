import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { AddressSearch } from "@/components/home-report/address-search";
import { Reveal } from "@/components/home-report/motion";
import { SiteFooter, SiteHeader } from "@/components/home-report/site-chrome";
import { ValueGauge } from "@/components/home-report/value-gauge";
import { fmtMoney, photos, property } from "@/lib/mock-data";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/home-report/")({
  component: SearchPage,
});

const steps = [
  {
    n: 1,
    title: "Enter your address",
    body: "Start typing and pick your home from the list. No account, no phone number.",
  },
  {
    n: 2,
    title: "Read your report",
    body: "Your estimate with its range and sources, your likely equity, buyers looking, and the local market.",
  },
  {
    n: 3,
    title: "Talk to a local expert when you're ready",
    body: "A precise valuation takes a visit. Request one on your terms, whenever that is.",
  },
] as const;

function SearchPage() {
  const { tenant } = useTenant();
  const equity = property.estimate.value - property.equity.mortgageBalance;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="wrap flex flex-col items-center pt-16 pb-20 text-center md:pt-24 md:pb-28">
          <h1 className="t-display rise max-w-[16ch]">
            Know what your home is worth. Right now.
          </h1>
          <p className="t-lead rise rise-2 measure mt-6 text-ink-muted">
            An instant estimate with its range and sources, your likely equity,
            and how many buyers are looking for a home like yours. Free, and
            yours in seconds.
          </p>
          <div className="rise rise-3 mt-10 flex w-full justify-center">
            <AddressSearch autoFocus variant="hero" />
          </div>
          <p className="rise rise-4 mt-5 inline-flex items-center gap-2 text-ink-muted text-sm">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Private by default. We never show your report to anyone else.
          </p>
        </section>

        <section className="bg-dark text-canvas">
          <div className="wrap sec">
            <Reveal>
              <h2 className="t-h2 max-w-[18ch]">More than a number.</h2>
              <p className="t-lead measure mt-4 text-canvas/70">
                Every report answers the three questions homeowners actually
                ask, using a real example from {tenant.city}.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
              <Reveal className="border-canvas/15 border-t pt-6" delay={0}>
                <div className="text-canvas/60">Estimated value</div>
                <div className="t-figure-sm mt-3">
                  {fmtMoney(property.estimate.value, true)}
                </div>
                <div className="mt-6">
                  <ValueGauge
                    high={property.estimate.high}
                    inverted
                    low={property.estimate.low}
                    value={property.estimate.value}
                  />
                </div>
                <p className="mt-4 text-canvas/70">
                  Three independent sources, one range you can trust.
                </p>
              </Reveal>
              <Reveal className="border-canvas/15 border-t pt-6" delay={90}>
                <div className="text-canvas/60">Estimated equity</div>
                <div className="t-figure-sm mt-3">{fmtMoney(equity, true)}</div>
                <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-canvas/20">
                  <div
                    className="h-full bg-brand-ink"
                    style={{
                      width: `${(equity / property.estimate.value) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-canvas/70 text-sm">
                  <span>Equity</span>
                  <span>
                    Remaining loan{" "}
                    {fmtMoney(property.equity.mortgageBalance, true)}
                  </span>
                </div>
                <p className="mt-4 text-canvas/70">
                  What you'd likely walk away with, before you list.
                </p>
              </Reveal>
              <Reveal className="border-canvas/15 border-t pt-6" delay={180}>
                <div className="text-canvas/60">
                  Buyers looking for a home like this
                </div>
                <div className="t-figure-sm mt-3">
                  {property.buyers.matched}
                </div>
                <div className="mt-6 flex items-center">
                  {property.buyers.featured.map((b, i) => (
                    <span
                      className="-ml-2 flex size-9 items-center justify-center rounded-full bg-canvas font-semibold text-dark text-xs ring-2 ring-dark first:ml-0"
                      key={b.initials}
                      style={{ zIndex: 3 - i }}
                    >
                      {b.initials.replace(/\./g, "").slice(0, 2)}
                    </span>
                  ))}
                  <span className="ml-3 text-canvas/70 text-sm">
                    +{property.buyers.matched - 3} more, pre-approved
                  </span>
                </div>
                <p className="mt-4 text-canvas/70">
                  Real, active buyers within five miles. Anonymous until you say
                  so.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative isolate">
          <img
            alt="A two-story home at dusk with warm light in every window"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            height={1333}
            loading="lazy"
            src={photos.story}
            width={2000}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[oklch(0.15_0.01_250/0.85)] via-[oklch(0.15_0.01_250/0.35)] to-transparent" />
          <div className="wrap flex min-h-[70svh] flex-col justify-end pb-16 text-white">
            <Reveal>
              <h2 className="t-h2 max-w-[16ch]">
                Every home has a story. Yours is worth knowing.
              </h2>
              <p className="t-lead mt-4 max-w-[40ch] text-white/80">
                Three homes on Bayshore Lane sold this year. Your report shows
                what they went for, and what that means for you.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="wrap sec">
          <Reveal>
            <h2 className="t-h2 max-w-[18ch]">How it works.</h2>
          </Reveal>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal
                as="li"
                className="border-line border-t pt-6"
                delay={i * 90}
                key={s.n}
              >
                <div className="t-figure-sm text-brand">{s.n}</div>
                <h3 className="t-h3 mt-5">{s.title}</h3>
                <p className="t-body mt-2 text-ink-muted">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="bg-surface">
          <div className="wrap sec-tight grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <Reveal>
              <div className="flex items-center gap-4">
                <img
                  alt={tenant.agent.name}
                  className="size-14 shrink-0 rounded-full object-cover"
                  height={56}
                  src={tenant.agent.photo}
                  width={56}
                />
                <div>
                  <div className="text-ink-muted text-sm">Prepared by</div>
                  <div className="t-h3">{tenant.agent.name}</div>
                  <div className="text-ink-muted">
                    {tenant.agent.title}, {tenant.name} · Lic.{" "}
                    {tenant.agent.license}
                  </div>
                </div>
              </div>
            </Reveal>
            <a className="btn btn-brand btn-pill" href="#top">
              Find my home's value
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
