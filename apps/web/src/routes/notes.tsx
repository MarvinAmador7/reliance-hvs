import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Td, Th } from "@/components/console/ui";
import { RelianceMark } from "@/components/home-report/tenant-logo";
import { eventCatalog } from "@/lib/mock-data";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

const lobMetrics = [
  [
    "Valuation attempts",
    "address_selected",
    "The number everyone already tracks. It stays the anchor.",
  ],
  [
    "Report to lead rate",
    "report_viewed, then any lead event",
    "The one figure a marketing director reports upward.",
  ],
  [
    "Seller intent score",
    "sale_price_adjusted, condition_adjusted, selling_timeline_selected",
    "Ranks leads for agents. A flat list makes them call the wrong person first.",
  ],
  [
    "Buyer-match interest",
    "buyers_cta_clicked",
    "Shows whether buyer demand is what makes people act.",
  ],
  [
    "Top areas and out-of-area",
    "report_viewed by ZIP",
    "Tells you where the next postcard campaign should go.",
  ],
  [
    "Channel and source mix",
    "page_view by site, embed, agent page, and UTM",
    "Proves which placement and which campaign pays.",
  ],
  [
    "Time to first contact",
    "consult_requested to lead_synced to agent action",
    "Catches the agent who sits on leads.",
  ],
  [
    "Return visits",
    "return_visit via the monthly email",
    "Tells you if the monthly report is worth sending.",
  ],
] as const;

const approaches = [
  {
    name: "Composable blocks",
    fit: "Every brokerage by default",
    pros: "Always responsive and on-brand. One change reaches the hosted site, every embed, and every agent page. Nothing for us to break.",
    cons: "A brokerage can't reproduce an arbitrary design pixel for pixel.",
  },
  {
    name: "Custom HTML blocks",
    fit: "A header or footer, when blocks won't do",
    pros: "Covers the brokerage that must have its exact footer. Sanitized and style-scoped so it can't damage the report.",
    cons: "The brokerage owns that block's responsiveness. Needs a validator and a preview.",
  },
  {
    name: "Mirror the brokerage site",
    fit: "Large brokerages with strict brand systems",
    pros: "Header and footer stay in sync with the main website without anyone touching the console.",
    cons: "Breaks when the source site changes structure. Needs monitoring and a fallback.",
  },
  {
    name: "Iframe the whole page",
    fit: "Not recommended",
    pros: "Isolates our code from the host page.",
    cons: "Double scrollbars, no deep links, weak SEO, awkward on phones. Attribution breaks at the frame boundary.",
  },
] as const;

