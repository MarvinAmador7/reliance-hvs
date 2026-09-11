/*
  Static, realistic-looking data for the design preview.
  Nothing here is fetched; every number exists to make the design read as real.
*/

const TRAILING_ZEROS = /\.?0+$/;

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photos = {
  comps: [
    unsplash("1580587771525-78b9dba3b914", 640),
    unsplash("1523217582562-09d0def993a6", 640),
    unsplash("1600566753190-17f0baa2a6c3", 640),
    unsplash("1605276374104-dee2a0ed3cd6", 640),
  ],
  story: unsplash("1568605114967-8130f3a36994", 2000),
  subject: unsplash("1564013799919-ab600027ffc6"),
} as const;

export const fmtMoney = (n: number, compact = false): string => {
  if (compact) {
    if (n >= 1_000_000) {
      return `$${(n / 1_000_000).toFixed(2).replace(TRAILING_ZEROS, "")}M`;
    }
    if (n >= 1000) {
      return `$${Math.round(n / 1000)}K`;
    }
  }
  return `$${n.toLocaleString("en-US")}`;
};

export const fmtNum = (n: number): string => n.toLocaleString("en-US");

export const searchSuggestions = [
  { line1: "2148 Bayshore Lane", line2: "Coconut Grove, FL 33133" },
  { line1: "2150 Bayshore Lane", line2: "Coconut Grove, FL 33133" },
  { line1: "2160 Bayshore Lane, Unit 4", line2: "Coconut Grove, FL 33133" },
  { line1: "214 Bay Heights Drive", line2: "Coconut Grove, FL 33133" },
  { line1: "2140 Tigertail Avenue", line2: "Miami, FL 33133" },
  { line1: "2100 Brickell Avenue", line2: "Miami, FL 33129" },
  { line1: "3010 Grand Avenue", line2: "Coconut Grove, FL 33133" },
  { line1: "4060 Ventura Avenue", line2: "Miami, FL 33133" },
] as const;

