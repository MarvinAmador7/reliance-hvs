import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Monitor,
  Smartphone,
  Upload,
} from "lucide-react";
import { useState } from "react";

import { Field, Segmented, Switch } from "@/components/console/ui";
import { TenantLogo } from "@/components/hvs/tenant-logo";
import { ValueGauge } from "@/components/hvs/value-gauge";
import {
  defaultSections,
  fmtMoney,
  property,
  type SectionConfig,
} from "@/lib/mock-data";
import {
  type TenantId,
  tenantOrder,
  tenants,
  tenantVars,
  useTenant,
} from "@/lib/tenant";

export const Route = createFileRoute("/app/customize")({
  component: CustomizePage,
});

const tabs = [
  { value: "theme", label: "Theme" },
  { value: "sections", label: "Sections" },
  { value: "chrome", label: "Header & footer" },
  { value: "copy", label: "Copy" },
] as const;

type Tab = (typeof tabs)[number]["value"];

const devices = [
  { value: "desktop", label: "Desktop" },
  { value: "phone", label: "Phone" },
] as const;

type Device = (typeof devices)[number]["value"];

const chromeModes = [
  {
    value: "composable",
    title: "Composable blocks",
    body: "Turn blocks on or off and reorder them. Always on-brand, responsive, and accessible. Recommended.",
  },
  {
    value: "html",
    title: "Custom HTML",
    body: "Paste your own header and footer markup. Sanitized and sandboxed; styles are scoped so they can't break the report.",
  },
  {
    value: "mirror",
    title: "Mirror my website",
    body: "Reliance fetches the header and footer from a URL on your site and keeps them in sync. Best for large brokerages with strict brand systems.",
  },
] as const;

type ChromeMode = (typeof chromeModes)[number]["value"];

const footerBlocks = [
  { id: "brand", label: "Brand and tagline", on: true },
  { id: "links", label: "Explore links", on: true },
  { id: "agent", label: "Local expert card", on: true },
  { id: "legal", label: "Legal and MLS disclaimer", on: true, locked: true },
  { id: "social", label: "Social links", on: false },
  { id: "powered", label: "Powered by Reliance", on: true, locked: true },
] as const;

