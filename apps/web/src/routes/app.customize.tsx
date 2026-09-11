import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  GripVertical,
  Lock,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { ColumnChart } from "@/components/charts/column-chart";
import { CompsMap } from "@/components/charts/comps-map";
import { HBars } from "@/components/charts/hbars";
import { Field, Pill, Segmented, Switch } from "@/components/console/ui";
import { SellForPanel } from "@/components/home-report/sell-for-panel";
import { TenantLogo } from "@/components/home-report/tenant-logo";
import { ValueGauge } from "@/components/home-report/value-gauge";
import { WatchHome } from "@/components/home-report/watch-home";
import { contrastRatio } from "@/lib/measure";
import { fmtMoney, fmtNum, months12, property } from "@/lib/mock-data";
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

/* ---------- Configuration model (mock) ---------- */

type Placement = "hosted" | "embed" | "agent";

interface SectionOption {
  choices?: readonly string[];
  key: string;
  kind: "number" | "toggle" | "select" | "text";
  label: string;
  suffix?: string;
  value: string | number | boolean;
}

interface Section {
  heading: string;
  id: string;
  lead: string;
  name: string;
  options: SectionOption[];
  placements: Record<Placement, boolean>;
  required?: boolean;
  summary: string;
  visible: boolean;
}

const allOn: Record<Placement, boolean> = {
  agent: true,
  embed: true,
  hosted: true,
};

const initialSections: Section[] = [
  {
    heading: "",
    id: "hero",
    lead: "",
    name: "Address & estimate",
    options: [],
    placements: allOn,
    required: true,
    summary: "Value, range, and home facts",
    visible: true,
  },
  {
    heading: "How we got to {value}.",
    id: "value",
    lead: "Three independent estimates, shown side by side. The headline is the highest of the three.",
    name: "How we got the number",
    options: [
      {
        choices: ["3", "2", "1"],
        key: "sources",
        kind: "select",
        label: "Sources shown",
        value: "3",
      },
      {
        key: "condition",
        kind: "toggle",
        label: "Show condition control",
        value: true,
      },
      {
        key: "trend",
        kind: "toggle",
        label: "Show value over time",
        value: true,
      },
    ],
    placements: allOn,
    summary: "Three sources and 24-month trend",
    visible: true,
  },
  {
    heading: "Your equity, estimated.",
    id: "equity",
    lead: "",
    name: "Equity",
    options: [
      {
        key: "commission",
        kind: "number",
        label: "Selling costs",
        suffix: "%",
        value: 6,
      },
      {
        key: "slider",
        kind: "toggle",
        label: "Show sale-price slider",
        value: true,
      },
    ],
    placements: allOn,
    summary: "Estimated equity and sale-proceeds slider",
    visible: true,
  },
  {
    heading: "{count} buyers are looking for a home like yours.",
    id: "buyers",
    lead: "Active buyers registered with {brokerage} and partner brokerages in the last 30 days.",
    name: "Buyers looking",
    options: [
      {
        key: "radius",
        kind: "number",
        label: "Buyer radius",
        suffix: "mi",
        value: 5,
      },
      { key: "featured", kind: "number", label: "Featured buyers", value: 3 },
      {
        key: "demand",
        kind: "toggle",
        label: "Show demand breakdown",
        value: true,
      },
    ],
    placements: allOn,
    summary: "Buyer funnel, featured buyers, demand",
    visible: true,
  },
  {
    heading: "{neighborhood}, the last 12 months.",
    id: "market",
    lead: "",
    name: "Market",
    options: [
      {
        choices: ["12", "24"],
        key: "months",
        kind: "select",
        label: "Months of history",
        value: "12",
      },
      {
        key: "ppsf",
        kind: "toggle",
        label: "Show price per sq ft",
        value: false,
      },
    ],
    placements: allOn,
    summary: "Neighborhood stats, sales per month",
    visible: true,
  },
  {
    heading: "Sold nearby.",
    id: "comps",
    lead: "The recent sales that most resemble your home, within half a mile.",
    name: "Nearby sales",
    options: [
      {
        key: "radius",
        kind: "number",
        label: "Radius",
        suffix: "mi",
        value: 0.5,
      },
      { key: "count", kind: "number", label: "Sales shown", value: 4 },
      { key: "map", kind: "toggle", label: "Show map", value: true },
    ],
    placements: allOn,
    summary: "Map and comparable sales",
    visible: true,
  },
  {
    heading: "Home facts.",
    id: "facts",
    lead: "From public records. If something's wrong, claim this home to fix it.",
    name: "Home facts",
    options: [
      { key: "rows", kind: "number", label: "Rows before Show all", value: 6 },
    ],
    placements: allOn,
    summary: "Public-record details, claim to edit",
    visible: true,
  },
  {
    heading: "Watch this home.",
    id: "updates",
    lead: "On the first of every month: your updated value, what sold nearby, and buyers who match.",
    name: "Monthly updates",
    options: [
      { key: "name", kind: "toggle", label: "Ask for name", value: true },
      {
        key: "preview",
        kind: "toggle",
        label: "Show email preview",
        value: true,
      },
    ],
    placements: allOn,
    summary: "Watch-this-home signup with email preview",
    visible: true,
  },
  {
    heading: "Want a precise number? Talk to {agent}.",
    id: "agent",
    lead: "",
    name: "Talk to an agent",
    options: [
      {
        choices: ["Round robin by ZIP", "Office default", "Agent page owner"],
        key: "assign",
        kind: "select",
        label: "Assign leads by",
        value: "Round robin by ZIP",
      },
      {
        key: "timeline",
        kind: "toggle",
        label: "Ask selling timeline",
        value: true,
      },
    ],
    placements: allOn,
    required: true,
    summary: "Agent card and consult form",
    visible: true,
  },
  {
    heading: "Refinance options from {lender}.",
    id: "lender",
    lead: "",
    name: "Lender co-brand",
    options: [
      {
        key: "lender",
        kind: "text",
        label: "Lender",
        value: "Coastal Lending",
      },
      { key: "nmls", kind: "text", label: "NMLS", value: "123456" },
    ],
    placements: { agent: false, embed: false, hosted: true },
    summary: "Refinance options with partner lender",
    visible: false,
  },
  {
    heading: "",
    id: "compliance",
    lead: "",
    name: "MLS disclaimer",
    options: [],
    placements: allOn,
    required: true,
    summary: "Required legal text",
    visible: true,
  },
];

const tabs = [
  { label: "Theme", value: "theme" },
  { label: "Sections", value: "sections" },
  { label: "Header & footer", value: "chrome" },
  { label: "Copy", value: "copy" },
] as const;
type Tab = (typeof tabs)[number]["value"];

const devices = [
  { label: "Desktop", value: "desktop" },
  { label: "Phone", value: "phone" },
] as const;
type Device = (typeof devices)[number]["value"];

const placementsList = [
  { label: "Hosted site", value: "hosted" },
  { label: "Embed", value: "embed" },
  { label: "Agent page", value: "agent" },
] as const;