export const property = {
  buyers: {
    demand: {
      area: [
        { label: "Coconut Grove", match: true, value: 164 },
        { label: "Coral Gables", value: 111 },
        { label: "South Miami", value: 74 },
        { label: "Brickell", value: 41 },
        { label: "Pinecrest", value: 33 },
      ],
      beds: [
        { label: "1 to 2 bedrooms", value: 58 },
        { label: "3 bedrooms", value: 141 },
        { label: "4 bedrooms", match: true, value: 137 },
        { label: "5 or more", value: 76 },
      ],
      price: [
        { label: "Under $750K", value: 96 },
        { label: "$750K to $1M", value: 118 },
        { label: "$1M to $1.5M", match: true, value: 132 },
        { label: "$1.5M to $2M", value: 47 },
        { label: "Over $2M", value: 19 },
      ],
    },
    featured: [
      {
        beds: "4+ beds",
        budget: "$1.1M – $1.4M",
        from: "Relocating from Austin, TX",
        initials: "J.M.",
        preapproved: true,
        timeline: "Buying in the next 60 days",
      },
      {
        beds: "3–4 beds, pool",
        budget: "$1.2M – $1.5M",
        from: "Moving within Coconut Grove",
        initials: "R.&A.",
        preapproved: true,
        timeline: "Actively touring",
      },
      {
        beds: "4 beds",
        budget: "$1.0M – $1.3M",
        from: "Relocating from New York, NY",
        initials: "S.K.",
        preapproved: false,
        timeline: "Buying in 3–6 months",
      },
    ],
    funnel: [
      { label: "Active buyers within 5 miles", value: 412 },
      { label: "Looking for 4+ bedrooms", value: 184 },
      { label: "Budget covers this home", value: 63 },
      { label: "Match this home", value: 27 },
    ],
    matched: 27,
  },
  comps: [
    {
      address: "2214 Bayshore Lane",
      baths: 3,
      beds: 4,
      date: "Aug 2026",
      distance: 0.1,
      dx: 62,
      dy: 38,
      photo: photos.comps[0],
      price: 1_310_000,
      sqft: 2710,
    },
    {
      address: "3118 Matilda Street",
      baths: 2.5,
      beds: 4,
      date: "Jul 2026",
      distance: 0.3,
      dx: 28,
      dy: 60,
      photo: photos.comps[1],
      price: 1_245_000,
      sqft: 2480,
    },
    {
      address: "2035 Secoffee Street",
      baths: 3,
      beds: 5,
      date: "Jun 2026",
      distance: 0.4,
      dx: 78,
      dy: 70,
      photo: photos.comps[2],
      price: 1_395_000,
      sqft: 2920,
    },
    {
      address: "2290 Tigertail Avenue",
      baths: 3,
      beds: 3,
      date: "May 2026",
      distance: 0.4,
      dx: 40,
      dy: 22,
      photo: photos.comps[3],
      price: 1_180_000,
      sqft: 2390,
    },
  ],
  equity: {
    commissionPct: 6,
    loanDate: "Jun 2016",
    mortgageBalance: 486_000,
    originalLoan: 594_000,
    rate: 3.75,
  },
  estimate: {
    confidence: "High" as const,
    high: 1_358_000,
    low: 1_212_000,
    value: 1_284_000,
  },
  facts: {
    baths: 3,
    beds: 4,
    cooling: "Central A/C",
    garage: "2-car attached",
    lastSale: { date: "Jun 2016", price: 742_000 },
    lotSqft: 9148,
    parcel: "01-4121-016-0210",
    pool: "In-ground",
    roof: "Concrete tile (2019)",
    sqft: 2640,
    stories: 2,
    taxes: 11_820,
    type: "Single family",
    yearBuilt: 1962,
  },
  history: [
    {
      date: "Sep 2026",
      label: "Estimated value (3 sources)",
      value: "$1,284,000",
    },
    { date: "Jan 2026", label: "Assessed value (county)", value: "$1,036,400" },
    { date: "Nov 2025", label: "Property tax paid", value: "$11,820" },
    { date: "Mar 2019", label: "Permit: roof replacement", value: "Closed" },
    { date: "Jun 2016", label: "Sold", value: "$742,000" },
    { date: "Apr 2016", label: "Listed", value: "$765,000" },
    { date: "Aug 2004", label: "Sold", value: "$418,000" },
  ],
  line1: "2148 Bayshore Lane",
  line2: "Coconut Grove, FL 33133",
  market: {
    active: 61,
    daysOnMarket: 38,
    medianSale: 1_190_000,
    monthlyMedian: [
      1120, 1135, 1150, 1142, 1168, 1175, 1190, 1182, 1195, 1201, 1188, 1190,
    ].map((k) => k * 1000),
    monthlySales: [9, 11, 13, 12, 15, 14, 16, 13, 12, 11, 10, 12],
    monthsSupply: 4.9,
    saleToList: 97.2,
    sold12mo: 148,
  },
  neighborhood: "Coconut Grove",
  photo: photos.subject,
  sources: [
    {
      high: 1_332_000,
      id: "attom",
      kicker: "Powered by",
      logo: "/logos/attom.jpg",
      low: 1_150_000,
      name: "ATTOM",
      note: "Nationwide AVM built on public records and MLS data.",
      value: 1_241_000,
    },
    {
      high: 1_358_000,
      id: "public-data",
      kicker: "Powered by",
      logo: "/logos/public-data.png",
      low: 1_212_000,
      name: "Public Data",
      note: "County assessor value, permits, and recorded sales.",
      value: 1_284_000,
    },
    {
      high: 1_331_800,
      id: "zillow",
      kicker: "Zestimate from",
      logo: "/logos/zillow.png",
      low: 1_205_000,
      name: "Zillow",
      note: "Zestimate, refreshed weekly from listings and sales.",
      value: 1_268_400,
    },
  ],
  valueHistory: [
    1118, 1124, 1131, 1139, 1142, 1150, 1161, 1169, 1172, 1180, 1191, 1198,
    1204, 1209, 1221, 1230, 1236, 1241, 1252, 1258, 1266, 1271, 1279, 1284,
  ].map((k) => k * 1000),
} as const;

export const months12 = [
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
];

/* ---------- Console ---------- */

const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49_297) % 233_280;
    return s / 233_280;
  };
};

const rnd = seeded(7);

export const daily = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const weekend = day % 7 === 0 || day % 7 === 6;
  const base = weekend ? 92 : 132;
  const reports = Math.round(base + rnd() * 40 + i * 1.4);
  const leads = Math.round(reports * (0.105 + rnd() * 0.04));
  return { day, leads, reports };
});

export const kpis = [
  {
    delta: "+8.2%",
    label: "Visitors",
    trend: daily.map((d) => d.reports * 3.1),
    up: true,
    value: "12,480",
  },
  {
    delta: "+11.4%",
    label: "Reports generated",
    trend: daily.map((d) => d.reports),
    up: true,
    value: "3,912",
  },
  {
    delta: "+14.9%",
    label: "Leads captured",
    trend: daily.map((d) => d.leads),
    up: true,
    value: "486",
  },
  {
    delta: "+0.4 pt",
    label: "Report to lead",
    trend: daily.map((d) => d.leads / d.reports),
    up: true,
    value: "12.4%",
  },
  {
    delta: "−2.1%",
    label: "Buyer matches shown",
    trend: daily.map((d) => d.reports * 0.7),
    up: false,
    value: "2,731",
  },
] as const;