function CustomizePage() {
  const { tenant, setTenantId } = useTenant();
  const [tab, setTab] = useState<Tab>("theme");
  const [device, setDevice] = useState<Device>("desktop");
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [chrome, setChrome] = useState<ChromeMode>("composable");
  const [radius, setRadius] = useState<number>(
    Number.parseInt(tenant.theme.radius, 10)
  );
  const [headline, setHeadline] = useState(
    "Know what your home is worth. Right now."
  );
  const [cta, setCta] = useState("Get my estimate");

  const move = (index: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      const a = next[index];
      const b = next[target];
      if (!(a && b)) {
        return prev;
      }
      next[index] = b;
      next[target] = a;
      return next;
    });
  };

  const toggle = (id: string, visible: boolean) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible } : s))
    );

  const visibleIds = new Set(
    sections.filter((s) => s.visible).map((s) => s.id)
  );
  const previewVars = {
    ...tenantVars(tenant),
    "--c-radius": `${radius}px`,
  } as React.CSSProperties;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="c-title">Customize</h1>
          <p className="c-label mt-1">
            One configuration powers the hosted site, embeds, and agent pages.
            Changes preview instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" type="button">
            Discard
          </button>
          <button className="btn btn-brand btn-sm" type="button">
            Publish changes
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="panel self-start p-4">
          <Segmented
            label="Customize section"
            onChange={setTab}
            options={tabs}
            size="sm"
            value={tab}
          />

          {tab === "theme" && (
            <div className="mt-5 space-y-5">
              <div>
                <span className="mb-1.5 block font-medium text-sm">
                  Brand color
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {tenantOrder.map((id: TenantId) => {
                    const t = tenants[id];
                    const selected = tenant.id === id;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-[10px] border p-2 text-left text-xs transition-colors ${
                          selected
                            ? "border-ink"
                            : "border-line hover:bg-surface"
                        }`}
                        key={id}
                        onClick={() => {
                          setTenantId(id);
                          setRadius(Number.parseInt(t.theme.radius, 10));
                        }}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className="size-5 shrink-0 rounded-full"
                          style={{ background: t.theme.brand }}
                        />
                        <span className="truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="c-label mt-2">
                  Presets shown for the demo. Any color works; text contrast is
                  checked automatically.
                </p>
              </div>
              <Field
                hint="Applies to buttons, inputs, and cards."
                label={`Corner radius · ${radius}px`}
              >
                <input
                  className="mt-1 w-full accent-[var(--c-brand)]"
                  max={24}
                  min={6}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  step={2}
                  type="range"
                  value={radius}
                />
              </Field>
              <Field
                hint="SVG or PNG, shown in the header and footer."
                label="Logo"
              >
                <button
                  className="btn btn-ghost btn-md w-full justify-start"
                  type="button"
                >
                  <Upload aria-hidden="true" className="size-4" />
                  Upload logo
                </button>
              </Field>
              <Field label="Typeface">
                <select
                  className="field appearance-none"
                  defaultValue="reliance"
                >
                  <option value="reliance">
                    Reliance default (Hanken Grotesk)
                  </option>
                  <option value="system">System font</option>
                  <option value="custom">Upload brand font</option>
                </select>
              </Field>
            </div>
          )}

          {tab === "sections" && (
            <div className="mt-5">
              <p className="c-label mb-3">
                Reorder and show or hide report sections. Required sections stay
                on.
              </p>
              <ol className="space-y-1">
                {sections.map((s, i) => (
                  <li
                    className="flex items-center gap-2 rounded-[10px] px-1.5 py-1.5 hover:bg-surface"
                    key={s.id}
                  >
                    <GripVertical
                      aria-hidden="true"
                      className="size-4 shrink-0 text-ink-muted"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-sm">
                        {s.name}
                      </div>
                      <div className="c-label truncate">{s.summary}</div>
                    </div>
                    <div className="flex flex-col">
                      <button
                        aria-label={`Move ${s.name} up`}
                        className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        type="button"
                      >
                        <ChevronUp aria-hidden="true" className="size-3.5" />
                      </button>
                      <button
                        aria-label={`Move ${s.name} down`}
                        className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                        disabled={i === sections.length - 1}
                        onClick={() => move(i, 1)}
                        type="button"
                      >
                        <ChevronDown aria-hidden="true" className="size-3.5" />
                      </button>
                    </div>
                    {s.required ? (
                      <span
                        className="flex w-10 justify-center text-ink-muted"
                        title="Required"
                      >
                        <Lock aria-hidden="true" className="size-4" />
                      </span>
                    ) : (
                      <Switch
                        checked={s.visible}
                        label={`Show ${s.name}`}
                        onChange={(v) => toggle(s.id, v)}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tab === "chrome" && (
            <div className="mt-5 space-y-4">
              <div
                aria-label="Header and footer mode"
                className="space-y-2"
                role="radiogroup"
              >
                {chromeModes.map((m) => (
                  <label
                    className={`block cursor-pointer rounded-[12px] border p-3 transition-colors ${
                      chrome === m.value
                        ? "border-brand bg-brand-soft/50"
                        : "border-line hover:bg-surface"
                    }`}
                    key={m.value}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        checked={chrome === m.value}
                        className="accent-[var(--c-brand)]"
                        name="chrome"
                        onChange={() => setChrome(m.value)}
                        type="radio"
                      />
                      <span className="font-medium text-sm">{m.title}</span>
                    </span>
                    <span className="c-label mt-1 block pl-5">{m.body}</span>
                  </label>
                ))}
              </div>
              {chrome === "composable" && (
                <div>
                  <span className="mb-1.5 block font-medium text-sm">
                    Footer blocks
                  </span>
                  <ul className="divide-y divide-line">
                    {footerBlocks.map((b) => (
                      <li
                        className="flex items-center justify-between py-2 text-sm"
                        key={b.id}
                      >
                        <span>{b.label}</span>
                        {"locked" in b && b.locked ? (
                          <Lock
                            aria-hidden="true"
                            className="size-4 text-ink-muted"
                          />
                        ) : (
                          <Switch
                            checked={b.on}
                            label={b.label}
                            onChange={() => undefined}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {chrome === "html" && (
                <Field
                  hint="Scripts are stripped; styles are scoped to your block."
                  label="Footer HTML"
                >
                  <textarea
                    className="field h-32 resize-none py-2 font-mono text-xs"
                    defaultValue={"<footer>\n  ...\n</footer>"}
                  />
                </Field>
              )}
              {chrome === "mirror" && (
                <Field
                  hint="We read the header and footer regions from this page nightly."
                  label="Source page"
                >
                  <input
                    className="field"
                    defaultValue={`https://${tenant.website}/`}
                    type="url"
                  />
                </Field>
              )}
            </div>
          )}

          {tab === "copy" && (
            <div className="mt-5 space-y-4">
              <Field label="Search headline">
                <input
                  className="field"
                  onChange={(e) => setHeadline(e.target.value)}
                  type="text"
                  value={headline}
                />
              </Field>
              <Field label="Search button">
                <input
                  className="field"
                  onChange={(e) => setCta(e.target.value)}
                  type="text"
                  value={cta}
                />
              </Field>
              <Field
                hint="Shown under the value on every report."
                label="Estimate disclaimer"
              >
                <textarea
                  className="field h-24 resize-none py-2 text-sm"
                  defaultValue={tenant.mlsDisclaimer}
                />
              </Field>
              <p className="c-label">
                Every section heading and call to action is editable the same
                way. Spanish translations can be added per field.
              </p>
            </div>
          )}
        </div>

        <div className="panel flex min-w-0 flex-col p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="c-label">
              Preview · <span className="text-ink">{tenant.hostedDomain}</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor aria-hidden="true" className="size-4 text-ink-muted" />
              <Segmented
                label="Preview device"
                onChange={setDevice}
                options={devices}
                value={device}
              />
              <Smartphone
                aria-hidden="true"
                className="size-4 text-ink-muted"
              />
            </div>
          </div>
          <div className="flex flex-1 justify-center overflow-hidden rounded-[12px] bg-surface p-4">
            <div
              className="hvs overflow-hidden rounded-[12px] bg-canvas text-ink shadow-frame transition-[width] duration-300"
              style={{
                ...previewVars,
                width: device === "phone" ? 390 : "100%",
                zoom: device === "phone" ? 0.9 : 0.62,
              }}
            >
              <MiniReport
                cta={cta}
                device={device}
                headline={headline}
                visible={visibleIds}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniReport({
  visible,
  device,
  headline,
  cta,
}: {
  visible: Set<string>;
  device: Device;
  headline: string;
  cta: string;
}) {
  const { tenant } = useTenant();
  const phone = device === "phone";
  const { estimate } = property;
  const equityValue = estimate.value - property.equity.mortgageBalance;

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4">
        <TenantLogo size="sm" />
        <span className="btn btn-ghost btn-sm rounded-full">
          Talk to an agent
        </span>
      </div>
      <div
        className={`px-6 pt-6 pb-10 ${phone ? "" : "grid grid-cols-[1.1fr_1fr] items-center gap-8"}`}
      >
        <div>
          <h2 className="t-h2">{property.line1}</h2>
          <p className="text-ink-muted">{property.line2}</p>
          <div className="mt-6 text-ink-muted">Estimated value</div>
          <div className="t-figure-sm mt-1">{fmtMoney(estimate.value)}</div>
          <div className="mt-4 max-w-sm">
            <ValueGauge
              high={estimate.high}
              low={estimate.low}
              value={estimate.value}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="btn btn-brand btn-pill">{cta}</span>
            <span className="btn btn-ghost btn-pill">Claim this home</span>
          </div>
        </div>
        {!phone && (
          <img
            alt=""
            className="aspect-[4/3] w-full rounded-3xl object-cover"
            height={1200}
            src={property.photo}
            width={1600}
          />
        )}
      </div>
      <div className="border-line border-y px-6 py-2.5">
        <ul className="flex gap-1 overflow-hidden">
          {[
            ["value", "Value"],
            ["equity", "Equity"],
            ["buyers", "Buyers"],
            ["market", "Market"],
            ["comps", "Nearby sales"],
            ["facts", "Home facts"],
          ]
            .filter(([id]) => visible.has(id ?? ""))
            .map(([id, label], i) => (
              <li
                className={`h-8 shrink-0 rounded-full px-3 text-sm leading-8 ${i === 0 ? "bg-ink text-canvas" : "text-ink-muted"}`}
                key={id}
              >
                {label}
              </li>
            ))}
        </ul>
      </div>
      {visible.has("value") && (
        <div className="px-6 py-10">
          <h3 className="t-h3">How we got to {fmtMoney(estimate.value)}.</h3>
          <p className="mt-2 max-w-md text-ink-muted">
            Three independent methods, shown side by side.
          </p>
        </div>
      )}
      {visible.has("equity") && (
        <div className="bg-dark px-6 py-10 text-canvas">
          <h3 className="t-h3">Your equity, estimated.</h3>
          <div className="t-figure-sm mt-3">{fmtMoney(equityValue)}</div>
        </div>
      )}
      {visible.has("buyers") && (
        <div className="px-6 py-10">
          <h3 className="t-h3">
            {property.buyers.matched} buyers are looking for a home like yours.
          </h3>
        </div>
      )}
      {visible.has("lender") && (
        <div className="bg-surface px-6 py-8">
          <h3 className="t-h3">Refinance options from Coastal Lending</h3>
          <p className="mt-1 text-ink-muted text-sm">
            Lender co-brand block · NMLS 123456
          </p>
        </div>
      )}
      <div className="border-line border-t px-6 py-6 text-ink-muted text-xs">
        <div className="mb-2 font-medium text-ink text-sm">
          {tenant.legalName}
        </div>
        <p className="max-w-lg">{tenant.mlsDisclaimer}</p>
        <p className="mt-3 text-ink">
          Search page headline: <span className="italic">“{headline}”</span>
        </p>
      </div>
    </div>
  );
}