const chromeModes = [
  {
    body: "Turn blocks on or off and reorder them. Always on-brand, responsive, and accessible. Recommended.",
    title: "Composable blocks",
    value: "composable",
  },
  {
    body: "Paste your own header and footer markup. Sanitized and sandboxed; styles are scoped so they can't break the report.",
    title: "Custom HTML",
    value: "html",
  },
  {
    body: "Reliance fetches the header and footer from a URL on your site and keeps them in sync. Best for large brokerages with strict brand systems.",
    title: "Mirror my website",
    value: "mirror",
  },
] as const;
type ChromeMode = (typeof chromeModes)[number]["value"];

type FooterBlockId =
  | "brand"
  | "links"
  | "agent"
  | "legal"
  | "social"
  | "powered"
  | "contact"
  | "badges"
  | "text"
  | "apps";

interface FooterColumn {
  blocks: FooterBlockId[];
  id: string;
}

const footerCatalog: Record<
  FooterBlockId,
  { label: string; locked?: boolean }
> = {
  agent: { label: "Local expert card" },
  apps: { label: "Download our app" },
  badges: { label: "Equal Housing and REALTOR® badges" },
  brand: { label: "Brand and tagline" },
  contact: { label: "Office contact" },
  legal: { label: "Legal and MLS disclaimer", locked: true },
  links: { label: "Explore links" },
  powered: { label: "Powered by Reliance", locked: true },
  social: { label: "Social links" },
  text: { label: "Custom text" },
};

const MAX_FOOTER_COLUMNS = 4;

type HeaderBlockId = "logo" | "links" | "search" | "phone" | "agent" | "talk";

interface HeaderBlock {
  id: HeaderBlockId;
  on: boolean;
}

const headerCatalog: Record<
  HeaderBlockId,
  { label: string; locked?: boolean; hint?: string }
> = {
  agent: { hint: "Agent pages only", label: "Agent name and photo" },
  links: { hint: "Home value · Sell · Buy", label: "Site links" },
  logo: { label: "Logo", locked: true },
  phone: { label: "Office phone" },
  search: { hint: "On the report page", label: "Address search" },
  talk: { label: "Talk to an agent button" },
};

const initialHeader: HeaderBlock[] = [
  { id: "logo", on: true },
  { id: "agent", on: true },
  { id: "links", on: false },
  { id: "search", on: true },
  { id: "phone", on: true },
  { id: "talk", on: true },
];

const initialFooter: FooterColumn[] = [
  { blocks: ["brand"], id: "c1" },
  { blocks: ["links"], id: "c2" },
  { blocks: ["agent"], id: "c3" },
  { blocks: ["legal", "powered"], id: "c4" },
];

const typefaces = [
  {
    css: "var(--font-sans)",
    label: "Reliance default (Hanken Grotesk)",
    value: "reliance",
  },
  {
    css: "system-ui, -apple-system, sans-serif",
    label: "System font",
    value: "system",
  },
  {
    css: 'Georgia, "Times New Roman", serif',
    label: "Brokerage serif (uploaded)",
    value: "serif",
  },
] as const;
type Typeface = (typeof typefaces)[number]["value"];

const versions = [
  {
    by: "Maya Ortiz",
    id: 12,
    note: "Hid lender co-brand, raised buyer radius to 5 mi",
    when: "Tue, 2:14 pm",
  },
  { by: "Sam Patel", id: 11, note: "New MLS disclaimer text", when: "Aug 28" },
  {
    by: "Maya Ortiz",
    id: 10,
    note: "Switched footer to composable blocks",
    when: "Aug 21",
  },
  { by: "Maya Ortiz", id: 9, note: "Brand color and radius", when: "Aug 12" },
] as const;

const DEFAULT_BRAND_HEX = "#0f5f6b";