export const funnel = [
  { label: "Visited", value: 12_480 },
  { label: "Started a search", value: 7112 },
  { label: "Selected an address", value: 3912 },
  { label: "Read past the value", value: 2804 },
  { label: "Engaged (equity or buyers)", value: 1390 },
  { label: "Became a lead", value: 486 },
] as const;

export const channels = [
  { label: "Hosted site", note: "gethomevalue.harborvale.com", value: 2268 },
  { label: "Website embed", note: "harborvale.com/sell", value: 1135 },
  { label: "Agent pages", note: "42 agent microsites", value: 509 },
] as const;

export const sources = [
  { label: "Direct mail QR", value: 1312 },
  { label: "Meta ads", value: 1018 },
  { label: "Organic search", value: 743 },
  { label: "Email", value: 512 },
  { label: "Direct", value: 327 },
] as const;

export const topAreas = [
  {
    leads: 121,
    matches: 640,
    name: "Coconut Grove",
    reports: 812,
    zip: "33133",
  },
  { leads: 79, matches: 412, name: "South Miami", reports: 574, zip: "33143" },
  { leads: 61, matches: 377, name: "Pinecrest", reports: 498, zip: "33156" },
  { leads: 52, matches: 350, name: "Coral Gables", reports: 461, zip: "33146" },
  { leads: 31, matches: 201, name: "Brickell", reports: 388, zip: "33129" },
  {
    leads: 142,
    matches: 751,
    name: "Out of area",
    reports: 1179,
    zip: "Other",
  },
] as const;

export const intent = [
  { label: "Within 3 months", value: 94 },
  { label: "3 to 6 months", value: 138 },
  { label: "6 to 12 months", value: 112 },
  { label: "Just curious", value: 142 },
] as const;

export type LeadStatus = "New" | "Contacted" | "Synced";

export interface Lead {
  address: string;
  agent: string;
  area: string;
  channel: string;
  device: string;
  email: string;
  events: { t: string; label: string }[];
  id: string;
  intent: string;
  name: string;
  phone: string;
  source: string;
  status: LeadStatus;
  value: number;
  when: string;
}

