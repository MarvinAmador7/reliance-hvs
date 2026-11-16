import { Link } from "@tanstack/react-router";

import { AddressSearch } from "@/components/home-report/address-search";
import { Logo } from "@/components/home-report/fieldgeist-logo";
import { RelianceMark, TenantLogo } from "@/components/home-report/tenant-logo";
import { useTenant } from "@/lib/tenant";

/** Percy demo header: the Fieldgeist logo and, on inner pages, the address search. No phone or agent CTA. */
export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="wrap grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-6">
      <Link
        aria-label="Fieldgeist address search"
        className="shrink-0 justify-self-start"
        to="/home-report"
      >
        <Logo size="sm" />
      </Link>
      {compact ? (
        <div className="hidden w-[28rem] max-w-full md:block">
          <AddressSearch variant="compact" />
        </div>
      ) : (
        <span />
      )}
      <span />
    </header>
  );
}

const exploreLinks = [
  "Home value",
  "Sell with us",
  "Find a home",
  "Our agents",
  "Neighborhood guides",
];

export function SiteFooter() {
  const { tenant } = useTenant();
  return (
    <footer className="hairline">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div className="space-y-4">
          <TenantLogo />
          <p className="measure text-ink-muted">{tenant.tagline}</p>
          <p className="text-[0.9375rem] text-ink">
            {tenant.legalName}
            <br />
            {tenant.city}, {tenant.state} · {tenant.phone}
          </p>
        </div>
        <nav aria-label="Explore">
          <h2 className="mb-3 font-semibold text-sm">Explore</h2>
          <ul className="space-y-2 text-[0.9375rem] text-ink-muted">
            {exploreLinks.map((l) => (
              <li key={l}>
                <a
                  className="hover:text-ink"
                  href={`https://${tenant.website}`}
                  rel="noopener"
                  target="_blank"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="mb-3 font-semibold text-sm">Your local expert</h2>
          <div className="flex items-start gap-3">
            <img
              alt={tenant.agent.name}
              className="size-10 shrink-0 rounded-full object-cover"
              height={40}
              src={tenant.agent.photo}
              width={40}
            />
            <div className="text-[0.9375rem]">
              <div className="font-medium text-ink">{tenant.agent.name}</div>
              <div className="text-ink-muted">{tenant.agent.title}</div>
              <div className="text-ink-muted text-sm">
                Lic. {tenant.agent.license}
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-sm">Legal</h2>
          <p className="text-ink-muted text-sm leading-relaxed">
            {tenant.mlsDisclaimer}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-ink-muted text-sm">
            <li>
              <a className="hover:text-ink" href="#privacy">
                Privacy
              </a>
            </li>
            <li>
              <a className="hover:text-ink" href="#terms">
                Terms
              </a>
            </li>
            <li>
              <a className="hover:text-ink" href="#fair-housing">
                Equal Housing Opportunity
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="hairline">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-5 text-ink-muted text-sm">
          <span>© 2026 {tenant.legalName}. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            Powered by <RelianceMark className="size-4" />{" "}
            <span className="font-medium text-ink">Reliance</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