/* ---------- Page ---------- */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: a single mock screen composed of four tabs and a preview; splitting it would only scatter local state
function CustomizePage() {
  const { tenant, setTenantId } = useTenant();
  const [tab, setTab] = useState<Tab>("theme");
  const [device, setDevice] = useState<Device>("desktop");
  const [placement, setPlacement] = useState<Placement>("hosted");
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chrome, setChrome] = useState<ChromeMode>("composable");
  const [footer, setFooter] = useState<FooterColumn[]>(initialFooter);
  const [header, setHeader] = useState<HeaderBlock[]>(initialHeader);
  const [stickyHeader, setStickyHeader] = useState(true);
  const [radius, setRadius] = useState<number>(
    Number.parseInt(tenant.theme.radius, 10)
  );
  const [brand, setBrand] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [typeface, setTypeface] = useState<Typeface>("reliance");
  const [changes, setChanges] = useState(0);
  const [lastPublished, setLastPublished] = useState("Tue, 2:14 pm");
  const [history, setHistory] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const touch = () => setChanges((n) => n + 1);

  const update = (id: string, patch: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    touch();
  };

  const updateOption = (
    id: string,
    key: string,
    value: SectionOption["value"]
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              options: s.options.map((o) =>
                o.key === key ? { ...o, value } : o
              ),
            }
          : s
      )
    );
    touch();
  };

  const move = (from: number, to: number) => {
    setSections((prev) => {
      if (to < 0 || to >= prev.length || from === to) {
        return prev;
      }
      const next = [...prev];
      const [item] = next.splice(from, 1);
      if (!item) {
        return prev;
      }
      next.splice(to, 0, item);
      return next;
    });
    touch();
  };

  const editFooter = (next: FooterColumn[]) => {
    setFooter(next);
    touch();
  };

  const scrollPreviewTo = (id: string) => {
    const root = previewRef.current;
    const target = root?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (target) {
      root?.scrollTo({ behavior: "smooth", top: target.offsetTop - 12 });
    }
  };

  const discard = () => {
    setSections(initialSections);
    setFooter(initialFooter);
    setHeader(initialHeader);
    setStickyHeader(true);
    setBrand(null);
    setLogo(null);
    setTypeface("reliance");
    setRadius(Number.parseInt(tenant.theme.radius, 10));
    setChanges(0);
  };

  const onLogoFile = (file: File | undefined) => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(typeof reader.result === "string" ? reader.result : null);
      touch();
    };
    reader.readAsDataURL(file);
  };

  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const brandColor = brand ?? tenant.theme.brand;
  const previewVars = {
    ...tenantVars(tenant),
    "--c-brand": brandColor,
    "--c-brand-soft": `color-mix(in oklch, ${brandColor} 10%, white)`,
    "--c-dark": `color-mix(in oklch, ${brandColor} 25%, oklch(0.16 0 0))`,
    "--c-radius": `${radius}px`,
    fontFamily: typefaces.find((t) => t.value === typeface)?.css ?? "inherit",
  } as CSSProperties;

  const visibleSections = sections.filter(
    (s) => s.visible && s.placements[placement]
  );
  const placementUrl: Record<Placement, string> = {
    agent: `${tenant.website}/agents/${tenant.agent.name.split(" ")[0]?.toLowerCase() ?? ""}`,
    embed: `${tenant.website}/sell-your-home`,
    hosted: tenant.hostedDomain,
  };

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
        <div className="flex flex-wrap items-center gap-2">
          {changes > 0 ? (
            <Pill dot tone="warn">
              {changes} unpublished
            </Pill>
          ) : (
            <Pill tone="neutral">Up to date</Pill>
          )}
          <button
            className="inline-flex items-center gap-1.5 px-2 text-ink-muted text-sm hover:text-ink"
            onClick={() => setHistory((v) => !v)}
            type="button"
          >
            <Clock aria-hidden="true" className="size-3.5" />
            Published {lastPublished}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={changes === 0}
            onClick={discard}
            type="button"
          >
            Discard
          </button>
          <button
            className="btn btn-brand btn-sm"
            disabled={changes === 0}
            onClick={() => {
              setChanges(0);
              setLastPublished("just now");
            }}
            type="button"
          >
            Publish changes
          </button>
        </div>
      </div>

      {history ? (
        <div className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="c-section">Version history</h2>
            <span className="c-label">
              Restoring creates a new version; nothing is lost.
            </span>
          </div>
          <ol className="divide-y divide-line">
            {versions.map((v, i) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm"
                key={v.id}
              >
                <div className="flex items-center gap-3">
                  <span className="tabular w-8 text-ink-muted">v{v.id}</span>
                  <span className="font-medium">{v.note}</span>
                  <span className="c-label">
                    {v.when} · {v.by}
                  </span>
                </div>
                {i === 0 ? (
                  <Pill tone="good">Live</Pill>
                ) : (
                  <button className="btn btn-ghost btn-sm" type="button">
                    <RotateCcw aria-hidden="true" className="size-3.5" />{" "}
                    Restore
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[23rem_1fr]">
        <div className="panel self-start p-4 lg:max-h-[calc(100svh_-_13.25rem)] lg:overflow-y-auto">
          <Segmented
            label="Customize section"
            onChange={setTab}
            options={tabs}
            size="sm"
            value={tab}
          />

          {tab === "theme" ? (
            <div className="mt-5 space-y-5">
              <Field label="Brand color">
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Pick a brand color"
                    className="size-11 shrink-0 cursor-pointer rounded-[10px] border border-line bg-transparent p-1"
                    onChange={(e) => {
                      setBrand(e.target.value);
                      touch();
                    }}
                    type="color"
                    value={brand ?? DEFAULT_BRAND_HEX}
                  />
                  <div className="min-w-0 flex-1">
                    <ContrastBadge color={brandColor} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tenantOrder.map((id: TenantId) => {
                    const t = tenants[id];
                    const selectedTenant = tenant.id === id && brand === null;
                    return (
                      <button
                        aria-pressed={selectedTenant}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                          selectedTenant
                            ? "border-ink"
                            : "border-line hover:bg-surface"
                        }`}
                        key={id}
                        onClick={() => {
                          setTenantId(id);
                          setBrand(null);
                          setRadius(Number.parseInt(t.theme.radius, 10));
                          touch();
                        }}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full"
                          style={{ background: t.theme.brand }}
                        />
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field
                hint="Applies to buttons, inputs, and cards."
                label={`Corner radius · ${radius}px`}
              >
                <input
                  className="mt-1 w-full accent-[var(--c-brand)]"
                  max={24}
                  min={6}
                  onChange={(e) => {
                    setRadius(Number(e.target.value));
                    touch();
                  }}
                  step={2}
                  type="range"
                  value={radius}
                />
              </Field>
              <Field
                hint="SVG or PNG. Shown in the header, footer, and the monthly email."
                label="Logo"
              >
                <div className="flex items-center gap-3">
                  <label className="btn btn-ghost btn-md flex-1 cursor-pointer justify-start">
                    <Upload aria-hidden="true" className="size-4" />
                    {logo ? "Replace logo" : "Upload logo"}
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => onLogoFile(e.target.files?.[0])}
                      type="file"
                    />
                  </label>
                  {logo ? (
                    <button
                      className="text-ink-muted text-sm hover:text-ink"
                      onClick={() => {
                        setLogo(null);
                        touch();
                      }}
                      type="button"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </Field>
              <Field label="Typeface">
                <select
                  className="field appearance-none"
                  onChange={(e) => {
                    setTypeface(e.target.value as Typeface);
                    touch();
                  }}
                  value={typeface}
                >
                  {typefaces.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}

          {tab === "sections" && selected === null ? (
            <div className="mt-5">
              <p className="c-label mb-3">
                Drag to reorder. Click a section for its settings. Required
                sections stay on.
              </p>
              <ol className="space-y-1">
                {sections.map((s, i) => (
                  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag handlers reorder the list; the arrow buttons provide the keyboard path
                  <li
                    className={`flex items-center gap-2 rounded-[10px] px-1.5 py-1.5 transition-colors hover:bg-surface ${
                      dragId === s.id ? "opacity-40" : ""
                    } ${s.visible ? "" : "text-ink-muted"}`}
                    draggable={!s.required}
                    key={s.id}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragId && dragId !== s.id) {
                        move(
                          sections.findIndex((x) => x.id === dragId),
                          i
                        );
                      }
                    }}
                    onDragStart={() => setDragId(s.id)}
                  >
                    <GripVertical
                      aria-hidden="true"
                      className={`size-4 shrink-0 ${s.required ? "opacity-30" : "cursor-grab text-ink-muted"}`}
                    />
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setSelectedId(s.id);
                        scrollPreviewTo(s.id);
                      }}
                      type="button"
                    >
                      <span className="block truncate font-medium text-sm">
                        {s.name}
                      </span>
                      <span className="c-label block truncate">
                        {s.summary}
                      </span>
                    </button>
                    <div className="flex flex-col">
                      <button
                        aria-label={`Move ${s.name} up`}
                        className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                        type="button"
                      >
                        <ChevronUp aria-hidden="true" className="size-3.5" />
                      </button>
                      <button
                        aria-label={`Move ${s.name} down`}
                        className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                        disabled={i === sections.length - 1}
                        onClick={() => move(i, i + 1)}
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
                        onChange={(v) => update(s.id, { visible: v })}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {tab === "sections" && selected ? (
            <SectionInspector
              onBack={() => setSelectedId(null)}
              onOption={(key, v) => updateOption(selected.id, key, v)}
              onPatch={(patch) => update(selected.id, patch)}
              section={selected}
            />
          ) : null}

          {tab === "chrome" ? (
            <div className="mt-5 space-y-4">
              <fieldset className="space-y-2">
                <legend className="sr-only">Header and footer mode</legend>
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
                        onChange={() => {
                          setChrome(m.value);
                          touch();
                        }}
                        type="radio"
                      />
                      <span className="font-medium text-sm">{m.title}</span>
                    </span>
                    <span className="c-label mt-1 block pl-5">{m.body}</span>
                  </label>
                ))}
              </fieldset>
              {chrome === "composable" ? (
                <>
                  <HeaderEditor
                    blocks={header}
                    onChange={(next) => {
                      setHeader(next);
                      touch();
                    }}
                    onSticky={(v) => {
                      setStickyHeader(v);
                      touch();
                    }}
                    sticky={stickyHeader}
                  />
                  <FooterEditor columns={footer} onChange={editFooter} />
                </>
              ) : null}
              {chrome === "html" ? (
                <div className="space-y-3">
                  <Field
                    hint="Scripts are stripped; styles are scoped to your block."
                    label="Footer HTML"
                  >
                    <textarea
                      className="field h-32 resize-none py-2 font-mono text-xs"
                      defaultValue={
                        '<footer class="hv-footer">\n  <img src="/logo.svg" alt="Harbor & Vale">\n  <nav>…</nav>\n  <script src="/track.js"></script>\n</footer>'
                      }
                      onChange={touch}
                    />
                  </Field>
                  <div className="rounded-[10px] bg-surface px-3 py-2.5 text-sm">
                    <div className="font-medium">Sanitized on save</div>
                    <ul className="c-label mt-1 list-disc pl-4">
                      <li>Removed 1 script tag</li>
                      <li>Scoped 3 style rules to the footer</li>
                      <li>Kept 1 image and 1 nav</li>
                    </ul>
                  </div>
                </div>
              ) : null}
              {chrome === "mirror" ? (
                <div className="space-y-3">
                  <Field
                    hint="We read the header and footer regions from this page nightly."
                    label="Source page"
                  >
                    <input
                      className="field"
                      defaultValue={`https://${tenant.website}/`}
                      onChange={touch}
                      type="url"
                    />
                  </Field>
                  <div className="flex items-center justify-between rounded-[10px] bg-surface px-3 py-2.5 text-sm">
                    <div>
                      <div className="font-medium">Fetched 2 hours ago</div>
                      <div className="c-label">
                        Header and footer found · 14 links · fallback set to
                        composable
                      </div>
                    </div>
                    <Pill dot tone="good">
                      In sync
                    </Pill>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "copy" ? (
            <div className="mt-5 space-y-4">
              <p className="c-label">
                Every heading and lead on the report. Tokens like {"{value}"},{" "}
                {"{count}"}, and {"{agent}"} fill in per report.
              </p>
              <div className="max-h-[34rem] space-y-5 overflow-y-auto pr-1">
                {sections
                  .filter((sec) => sec.heading)
                  .map((sec) => {
                    const defaults = initialSections.find(
                      (d) => d.id === sec.id
                    );
                    return (
                      <div key={sec.id}>
                        <div className="mb-1.5 font-medium text-sm">
                          {sec.name}
                        </div>
                        <CopyField
                          defaultValue={defaults?.heading ?? ""}
                          label="Heading"
                          onChange={(v) => update(sec.id, { heading: v })}
                          value={sec.heading}
                        />
                        {defaults?.lead ? (
                          <CopyField
                            defaultValue={defaults.lead}
                            label="Lead"
                            multiline
                            onChange={(v) => update(sec.id, { lead: v })}
                            value={sec.lead}
                          />
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="panel flex min-w-0 flex-col p-4 lg:h-[calc(100svh_-_13.25rem)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Segmented
                label="Preview as"
                onChange={setPlacement}
                options={placementsList}
                value={placement}
              />
              <span className="c-label hidden xl:inline">
                {placementUrl[placement]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Segmented
                label="Preview device"
                onChange={setDevice}
                options={devices}
                value={device}
              />
              <Link
                className="btn btn-ghost btn-sm"
                target="_blank"
                to="/home-report/2148-bayshore-lane"
              >
                Open full report{" "}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden rounded-[12px] bg-surface p-4">
            <div
              className="relative h-full overflow-y-auto rounded-[12px] shadow-frame transition-[width] duration-300 [contain:layout_paint]"
              ref={previewRef}
              style={{
                width: device === "phone" ? 390 : "100%",
                zoom: device === "phone" ? 0.9 : 0.6,
              }}
            >
              <ReportPreview
                footer={footer}
                header={header}
                logo={logo}
                phone={device === "phone"}
                placement={placement}
                sections={visibleSections}
                selectedId={selectedId}
                vars={previewVars}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Editors ---------- */

function ContrastBadge({ color }: { color: string }) {
  const [ratio, setRatio] = useState<number | null>(null);
  useEffect(() => {
    setRatio(contrastRatio("white", color));
  }, [color]);
  if (ratio === null) {
    return <span className="c-label">Checking contrast…</span>;
  }
  const ok = ratio >= 4.5;
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="tabular font-medium">{ratio.toFixed(1)}:1</span>
        <Pill tone={ok ? "good" : "warn"}>
          {ok ? "White text passes AA" : "Too light for white text"}
        </Pill>
      </div>
      <div className="c-label mt-0.5">
        {ok
          ? "Buttons and the monthly-update section use white text."
          : "We'll darken it for buttons until it passes."}
      </div>
    </div>
  );
}

function SectionInspector({
  section,
  onBack,
  onPatch,
  onOption,
}: {
  section: Section;
  onBack: () => void;
  onPatch: (patch: Partial<Section>) => void;
  onOption: (key: string, value: SectionOption["value"]) => void;
}) {
  const defaults = initialSections.find((s) => s.id === section.id);
  return (
    <div className="mt-5">
      <button
        className="inline-flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" /> All sections
      </button>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="c-section">{section.name}</h2>
          <p className="c-label">{section.summary}</p>
        </div>
        {section.required ? (
          <Pill tone="neutral">Required</Pill>
        ) : (
          <Switch
            checked={section.visible}
            label={`Show ${section.name}`}
            onChange={(v) => onPatch({ visible: v })}
          />
        )}
      </div>

      {section.required ? (
        <p className="mt-3 rounded-[10px] bg-surface px-3 py-2 text-ink-muted text-sm">
          {section.id === "compliance"
            ? "Your MLS requires this text on every report. Edit the wording in Settings."
            : "Every report needs this section. You can change its copy and settings."}
        </p>
      ) : null}

      <h3 className="c-label mt-5 mb-2 font-medium">Show on</h3>
      <div className="flex flex-wrap gap-1.5">
        {placementsList.map((p) => {
          const on = section.placements[p.value];
          return (
            <button
              aria-pressed={on}
              className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors ${
                on
                  ? "border-ink bg-ink text-canvas"
                  : "border-line text-ink-muted hover:bg-surface"
              }`}
              disabled={section.required}
              key={p.value}
              onClick={() =>
                onPatch({
                  placements: { ...section.placements, [p.value]: !on },
                })
              }
              type="button"
            >
              {on ? <Check aria-hidden="true" className="size-3" /> : null}
              {p.label}
            </button>
          );
        })}
      </div>

      {section.options.length > 0 ? (
        <>
          <h3 className="c-label mt-5 mb-2 font-medium">Settings</h3>
          <div className="divide-y divide-line">
            {section.options.map((o) => (
              <OptionRow
                key={o.key}
                onChange={(v) => onOption(o.key, v)}
                option={o}
              />
            ))}
          </div>
        </>
      ) : null}

      {section.heading ? (
        <>
          <h3 className="c-label mt-5 mb-2 font-medium">Copy</h3>
          <CopyField
            defaultValue={defaults?.heading ?? ""}
            label="Heading"
            onChange={(v) => onPatch({ heading: v })}
            value={section.heading}
          />
          {defaults?.lead ? (
            <CopyField
              defaultValue={defaults.lead}
              label="Lead"
              multiline
              onChange={(v) => onPatch({ lead: v })}
              value={section.lead}
            />
          ) : null}
          <p className="c-label mt-2">
            Tokens like {"{value}"}, {"{count}"}, and {"{agent}"} fill in per
            report.
          </p>
        </>
      ) : null}
    </div>
  );
}

function OptionRow({
  option,
  onChange,
}: {
  option: SectionOption;
  onChange: (v: SectionOption["value"]) => void;
}) {
  if (option.kind === "toggle") {
    return (
      <div className="flex items-center justify-between py-2 text-sm">
        <span>{option.label}</span>
        <Switch
          checked={option.value === true}
          label={option.label}
          onChange={onChange}
        />
      </div>
    );
  }
  if (option.kind === "select") {
    return (
      <label className="flex items-center justify-between gap-3 py-2 text-sm">
        <span>{option.label}</span>
        <select
          className="field h-8 w-auto max-w-[11rem] appearance-none text-sm"
          onChange={(e) => onChange(e.target.value)}
          value={String(option.value)}
        >
          {option.choices?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const numeric = option.kind === "number";
  return (
    <label className="flex items-center justify-between gap-3 py-2 text-sm">
      <span>{option.label}</span>
      <span className="flex items-center gap-1.5">
        <input
          className={`field h-8 text-sm ${numeric ? "w-20 text-right" : "w-40"}`}
          inputMode={numeric ? "decimal" : undefined}
          onChange={(e) =>
            onChange(numeric ? Number(e.target.value) : e.target.value)
          }
          type={numeric ? "number" : "text"}
          value={String(option.value)}
        />
        {option.suffix ? (
          <span className="c-label">{option.suffix}</span>
        ) : null}
      </span>
    </label>
  );
}

function CopyField({
  label,
  value,
  defaultValue,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const changed = value !== defaultValue;
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the input or textarea is rendered inside this label below
    <label className="mb-3 block">
      <span className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {changed ? (
          <button
            className="c-label inline-flex items-center gap-1 hover:text-ink"
            onClick={() => onChange(defaultValue)}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-3" /> Reset
          </button>
        ) : null}
      </span>
      {multiline ? (
        <textarea
          className="field h-20 resize-none py-2 text-sm"
          onChange={(e) => onChange(e.target.value)}
          value={value}
        />
      ) : (
        <input
          className="field text-sm"
          onChange={(e) => onChange(e.target.value)}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}

/* ---------- Live preview ---------- */

interface ReportPreviewProps {
  footer: FooterColumn[];
  header: HeaderBlock[];
  logo: string | null;
  phone: boolean;
  placement: Placement;
  sections: Section[];
  selectedId: string | null;
  vars: CSSProperties;
}

const factRows = [
  ["Type", property.facts.type],
  ["Bedrooms", String(property.facts.beds)],
  ["Bathrooms", String(property.facts.baths)],
  ["Living area", `${fmtNum(property.facts.sqft)} sq ft`],
  ["Lot", `${fmtNum(property.facts.lotSqft)} sq ft`],
  ["Year built", String(property.facts.yearBuilt)],
  ["Stories", String(property.facts.stories)],
  ["Garage", property.facts.garage],
] as const;

const timelines = [
  "Within 3 months",
  "3 to 6 months",
  "6 to 12 months",
  "Just curious",
] as const;

function ReportPreview({
  sections,
  placement,
  footer,
  header,
  logo,
  selectedId,
  vars,
  phone,
}: ReportPreviewProps) {
  const { tenant } = useTenant();
  const { estimate, buyers, market, comps } = property;
  const equityValue = estimate.value - property.equity.mortgageBalance;
  const firstName = tenant.agent.name.split(" ")[0] ?? "";

  const opt = (id: string, key: string): SectionOption["value"] | undefined =>
    sections.find((s) => s.id === id)?.options.find((o) => o.key === key)
      ?.value;
  const num = (id: string, key: string, fallback: number): number => {
    const v = opt(id, key);
    return typeof v === "number" ? v : Number(v ?? fallback);
  };
  const text = (s: Section, field: "heading" | "lead") =>
    s[field]
      .replace("{value}", fmtMoney(estimate.value))
      .replace("{count}", String(buyers.matched))
      .replace("{brokerage}", tenant.name)
      .replace("{neighborhood}", property.neighborhood)
      .replace("{agent}", firstName)
      .replace("{lender}", String(opt("lender", "lender") ?? "your lender"));

  const commission = num("equity", "commission", 6);
  const proceeds =
    estimate.value -
    Math.round(estimate.value * (commission / 100)) -
    property.equity.mortgageBalance;
  const showPpsf = opt("market", "ppsf") === true;
  const brandMark = logo ? (
    <img
      alt={tenant.name}
      className="h-7 w-auto"
      height={28}
      src={logo}
      width={96}
    />
  ) : (
    <TenantLogo size="sm" />
  );
  const frame = (id: string) =>
    selectedId === id ? "shadow-[inset_0_0_0_3px_var(--c-brand)]" : "";

  const body = (
    <div className="home-report @container bg-canvas text-ink" style={vars}>
      {placement === "embed" ? null : (
        <div className="flex items-center justify-between gap-6 px-8 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {brandMark}
            {placement === "agent" &&
            header.find((h) => h.id === "agent")?.on ? (
              <span className="flex items-center gap-2 border-line border-l pl-3 text-sm">
                <img
                  alt=""
                  className="size-7 rounded-full object-cover"
                  height={28}
                  src={tenant.agent.photo}
                  width={28}
                />
                {tenant.agent.name}
              </span>
            ) : null}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            {header
              .filter((h) => h.on && h.id !== "logo" && h.id !== "agent")
              .map((h) => (
                <HeaderBlockView
                  firstName={firstName}
                  id={h.id}
                  key={h.id}
                  phone={phone}
                  placement={placement}
                />
              ))}
          </div>
        </div>
      )}

      {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one renderer per report section, kept together so the preview reads top to bottom */}
      {sections.map((s) => (
        <div
          className={`transition-shadow ${frame(s.id)}`}
          data-section={s.id}
          key={s.id}
        >
          {s.id === "hero" ? (
            <div
              className={`grid items-center gap-8 px-8 pt-6 pb-10 ${phone ? "grid-cols-1" : "grid-cols-[1.1fr_1fr]"}`}
            >
              <div>
                <h2 className="t-h2">{property.line1}</h2>
                <p className="text-ink-muted">{property.line2}</p>
                <div className="mt-6 text-ink-muted">Estimated value</div>
                <div
                  className={`tabular mt-1 font-light tracking-[-0.025em] ${phone ? "text-[2.75rem] leading-none" : "t-figure-sm"}`}
                >
                  {fmtMoney(estimate.value)}
                </div>
                <div className="mt-4 max-w-sm">
                  <ValueGauge
                    high={estimate.high}
                    low={estimate.low}
                    value={estimate.value}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="btn btn-brand btn-pill">
                    Talk to {firstName}
                  </span>
                  <span className="btn btn-ghost btn-pill">
                    Claim this home
                  </span>
                </div>
              </div>
              <img
                alt=""
                className="aspect-[4/3] w-full rounded-3xl object-cover"
                height={1200}
                src={property.photo}
                width={1600}
              />
            </div>
          ) : null}

          {s.id === "value" ? (
            <div className="px-8 py-12">
              <h3 className="t-h2 max-w-[20ch]">{text(s, "heading")}</h3>
              <p className="t-lead mt-3 max-w-[60ch] text-ink-muted">
                {text(s, "lead")}
              </p>
              <div
                className={`mt-8 grid gap-8 ${phone ? "grid-cols-1" : "grid-cols-3"}`}
              >
                {property.sources
                  .slice(0, num("value", "sources", 3))
                  .map((src) => (
                    <div className="border-line border-t pt-4" key={src.id}>
                      <div className="text-ink-muted text-sm">{src.kicker}</div>
                      <img
                        alt={src.name}
                        className="mt-2 h-8 w-auto mix-blend-multiply"
                        height={32}
                        src={src.logo}
                        width={100}
                      />
                      <div className="t-figure-sm tabular mt-4">
                        {fmtMoney(src.value)}
                      </div>
                    </div>
                  ))}
              </div>
              {opt("value", "condition") === true ? (
                <div className="mt-10 rounded-3xl bg-surface p-7">
                  <SellForPanel sources={property.sources} />
                </div>
              ) : null}
            </div>
          ) : null}

          {s.id === "equity" ? (
            <div
              className={`grid gap-10 bg-dark px-8 py-12 text-canvas ${phone ? "grid-cols-1" : "grid-cols-2"}`}
            >
              <div>
                <h3 className="t-h2">{text(s, "heading")}</h3>
                <div className="t-figure-sm mt-6">{fmtMoney(equityValue)}</div>
                <p className="mt-3 text-canvas/70 text-sm">
                  After {commission}% selling costs, you'd walk away with about{" "}
                  {fmtMoney(proceeds, true)}.
                </p>
              </div>
              {opt("equity", "slider") === true ? (
                <div className="rounded-3xl bg-canvas/8 p-6">
                  <div className="t-h3">If you sold today</div>
                  <div className="mt-6 h-2 rounded-full bg-canvas/25">
                    <div className="h-2 w-1/2 rounded-full bg-brand-ink/70" />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {s.id === "buyers" ? (
            <div className="px-8 py-12">
              <h3 className="t-h2 max-w-[20ch]">{text(s, "heading")}</h3>
              <p className="t-lead mt-3 max-w-[60ch] text-ink-muted">
                {text(s, "lead")}
              </p>
              <div
                className={`mt-8 grid gap-10 ${phone ? "grid-cols-1" : "grid-cols-[1fr_1.2fr]"}`}
              >
                <HBars emphasizeLast rows={buyers.funnel} share />
                <ul className="divide-y divide-line border-line border-y">
                  {buyers.featured
                    .slice(0, num("buyers", "featured", 3))
                    .map((b) => (
                      <li
                        className="flex items-center gap-3 py-3"
                        key={b.initials}
                      >
                        <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand text-xs">
                          {b.initials}
                        </span>
                        <div className="text-sm">
                          <div className="font-medium">{b.from}</div>
                          <div className="text-ink-muted">{b.budget}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
              {opt("buyers", "demand") === true ? (
                <div
                  className={`mt-10 grid gap-8 ${phone ? "grid-cols-1" : "grid-cols-3"}`}
                >
                  <div className="border-line border-t pt-4">
                    <HBars dense emphasizeMatch rows={buyers.demand.price} />
                  </div>
                  <div className="border-line border-t pt-4">
                    <HBars dense emphasizeMatch rows={buyers.demand.beds} />
                  </div>
                  <div className="border-line border-t pt-4">
                    <HBars dense emphasizeMatch rows={buyers.demand.area} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {s.id === "market" ? (
            <div className="bg-surface px-8 py-12">
              <h3 className="t-h2">{text(s, "heading")}</h3>
              <div
                className={`mt-8 grid gap-6 border-line border-t pt-6 ${phone ? "grid-cols-2" : "grid-cols-6"}`}
              >
                {[
                  ["Median sale price", fmtMoney(market.medianSale, true)],
                  ["Homes sold", fmtNum(market.sold12mo)],
                  ["For sale now", fmtNum(market.active)],
                  ["Months of supply", market.monthsSupply.toFixed(1)],
                  ["Days on market", fmtNum(market.daysOnMarket)],
                  showPpsf
                    ? ["Price per sq ft", "$486"]
                    : ["Sale to list", `${market.saleToList}%`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-ink-muted text-sm">{label}</div>
                    <div className="tabular mt-1 font-semibold text-2xl">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-canvas p-5">
                <ColumnChart
                  data={market.monthlySales}
                  labels={months12}
                  title="Homes sold per month"
                />
              </div>
            </div>
          ) : null}

          {s.id === "comps" ? (
            <div className="px-8 py-12">
              <h3 className="t-h2">{text(s, "heading")}</h3>
              <p className="t-lead mt-3 max-w-[60ch] text-ink-muted">
                {text(s, "lead").replace(
                  "half a mile",
                  `${num("comps", "radius", 0.5)} miles`
                )}
              </p>
              <div
                className={`mt-8 grid gap-8 ${opt("comps", "map") === true && !phone ? "grid-cols-[1.1fr_1fr]" : ""}`}
              >
                {opt("comps", "map") === true ? (
                  <CompsMap
                    active={null}
                    comps={comps}
                    onSelect={() => undefined}
                    subjectLabel={property.line1}
                  />
                ) : null}
                <ol className="divide-y divide-line border-line border-y">
                  {comps.slice(0, num("comps", "count", 4)).map((c) => (
                    <li
                      className="flex items-center gap-3 py-3"
                      key={c.address}
                    >
                      <img
                        alt=""
                        className="size-12 rounded-xl object-cover"
                        height={48}
                        src={c.photo}
                        width={48}
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{c.address}</div>
                        <div className="text-ink-muted">
                          {c.beds} bd · {c.baths} ba · {c.distance} mi
                        </div>
                      </div>
                      <div className="tabular font-semibold">
                        {fmtMoney(c.price)}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}

          {s.id === "facts" ? (
            <div className="px-8 py-12">
              <h3 className="t-h2">{text(s, "heading")}</h3>
              <dl className="mt-6 max-w-lg divide-y divide-line border-line border-y">
                {factRows.slice(0, num("facts", "rows", 6)).map(([k, v]) => (
                  <div className="flex justify-between py-2 text-sm" key={k}>
                    <dt className="text-ink-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <span className="btn btn-ghost btn-md mt-4 rounded-full">
                Show all 13 facts
              </span>
            </div>
          ) : null}

          {s.id === "updates" ? (
            <div className="bg-brand">
              <WatchHome
                addressLine1={property.line1}
                addressLine2={property.line2}
                daysOnMarket={market.daysOnMarket}
                monthDelta={6000}
                newBuyers={3}
                newSales={2}
                value={estimate.value}
              />
            </div>
          ) : null}

          {s.id === "agent" ? (
            <div
              className={`grid gap-10 px-8 py-12 ${phone ? "grid-cols-1" : "grid-cols-[1fr_1.2fr]"}`}
            >
              <div>
                <img
                  alt=""
                  className="size-16 rounded-full object-cover"
                  height={64}
                  src={tenant.agent.photo}
                  width={64}
                />
                <h3 className="t-h2 mt-5">{text(s, "heading")}</h3>
                <p className="mt-3 text-ink-muted text-sm">
                  Leads assigned by{" "}
                  {String(
                    opt("agent", "assign") ?? "office default"
                  ).toLowerCase()}
                  .
                </p>
              </div>
              <div className="rounded-3xl border border-line p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="field" />
                  <div className="field" />
                  <div className="field col-span-2" />
                </div>
                {opt("agent", "timeline") === true ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {timelines.map((t, i) => (
                      <span
                        className={`rounded-full px-3 py-1.5 text-sm ring-1 ${i === 1 ? "bg-ink text-canvas ring-ink" : "ring-line"}`}
                        key={t}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                <span className="btn btn-brand btn-pill mt-5">
                  Talk to {firstName}
                </span>
              </div>
            </div>
          ) : null}

          {s.id === "lender" ? (
            <div className="bg-surface px-8 py-10">
              <h3 className="t-h3">{text(s, "heading")}</h3>
              <p className="mt-1 text-ink-muted text-sm">
                Co-branded block · NMLS {String(opt("lender", "nmls") ?? "")}.
                Rates shown are illustrative.
              </p>
            </div>
          ) : null}

          {s.id === "compliance" ? (
            <div className="px-8 py-6 text-ink-muted text-xs">
              {tenant.mlsDisclaimer}
            </div>
          ) : null}
        </div>
      ))}

      {placement === "embed" ? null : (
        <div className="border-line border-t px-8 py-8">
          <div
            className="grid gap-8 text-sm"
            style={{
              gridTemplateColumns: phone
                ? "1fr"
                : `repeat(${footer.length}, minmax(0, 1fr))`,
            }}
          >
            {footer.map((col) => (
              <div className="space-y-5" key={col.id}>
                {col.blocks.map((id) => (
                  <FooterBlockView brandMark={brandMark} id={id} key={id} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (placement !== "embed") {
    return body;
  }

  return (
    <div
      className="bg-[oklch(0.96_0_0)] text-[oklch(0.25_0_0)]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <div className="flex items-center justify-between border-[oklch(0.88_0_0)] border-b bg-white px-8 py-4">
        <span className="font-semibold text-lg">harborvale.com</span>
        <span className="text-sm">Buy · Sell · Agents · About</span>
      </div>
      <div className="px-8 py-10">
        <h2 className="text-3xl">Sell your home with Harbor &amp; Vale</h2>
        <p className="mt-2 max-w-xl text-[oklch(0.45_0_0)]">
          The brokerage's own page, in its own typeface. The Home Report embed
          sits below, wearing the brokerage theme.
        </p>
      </div>
      <div className="relative mx-6 mb-10 rounded-2xl outline-dashed outline-2 outline-brand/40">
        <span className="absolute top-3 right-3 z-10 rounded-full bg-brand px-2 py-0.5 text-[0.6875rem] text-brand-ink">
          Embed · data-mode="inline"
        </span>
        <div className="overflow-hidden rounded-2xl">{body}</div>
      </div>
      <div className="border-[oklch(0.88_0_0)] border-t bg-white px-8 py-6 text-[oklch(0.45_0_0)] text-sm">
        © 2026 Harbor &amp; Vale · The brokerage's own footer
      </div>
    </div>
  );
}

/* ---------- Footer editor ---------- */

interface DragRef {
  block: FooterBlockId;
  col: string;
}

function FooterEditor({
  columns,
  onChange,
}: {
  columns: FooterColumn[];
  onChange: (next: FooterColumn[]) => void;
}) {
  const [drag, setDrag] = useState<DragRef | null>(null);
  const used = new Set(columns.flatMap((c) => c.blocks));
  const unused = (Object.keys(footerCatalog) as FooterBlockId[]).filter(
    (id) => !used.has(id)
  );

  const withoutBlock = (cols: FooterColumn[], block: FooterBlockId) =>
    cols.map((c) => ({ ...c, blocks: c.blocks.filter((b) => b !== block) }));

  const placeBlock = (
    block: FooterBlockId,
    colId: string,
    index: number | null
  ) => {
    const cleared = withoutBlock(columns, block);
    onChange(
      cleared.map((c) => {
        if (c.id !== colId) {
          return c;
        }
        const blocks = [...c.blocks];
        blocks.splice(index ?? blocks.length, 0, block);
        return { ...c, blocks };
      })
    );
  };

  const moveColumn = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= columns.length) {
      return;
    }
    const next = [...columns];
    const [col] = next.splice(index, 1);
    if (col) {
      next.splice(to, 0, col);
    }
    onChange(next);
  };

  const moveBlock = (colIndex: number, blockIndex: number, dir: -1 | 1) => {
    const col = columns[colIndex];
    const block = col?.blocks[blockIndex];
    if (!(col && block)) {
      return;
    }
    const target = blockIndex + dir;
    if (target >= 0 && target < col.blocks.length) {
      placeBlock(block, col.id, target > blockIndex ? target + 1 : target);
      return;
    }
    const nextCol = columns[colIndex + dir];
    if (nextCol) {
      placeBlock(block, nextCol.id, dir === 1 ? 0 : null);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-sm">Footer layout</span>
        <button
          className="c-label hover:text-ink disabled:opacity-40"
          disabled={columns.length >= MAX_FOOTER_COLUMNS}
          onClick={() =>
            onChange([...columns, { blocks: [], id: `c${Date.now()}` }])
          }
          type="button"
        >
          + Add column
        </button>
      </div>
      <p className="c-label mb-3">
        Drag blocks between columns or use the arrows. Locked blocks can move
        but not be removed.
      </p>
      <div className="space-y-2">
        {columns.map((col, ci) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: drop target for dragged blocks; every action is also reachable through the arrow buttons
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: same drop target
          <div
            className={`rounded-[12px] border p-2.5 transition-colors ${
              drag ? "border-brand/50 border-dashed" : "border-line"
            }`}
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (drag) {
                placeBlock(drag.block, col.id, null);
                setDrag(null);
              }
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="c-label font-medium">Column {ci + 1}</span>
              <span className="flex items-center gap-0.5">
                <button
                  aria-label={`Move column ${ci + 1} left`}
                  className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                  disabled={ci === 0}
                  onClick={() => moveColumn(ci, -1)}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                </button>
                <button
                  aria-label={`Move column ${ci + 1} right`}
                  className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                  disabled={ci === columns.length - 1}
                  onClick={() => moveColumn(ci, 1)}
                  type="button"
                >
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </button>
                {col.blocks.length === 0 && columns.length > 1 ? (
                  <button
                    aria-label={`Remove column ${ci + 1}`}
                    className="ml-1 rounded p-0.5 text-ink-muted hover:text-bad"
                    onClick={() =>
                      onChange(columns.filter((c) => c.id !== col.id))
                    }
                    type="button"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                ) : null}
              </span>
            </div>
            <ul className="space-y-1">
              {col.blocks.length === 0 ? (
                <li className="c-label rounded-[8px] border border-line border-dashed px-2 py-2 text-center">
                  Drop a block here
                </li>
              ) : null}
              {col.blocks.map((block, bi) => {
                const meta = footerCatalog[block];
                return (
                  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag handlers move the block; the arrow buttons provide the keyboard path
                  <li
                    className={`flex items-center gap-1.5 rounded-[8px] bg-surface px-2 py-1.5 text-sm ${
                      drag?.block === block ? "opacity-40" : ""
                    }`}
                    draggable
                    key={block}
                    onDragEnd={() => setDrag(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragStart={() => setDrag({ block, col: col.id })}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (drag && drag.block !== block) {
                        placeBlock(drag.block, col.id, bi);
                        setDrag(null);
                      }
                    }}
                  >
                    <GripVertical
                      aria-hidden="true"
                      className="size-4 shrink-0 cursor-grab text-ink-muted"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {meta.label}
                    </span>
                    <button
                      aria-label={`Move ${meta.label} up`}
                      className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                      disabled={bi === 0 && ci === 0}
                      onClick={() => moveBlock(ci, bi, -1)}
                      type="button"
                    >
                      <ChevronUp aria-hidden="true" className="size-3.5" />
                    </button>
                    <button
                      aria-label={`Move ${meta.label} down`}
                      className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                      disabled={
                        bi === col.blocks.length - 1 &&
                        ci === columns.length - 1
                      }
                      onClick={() => moveBlock(ci, bi, 1)}
                      type="button"
                    >
                      <ChevronDown aria-hidden="true" className="size-3.5" />
                    </button>
                    {meta.locked ? (
                      <Lock
                        aria-hidden="true"
                        className="ml-1 size-3.5 text-ink-muted"
                      />
                    ) : (
                      <button
                        aria-label={`Remove ${meta.label}`}
                        className="ml-1 rounded p-0.5 text-ink-muted hover:text-bad"
                        onClick={() => onChange(withoutBlock(columns, block))}
                        type="button"
                      >
                        <X aria-hidden="true" className="size-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {unused.length > 0 ? (
              <select
                aria-label={`Add a block to column ${ci + 1}`}
                className="field mt-1.5 h-8 appearance-none text-ink-muted text-xs"
                onChange={(e) => {
                  const block = e.target.value as FooterBlockId | "";
                  if (block) {
                    placeBlock(block, col.id, null);
                  }
                  e.target.value = "";
                }}
                value=""
              >
                <option value="">+ Add block</option>
                {unused.map((id) => (
                  <option key={id} value={id}>
                    {footerCatalog[id].label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterBlockView({
  id,
  brandMark,
}: {
  id: FooterBlockId;
  brandMark: React.ReactNode;
}) {
  const { tenant } = useTenant();
  switch (id) {
    case "brand":
      return (
        <div>
          {brandMark}
          <p className="mt-2 text-ink-muted">{tenant.tagline}</p>
        </div>
      );
    case "links":
      return (
        <ul className="space-y-1 text-ink-muted">
          <li>Home value</li>
          <li>Sell with us</li>
          <li>Find a home</li>
        </ul>
      );
    case "agent":
      return (
        <div className="flex items-center gap-2">
          <img
            alt=""
            className="size-8 rounded-full object-cover"
            height={32}
            src={tenant.agent.photo}
            width={32}
          />
          <div>
            <div className="font-medium">{tenant.agent.name}</div>
            <div className="text-ink-muted">{tenant.agent.title}</div>
          </div>
        </div>
      );
    case "legal":
      return <p className="text-ink-muted text-xs">{tenant.mlsDisclaimer}</p>;
    case "social":
      return (
        <div className="text-ink-muted">Instagram · Facebook · LinkedIn</div>
      );
    case "powered":
      return <div className="text-ink-muted">Powered by Reliance</div>;
    case "contact":
      return (
        <div className="text-ink-muted">
          <div className="font-medium text-ink">{tenant.legalName}</div>
          <div>
            {tenant.city}, {tenant.state}
          </div>
          <div>{tenant.phone}</div>
        </div>
      );
    case "badges":
      return (
        <div className="text-ink-muted text-xs">
          Equal Housing Opportunity · REALTOR®
        </div>
      );
    case "text":
      return (
        <p className="text-ink-muted">
          Serving {tenant.city} since 1998. Licensed in {tenant.state}.
        </p>
      );
    case "apps":
      return (
        <div className="flex gap-2">
          <span className="rounded-md bg-ink px-2 py-1 text-canvas text-xs">
            App Store
          </span>
          <span className="rounded-md bg-ink px-2 py-1 text-canvas text-xs">
            Google Play
          </span>
        </div>
      );
    default:
      return null;
  }
}

/* ---------- Header editor ---------- */

function HeaderEditor({
  blocks,
  onChange,
  sticky,
  onSticky,
}: {
  blocks: HeaderBlock[];
  onChange: (next: HeaderBlock[]) => void;
  sticky: boolean;
  onSticky: (v: boolean) => void;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 1 || to >= blocks.length) {
      return;
    }
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    if (item) {
      next.splice(to, 0, item);
    }
    onChange(next);
  };
  return (
    <div className="mb-6">
      <span className="mb-1.5 block font-medium text-sm">Header</span>
      <p className="c-label mb-2">
        Logo stays first. Everything else can be turned off or reordered, left
        to right.
      </p>
      <ul className="divide-y divide-line">
        {blocks.map((b, i) => {
          const meta = headerCatalog[b.id];
          return (
            <li className="flex items-center gap-2 py-2 text-sm" key={b.id}>
              <span className="min-w-0 flex-1">
                <span className="block">{meta.label}</span>
                {meta.hint ? (
                  <span className="c-label block">{meta.hint}</span>
                ) : null}
              </span>
              {meta.locked ? null : (
                <>
                  <button
                    aria-label={`Move ${meta.label} left`}
                    className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                    disabled={i <= 1}
                    onClick={() => move(i, -1)}
                    type="button"
                  >
                    <ChevronUp aria-hidden="true" className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Move ${meta.label} right`}
                    className="rounded p-0.5 text-ink-muted hover:text-ink disabled:opacity-30"
                    disabled={i === blocks.length - 1}
                    onClick={() => move(i, 1)}
                    type="button"
                  >
                    <ChevronDown aria-hidden="true" className="size-3.5" />
                  </button>
                </>
              )}
              {meta.locked ? (
                <Lock
                  aria-hidden="true"
                  className="ml-2 size-4 text-ink-muted"
                />
              ) : (
                <Switch
                  checked={b.on}
                  label={meta.label}
                  onChange={(v) =>
                    onChange(
                      blocks.map((x) => (x.id === b.id ? { ...x, on: v } : x))
                    )
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between rounded-[10px] bg-surface px-3 py-2.5 text-sm">
        <div>
          <div className="font-medium">Sticky header</div>
          <div className="c-label">
            Keeps the logo and the agent button in view while scrolling.
          </div>
        </div>
        <Switch checked={sticky} label="Sticky header" onChange={onSticky} />
      </div>
    </div>
  );
}

function HeaderBlockView({
  id,
  firstName,
  phone,
  placement,
}: {
  id: HeaderBlockId;
  firstName: string;
  phone: boolean;
  placement: Placement;
}) {
  const { tenant } = useTenant();
  switch (id) {
    case "links":
      return phone ? null : (
        <span className="flex items-center gap-4 pr-2 text-ink-muted text-sm">
          <span>Home value</span>
          <span>Sell</span>
          <span>Buy</span>
        </span>
      );
    case "search":
      return phone ? null : (
        <span className="flex h-9 w-56 items-center gap-2 rounded-full px-3 text-ink-muted text-sm ring-1 ring-line">
          Search another address
        </span>
      );
    case "phone":
      return phone ? null : (
        <span className="px-2 text-sm">{tenant.phone}</span>
      );
    case "talk":
      return (
        <span className="btn btn-ghost btn-sm rounded-full">
          Talk to {placement === "agent" ? firstName : "an agent"}
        </span>
      );
    default:
      return null;
  }
}