export const leads: Lead[] = [
  {
    address: "2148 Bayshore Ln, Coconut Grove",
    agent: "Dana Whitfield",
    area: "33133",
    channel: "Hosted site",
    device: "iPhone · Safari",
    email: "elena.marsh@example.com",
    events: [
      {
        label: "Opened from postcard QR (utm_campaign=grove-fall)",
        t: "10:41",
      },
      { label: "Selected 2148 Bayshore Ln", t: "10:41" },
      { label: "Viewed value, equity, buyers", t: "10:42" },
      { label: "Used the sale-price slider (3 times)", t: "10:44" },
      {
        label: "Requested agent consult · selling within 3 months",
        t: "10:45",
      },
    ],
    id: "L-4821",
    intent: "Within 3 months",
    name: "Elena Marsh",
    phone: "(305) 555-0171",
    source: "Direct mail QR",
    status: "New",
    value: 1_284_000,
    when: "12 min ago",
  },
  {
    address: "5910 SW 84th St, South Miami",
    agent: "Unassigned",
    area: "33143",
    channel: "Website embed",
    device: "Android · Chrome",
    email: "t.reyes@example.com",
    events: [
      { label: "Arrived from Meta ad (utm_source=facebook)", t: "10:12" },
      { label: "Selected 5910 SW 84th St", t: "10:13" },
      { label: "Unlocked buyer matches with email", t: "10:15" },
    ],
    id: "L-4820",
    intent: "Just curious",
    name: "Tomás Reyes",
    phone: "(786) 555-0114",
    source: "Meta ads",
    status: "New",
    value: 918_000,
    when: "38 min ago",
  },
  {
    address: "7420 SW 128th St, Pinecrest",
    agent: "Luis Ferrer",
    area: "33156",
    channel: "Hosted site",
    device: "Mac · Chrome",
    email: "priya.anand@example.com",
    events: [
      { label: "Arrived from Google (organic)", t: "08:30" },
      { label: "Selected 7420 SW 128th St", t: "08:31" },
      {
        label: "Claimed the home · adjusted condition to Excellent",
        t: "08:36",
      },
      { label: "Subscribed to monthly updates", t: "08:37" },
    ],
    id: "L-4819",
    intent: "6 to 12 months",
    name: "Priya Anand",
    phone: "(305) 555-0139",
    source: "Organic search",
    status: "Contacted",
    value: 2_140_000,
    when: "2 h ago",
  },
  {
    address: "1220 Andora Ave, Coral Gables",
    agent: "Dana Whitfield",
    area: "33146",
    channel: "Agent pages",
    device: "iPad · Safari",
    email: "marcus.lee@example.com",
    events: [
      { label: "Returned from monthly update email", t: "17:02" },
      { label: "Viewed buyers section · 19 matches", t: "17:04" },
      {
        label: "Requested agent consult · selling in 3 to 6 months",
        t: "17:06",
      },
      { label: "Pushed to CRM", t: "17:06" },
    ],
    id: "L-4818",
    intent: "3 to 6 months",
    name: "Marcus Lee",
    phone: "(305) 555-0186",
    source: "Email",
    status: "Synced",
    value: 1_560_000,
    when: "Yesterday",
  },
  {
    address: "1450 Brickell Ave, Unit 2204",
    agent: "Unassigned",
    area: "33129",
    channel: "Hosted site",
    device: "iPhone · Safari",
    email: "g.okafor@example.com",
    events: [
      { label: "Typed the address directly", t: "12:20" },
      { label: "Selected 1450 Brickell Ave, Unit 2204", t: "12:21" },
      { label: "Subscribed to monthly updates", t: "12:23" },
    ],
    id: "L-4817",
    intent: "Just curious",
    name: "Grace Okafor",
    phone: "(786) 555-0160",
    source: "Direct",
    status: "Synced",
    value: 890_000,
    when: "Yesterday",
  },
  {
    address: "3480 Poinciana Ave, Coconut Grove",
    agent: "Luis Ferrer",
    area: "33133",
    channel: "Hosted site",
    device: "Windows · Edge",
    email: "d.whitaker@example.com",
    events: [
      { label: "Opened from postcard QR", t: "19:48" },
      { label: "Selected 3480 Poinciana Ave", t: "19:49" },
      { label: "Claimed the home · signed in with Apple", t: "19:51" },
      {
        label: "Requested agent consult · selling within 3 months",
        t: "19:53",
      },
    ],
    id: "L-4816",
    intent: "Within 3 months",
    name: "Daniel Whitaker",
    phone: "(305) 555-0102",
    source: "Direct mail QR",
    status: "Synced",
    value: 1_725_000,
    when: "2 days ago",
  },
];

export const sites = [
  {
    detail: "Custom domain · SSL active · Composable footer",
    kind: "Hosted site",
    leads: 301,
    name: "gethomevalue.harborvale.com",
    rate: "13.3%",
    reports: 2268,
    status: "Live",
  },
  {
    detail: "Inline widget · Sections: value, equity, buyers",
    kind: "Website embed",
    leads: 132,
    name: "harborvale.com/sell-your-home",
    rate: "11.6%",
    reports: 1135,
    status: "Live",
  },
  {
    detail: "harborvale.com/agents/*/home-value · Agent-branded",
    kind: "Agent pages",
    leads: 53,
    name: "42 agent microsites",
    rate: "10.4%",
    reports: 509,
    status: "Live",
  },
  {
    detail: "Modal widget · Draft, not yet published",
    kind: "Website embed",
    leads: 0,
    name: "Spring campaign landing page",
    rate: "—",
    reports: 0,
    status: "Draft",
  },
] as const;

export interface SectionConfig {
  id: string;
  name: string;
  required?: boolean;
  summary: string;
  visible: boolean;
}

export const defaultSections: SectionConfig[] = [
  {
    id: "hero",
    name: "Address & estimate",
    required: true,
    summary: "Value, range, and home facts",
    visible: true,
  },
  {
    id: "value",
    name: "How we got the number",
    summary: "Three sources and 24-month trend",
    visible: true,
  },
  {
    id: "equity",
    name: "Equity",
    summary: "Estimated equity and sale-proceeds slider",
    visible: true,
  },
  {
    id: "buyers",
    name: "Buyers looking",
    summary: "Buyer funnel, featured buyers, email unlock",
    visible: true,
  },
  {
    id: "market",
    name: "Market",
    summary: "Neighborhood stats, sales per month",
    visible: true,
  },
  {
    id: "comps",
    name: "Nearby sales",
    summary: "Map and comparable sales",
    visible: true,
  },
  {
    id: "facts",
    name: "Home facts",
    summary: "Public-record details, claim to edit",
    visible: true,
  },
  {
    id: "updates",
    name: "Monthly updates",
    summary: "Watch-this-home subscription",
    visible: true,
  },
  {
    id: "agent",
    name: "Talk to an agent",
    required: true,
    summary: "Agent card and consult form",
    visible: true,
  },
  {
    id: "lender",
    name: "Lender co-brand",
    summary: "Refinance options with partner lender",
    visible: false,
  },
  {
    id: "compliance",
    name: "MLS disclaimer",
    required: true,
    summary: "Required legal text",
    visible: true,
  },
];

