import { createFileRoute } from "@tanstack/react-router";
import { SpellCheck } from "lucide-react";

import { AddressSearch } from "@/components/home-report/address-search";
import { NetworkDebugger } from "@/components/home-report/network-debugger";
import { SiteHeader } from "@/components/home-report/site-chrome";

export const Route = createFileRoute("/home-report/")({
  component: SearchPage,
});

/** Percy demo: the autocomplete on the left, every request it sends on the right. */
function SearchPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex min-w-0 flex-col lg:px-8">
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          {/* On desktop the block is centered above a tall bottom pad, so the input sits near 40% of the screen and the list has room below. */}
          <section className="wrap flex flex-1 flex-col pt-12 pb-12 lg:justify-center lg:pt-6 lg:pb-[46svh]">
            <h1 className="rise max-w-[14ch] font-semibold text-[clamp(2.5rem,1.25rem+2.75vw,4.25rem)] leading-[1.02] tracking-[-0.03em]">
              Every US address, as you type.
            </h1>
            <p className="t-lead rise rise-2 mt-5 max-w-[46ch] text-ink-muted">
              Address search by Fieldgeist. Start typing and pick from more than
              130&nbsp;million US addresses. Every suggestion is a parcel, with
              its APN and county.
            </p>
            <div className="rise rise-3 relative z-20 mt-9 w-full max-w-2xl">
              <AddressSearch autoFocus variant="hero" />
            </div>
            <p className="rise rise-4 mt-4 inline-flex max-w-[44ch] items-start gap-2 text-ink-muted text-sm">
              <SpellCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              Typos are forgiven: swapped, missing or extra letters still find
              the home.
            </p>
          </section>
        </main>
      </div>
      <div className="p-3 lg:sticky lg:top-0 lg:h-svh lg:p-4 lg:pl-0">
        <NetworkDebugger className="h-[80svh] rounded-3xl lg:h-full" />
      </div>
    </div>
  );
}