function NotesPage() {
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
        <div className="max-w-[72ch] pt-10 pb-14">
          <h1 className="t-display">Design notes.</h1>
          <p className="t-lead mt-6 text-ink-muted">
            Why the preview looks the way it does, what the two pages can
            measure, and how one design serves hundreds of brokerages without
            custom work for each.
          </p>
        </div>

        <article className="space-y-16">
          <Section title="Design language">
            <p>
              Calm, precise, generous. The public pages take their pacing from
              an Apple product page. One idea per screen, large type, a real
              photograph, and numbers set with the care of a bank statement. One
              typeface, Hanken Grotesk, does all the work on both surfaces.
              Hierarchy comes from size and weight. There is no decoration to
              remove later.
            </p>
            <p>
              The platform itself stays neutral so the brokerage's brand can
              carry the page. A brokerage gives us a brand color, a corner
              radius, a logo, and optionally a typeface. Every component reads
              those four values. That is the whole reason the demo re-brands
              from a single switch, and it is the model we are proposing for
              production.
            </p>
            <p>
              The console is quieter. A sidebar, hairline panels, and charts
              that follow one rule set. One axis per chart, thin marks, direct
              labels, a legend once there are two series. Boring on purpose. An
              operator should never have to learn a chart.
            </p>
          </Section>

          <Section title="The homeowner pages">
            <p>
              The search page has one job, so the address field is the biggest
              thing on it. Suggestions open on focus, the keyboard works end to
              end, and nobody is asked for a name or a phone number before they
              get a value.
            </p>
            <p>
              The report gives the number first. Value, range, and the three
              sources sit above the fold. Every section after that answers a
              question a homeowner actually has. What could it sell for. What is
              my equity. Who is looking for a home like mine. What sold nearby.
              What does the public record say about my house.
            </p>
            <p>
              Lead capture is earned by depth. The monthly update, the claim,
              and the agent visit each appear at the moment the homeowner
              already wants more, and each asks only for what it needs. I would
              rather have fewer, better leads than a form at the top of the
              page.
            </p>
          </Section>

          <Section title="What we can measure">
            <p>
              Today the durable record is one valuation-attempt row per address
              plus whatever lands in a lead form. The rebuild treats every
              meaningful interaction as an event, and every event carries the
              same context. Visitor, site or embed, first-touch source, device,
              ZIP. That is what lets the console show the whole funnel instead
              of its two ends.
            </p>
            <p>
              You can watch this happen in the preview. Every tracked
              interaction on the report shows up as a small label above the
              Preview button as it fires. The list below is what fires today.
            </p>
            <div className="overflow-x-auto rounded-[12px] border border-line">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <Th>Event</Th>
                    <Th>Where</Th>
                    <Th>Carries</Th>
                    <Th>Feeds</Th>
                  </tr>
                </thead>
                <tbody>
                  {eventCatalog.map((e) => (
                    <tr className="last:[&>td]:border-b-0" key={e.event}>
                      <Td className="font-mono text-xs">{e.event}</Td>
                      <Td>{e.where}</Td>
                      <Td className="text-ink-muted">{e.props}</Td>
                      <Td>{e.feeds}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Those events roll up into the metrics the console leads with.</p>
            <div className="overflow-x-auto rounded-[12px] border border-line">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <Th>Metric</Th>
                    <Th>Built from</Th>
                    <Th>Why it matters</Th>
                  </tr>
                </thead>
                <tbody>
                  {lobMetrics.map(([m, from, why]) => (
                    <tr className="align-top last:[&>td]:border-b-0" key={m}>
                      <Td className="font-medium">{m}</Td>
                      <Td className="font-mono text-xs">{from}</Td>
                      <Td className="text-ink-muted">{why}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Events are first-party. A brokerage's Google Tag Manager
              container, Meta pixel, and CRM receive the same stream, so
              attribution keeps working when an ad blocker strips the
              third-party scripts.
            </p>
          </Section>

          <Section title="Customization that scales">
            <p>
              The current white-label layer has grown to about 250 flat
              configuration keys, including raw header and footer HTML,
              per-section visibility flags, and per-section copy overrides. It
              works. It also means every new brokerage is a support ticket and
              every new section is a new key that someone has to set 40 times.
            </p>
            <p>
              The rebuild replaces that with three layers, each small enough to
              explain in a sentence.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <strong>Theme tokens.</strong> Brand color, radius, logo,
                typeface. We check contrast when a color is saved, so a
                brokerage can't publish gray text on a gray button.
              </li>
              <li>
                <strong>A section registry.</strong> Every report section has an
                id, an order, a visibility flag, and its own copy fields. The
                estimate, the agent contact, and the MLS disclaimer can't be
                hidden. When we add a section to the product, it appears in
                every brokerage's registry on its own.
              </li>
              <li>
                <strong>Header and footer blocks.</strong> Brand, links, local
                expert, legal, social, powered-by. Turn them on, turn them off,
                reorder them. Most brokerages will never need anything else.
              </li>
            </ol>
            <p>
              For the brokerages that need more than blocks, here are the
              options and what each costs.
            </p>
            <div className="overflow-x-auto rounded-[12px] border border-line">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr>
                    <Th>Approach</Th>
                    <Th>Best for</Th>
                    <Th>What you get</Th>
                    <Th>What it costs</Th>
                  </tr>
                </thead>
                <tbody>
                  {approaches.map((a) => (
                    <tr
                      className="align-top last:[&>td]:border-b-0"
                      key={a.name}
                    >
                      <Td className="font-medium">{a.name}</Td>
                      <Td>{a.fit}</Td>
                      <Td className="text-ink-muted">{a.pros}</Td>
                      <Td className="text-ink-muted">{a.cons}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              My recommendation is blocks by default, custom HTML only for a
              header or footer, mirroring for the handful of large brokerages
              that ask, and no full-page iframes. The iframe is the one that
              looks easiest and costs the most later.
            </p>
          </Section>

          <Section title="Hosted pages and embeds share one configuration">
            <p>
              The embed is a script tag with a few attributes. Which site
              configuration to load, inline or modal, and optional overrides for
              sections, agent, and attribution label. Ordering, visibility,
              theme, and copy are deliberately not attributes. They live in the
              console, so a change reaches the hosted site, every embed, and
              every agent page at once. Nobody has to edit a website to turn off
              a section.
            </p>
            <p>
              The current embed exposes about fifty CSS custom properties for
              styling. The rebuild keeps CSS variables as the styling contract
              for the search box but derives them from the same theme tokens the
              hosted site uses. An embed can't drift from the brand because it
              has no settings of its own.
            </p>
          </Section>
        </article>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-[14rem_1fr] md:gap-16">
      <h2 className="t-h3 md:sticky md:top-8 md:self-start">{title}</h2>
      <div className="t-body max-w-[72ch] space-y-5 text-ink [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
