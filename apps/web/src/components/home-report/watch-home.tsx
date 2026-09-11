import { ArrowUpRight, Check, Eye } from "lucide-react";
import { useState } from "react";

import { TenantLogo } from "@/components/home-report/tenant-logo";
import { fmtMoney } from "@/lib/mock-data";
import { useTenant } from "@/lib/tenant";
import { track } from "@/lib/track";

interface WatchHomeProps {
  addressLine1: string;
  addressLine2: string;
  daysOnMarket: number;
  monthDelta: number;
  newBuyers: number;
  newSales: number;
  value: number;
}

/** Monthly update (EPW) signup: a brand-drenched section with the form beside a preview of the email. */
export function WatchHome({
  addressLine1,
  addressLine2,
  value,
  monthDelta,
  newSales,
  newBuyers,
  daysOnMarket,
}: WatchHomeProps) {
  const { tenant } = useTenant();
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="wrap sec grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
      <div>
        <h2 className="t-h2 max-w-[16ch] text-brand-ink">Watch this home.</h2>
        <p className="t-lead mt-4 max-w-[40ch] text-brand-ink/80">
          On the first of every month: your updated value, what sold nearby, and
          buyers who match. One short email, nothing else.
        </p>

        {subscribed ? (
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-canvas px-5 py-4 text-ink">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-ink">
              <Check aria-hidden="true" className="size-4" />
            </span>
            <span>
              You're watching {addressLine1}. Your first update arrives{" "}
              <span className="font-medium">Oct 1</span>.
            </span>
          </div>
        ) : (
          <form
            className="mt-8 grid max-w-lg gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
              track("updates_subscribed", addressLine1);
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">First name</span>
                <input
                  autoComplete="given-name"
                  className="field h-13 rounded-full border-0 bg-canvas px-5 text-base shadow-none ring-0"
                  placeholder="First name"
                  required
                  type="text"
                />
              </label>
              <label className="block">
                <span className="sr-only">Last name</span>
                <input
                  autoComplete="family-name"
                  className="field h-13 rounded-full border-0 bg-canvas px-5 text-base"
                  placeholder="Last name"
                  required
                  type="text"
                />
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="block flex-1">
                <span className="sr-only">Email address</span>
                <input
                  autoComplete="email"
                  className="field h-13 rounded-full bg-canvas px-5 text-base"
                  placeholder="Email address"
                  required
                  type="email"
                />
              </label>
              <button
                className="btn btn-pill bg-canvas text-brand hover:bg-canvas/90"
                type="submit"
              >
                <Eye aria-hidden="true" className="size-4" />
                Watch this home
              </button>
            </div>
            <p className="mt-1 text-brand-ink/70 text-sm">
              Free, private, and one click to unsubscribe. Sent by{" "}
              {tenant.legalName}.
            </p>
          </form>
        )}
      </div>

      <figure
        aria-label="Preview of the monthly update email"
        className="md:justify-self-end"
      >
        <div className="w-full max-w-md rounded-3xl bg-canvas p-6 text-ink shadow-frame md:p-7">
          <div className="flex items-center justify-between gap-4">
            <TenantLogo size="sm" />
            <span className="text-ink-muted text-sm">
              Monthly update · Oct 1
            </span>
          </div>
          <div className="mt-6">
            <div className="text-ink-muted text-sm">{addressLine2}</div>
            <div className="font-semibold text-ink text-lg">{addressLine1}</div>
          </div>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tabular font-light text-[2.5rem] text-ink leading-none tracking-[-0.02em]">
              {fmtMoney(value)}
            </span>
            <span className="chip chip-brand h-7">
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
              {fmtMoney(monthDelta, true)} since September
            </span>
          </div>
          <ul className="mt-6 divide-y divide-line border-line border-y text-[0.9375rem]">
            <li className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-ink">Sold nearby this month</span>
              <span className="tabular font-medium text-ink">
                {newSales} homes
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-ink">New buyers who match</span>
              <span className="tabular font-medium text-ink">{newBuyers}</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-ink">
                Days on market in {addressLine2.split(",")[0]}
              </span>
              <span className="tabular font-medium text-ink">
                {daysOnMarket}, down 4
              </span>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <img
              alt=""
              className="size-9 rounded-full object-cover"
              height={36}
              src={tenant.agent.photo}
              width={36}
            />
            <div className="text-sm">
              <div className="font-medium text-ink">{tenant.agent.name}</div>
              <div className="text-ink-muted">
                Reply any time with questions.
              </div>
            </div>
          </div>
        </div>
        <figcaption className="mt-3 text-center text-brand-ink/70 text-sm md:text-right">
          What your first update will look like.
        </figcaption>
      </figure>
    </div>
  );
}
