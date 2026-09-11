import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { AddressSearch } from "@/components/hvs/address-search";
import { RelianceMark, TenantLogo } from "@/components/hvs/tenant-logo";
import { useTenant } from "@/lib/tenant";
import { track } from "@/lib/track";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const { tenant } = useTenant();
  return (
    <header className="wrap flex h-[4.5rem] items-center justify-between gap-6">
      <Link
        aria-label={`${tenant.name} home value`}
        className="shrink-0"
        to="/hvs"
      >
        <TenantLogo />
      </Link>
      {compact ? (
        <div className="hidden flex-1 justify-center md:flex">
          <AddressSearch variant="compact" />
        </div>
      ) : null}
      <div className="flex shrink-0 items-center gap-2">
        <a
          className="hidden items-center gap-2 px-3 text-[0.9375rem] text-ink hover:text-brand sm:inline-flex"
          href={`tel:${tenant.phone.replace(/\D/g, "")}`}
          onClick={() => track("agent_call_clicked", tenant.agent.name)}
        >
          <Phone aria-hidden="true" className="size-4" />
          {tenant.phone}
        </a>
        {/* biome-ignore lint/a11y/useValidAnchor: the click handler only records analytics; the href still navigates */}
        <a
          className="btn btn-ghost btn-md rounded-full"
          href="#agent"
          onClick={() => track("cta_clicked", "Talk to an agent")}
        >
          Talk to an agent
        </a>
      </div>
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