export const invoices = [
  {
    amount: "$1,490.00",
    date: "Sep 1, 2026",
    id: "INV-2026-09",
    status: "Paid",
  },
  {
    amount: "$1,490.00",
    date: "Aug 1, 2026",
    id: "INV-2026-08",
    status: "Paid",
  },
  {
    amount: "$1,240.00",
    date: "Jul 1, 2026",
    id: "INV-2026-07",
    status: "Paid",
  },
  {
    amount: "$1,240.00",
    date: "Jun 1, 2026",
    id: "INV-2026-06",
    status: "Paid",
  },
] as const;

export const team = [
  {
    email: "maya@harborvale.com",
    initials: "MO",
    name: "Maya Ortiz",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    role: "Owner",
  },
  {
    email: "dana@harborvale.com",
    initials: "DW",
    name: "Dana Whitfield",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Agent",
  },
  {
    email: "luis@harborvale.com",
    initials: "LF",
    name: "Luis Ferrer",
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    role: "Agent",
  },
  {
    email: "sam@harborvale.com",
    initials: "SP",
    name: "Sam Patel",
    photo: "https://randomuser.me/api/portraits/men/22.jpg",
    role: "Admin",
  },
] as const;

/* Analytics catalog used in the design notes and the console. */
export const eventCatalog = [
  {
    event: "page_view",
    feeds: "Visitors, source mix",
    props: "site, channel, referrer, utm_*, device, geo",
    where: "Both pages",
  },
  {
    event: "search_started",
    feeds: "Search engagement",
    props: "characters typed, time to first result",
    where: "Search",
  },
  {
    event: "address_selected",
    feeds: "Valuation attempts",
    props: "address, ZIP, suggestion rank",
    where: "Search",
  },
  {
    event: "report_viewed",
    feeds: "Reports generated, top areas, out-of-area",
    props: "estimate, range, sources",
    where: "Report",
  },
  {
    event: "section_viewed",
    feeds: "Where readers stop",
    props: "section id, dwell time",
    where: "Report",
  },
  {
    event: "condition_adjusted",
    feeds: "Owner intent",
    props: "before, after",
    where: "Report · Value",
  },
  {
    event: "sale_price_adjusted",
    feeds: "Seller intent score",
    props: "price chosen, times moved",
    where: "Report · Equity",
  },
  {
    event: "buyers_cta_clicked",
    feeds: "Buyer-match interest",
    props: "matches shown",
    where: "Report · Buyers",
  },
  {
    event: "comp_viewed",
    feeds: "Which comps get attention",
    props: "comp address",
    where: "Report · Nearby sales",
  },
  {
    event: "claim_started",
    feeds: "Owner funnel, top",
    props: "what triggered it",
    where: "Report",
  },
  {
    event: "claim_identity_verified",
    feeds: "Which sign-in owners use",
    props: "provider (Google, Apple, Facebook)",
    where: "Report",
  },
  {
    event: "claim_verified",
    feeds: "Owner leads",
    props: "address",
    where: "Report",
  },
  {
    event: "claim_dismissed",
    feeds: "Where the claim flow leaks",
    props: "step abandoned",
    where: "Report",
  },
  {
    event: "updates_subscribed",
    feeds: "Monthly report subscribers",
    props: "name, email",
    where: "Report · Updates",
  },
  {
    event: "selling_timeline_selected",
    feeds: "Intent mix",
    props: "timeline",
    where: "Report · Agent",
  },
  {
    event: "consult_requested",
    feeds: "Agent leads",
    props: "contact, timeline, message",
    where: "Report · Agent",
  },
  {
    event: "cta_clicked",
    feeds: "What pulls people to the agent",
    props: "which button",
    where: "Both pages",
  },
  {
    event: "agent_call_clicked",
    feeds: "Call intent",
    props: "agent",
    where: "Both pages",
  },
  {
    event: "return_visit",
    feeds: "Nurture effectiveness",
    props: "days since first visit, via email link",
    where: "Both pages",
  },
  {
    event: "lead_synced",
    feeds: "Routing health",
    props: "CRM, agent assigned, latency",
    where: "Server",
  },
] as const;
