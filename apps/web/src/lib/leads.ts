import { type Lead, leads, photos } from "@/lib/mock-data";

/** Console-side enrichment of each lead: intent signals, homes viewed, claim and watch state, team actions. */
export type LeadType = "Consult" | "Watch" | "Claimed" | "Buyers";

export interface AgentAction {
  by: string;
  kind: "note" | "call" | "email" | "system";
  label: string;
  t: string;
}

export interface Claim {
  at: string;
  edits: string[];
  ownedSince: number;
  provider: "Google" | "Apple" | "Facebook";
}

export interface ViewedHome {
  address: string;
  area: string;
  value: number;
  views: number;
  when: string;
}

export interface Watch {
  lastOpened?: string;
  next: string;
  opened: number;
  sent: number;
  since: string;
}

export interface Contact {
  bestTime?: string;
  consent: string;
  prefers: "Call" | "Text" | "Email";
}

export interface Signal {
  label: string;
  points: number;
}

export interface Extra {
  actions: AgentAction[];
  claim?: Claim;
  contact: Contact;
  crm: { status: "Synced" | "Pending" | "Not sent"; id?: string };
  equity: number;
  homes?: ViewedHome[];
  nextStep: string;
  photo: string;
  score: number;
  signals: Signal[];
  type: LeadType;
  watch?: Watch;
}

const fallbackExtra: Extra = {
  actions: [],
  contact: { consent: "Not recorded", prefers: "Email" },
  crm: { status: "Not sent" },
  equity: 0,
  nextStep: "Assign an agent.",
  photo: photos.comps[3],
  score: 20,
  signals: [],
  type: "Watch",
};

export const extras: Record<string, Extra> = {
  "L-4816": {
    actions: [
      {
        by: "System",
        kind: "system",
        label: "Pushed to CRM",
        t: "Sep 8, 7:54 pm",
      },
      {
        by: "Luis Ferrer",
        kind: "call",
        label: "Called, left voicemail",
        t: "Sep 9, 9:10 am",
      },
      {
        by: "Luis Ferrer",
        kind: "note",
        label:
          "Neighbor of a past client. Wants a CMA before listing in November.",
        t: "Sep 9, 9:12 am",
      },
    ],
    claim: {
      at: "Sep 9, 7:51 pm",
      edits: [],
      ownedSince: 2009,
      provider: "Apple",
    },
    contact: {
      bestTime: "Evenings after 6 pm",
      consent: "Agreed to be contacted · Sep 9",
      prefers: "Call",
    },
    crm: { id: "FUB-88104", status: "Synced" },
    equity: 1_725_000 - 610_000,
    nextStep: "Follow up on the voicemail; offer a Saturday visit.",
    photo: photos.comps[1],
    score: 88,
    signals: [
      { label: "Claimed the home", points: 22 },
      { label: "Selling within 3 months", points: 32 },
      { label: "Requested a visit", points: 24 },
      { label: "Returned twice this week", points: 10 },
    ],
    type: "Consult",
  },
  "L-4817": {
    actions: [
      {
        by: "System",
        kind: "system",
        label: "Pushed to CRM",
        t: "Sep 9, 12:24 pm",
      },
    ],
    contact: {
      consent: "Monthly updates only · Sep 9",
      prefers: "Email",
    },
    crm: { id: "FUB-88110", status: "Synced" },
    equity: 890_000 - 512_000,
    nextStep:
      "Low intent. Let the monthly update do the work; check back in 60 days.",
    photo: photos.comps[3],
    score: 24,
    signals: [
      { label: "Subscribed to monthly updates", points: 16 },
      { label: "Just curious", points: 8 },
    ],
    type: "Watch",
    watch: { next: "Oct 1", opened: 0, sent: 0, since: "Sep 9" },
  },
  "L-4818": {
    actions: [
      {
        by: "System",
        kind: "system",
        label: "Pushed to CRM",
        t: "Sep 9, 5:06 pm",
      },
      {
        by: "Dana Whitfield",
        kind: "email",
        label: "Sent the buyer list and a Coral Gables comp sheet",
        t: "Sep 9, 6:40 pm",
      },
    ],
    contact: {
      bestTime: "Weekdays before noon",
      consent: "Agreed to be contacted · Sep 9",
      prefers: "Text",
    },
    crm: { id: "FUB-88121", status: "Synced" },
    equity: 1_560_000 - 402_000,
    homes: [
      {
        address: "1315 Andora Ave, Coral Gables",
        area: "33146",
        value: 1_490_000,
        views: 2,
        when: "Yesterday",
      },
      {
        address: "1508 Cordova St, Coral Gables",
        area: "33146",
        value: 1_275_000,
        views: 1,
        when: "Yesterday",
      },
    ],
    nextStep: "Ask which of the 19 buyers they'd like introduced.",
    photo: photos.comps[0],
    score: 76,
    signals: [
      { label: "Viewed 19 buyer matches", points: 26 },
      { label: "Selling in 3 to 6 months", points: 28 },
      { label: "Came back from the monthly email", points: 22 },
    ],
    type: "Buyers",
    watch: {
      lastOpened: "Sep 9, 5:02 pm",
      next: "Oct 1",
      opened: 3,
      sent: 3,
      since: "Jun 2",
    },
  },
  "L-4819": {
    actions: [
      {
        by: "Luis Ferrer",
        kind: "call",
        label: "Spoke for 12 minutes. Wants to finish the kitchen first.",
        t: "Sep 10, 10:02 am",
      },
      {
        by: "Luis Ferrer",
        kind: "note",
        label: "Set a reminder for March.",
        t: "Sep 10, 10:05 am",
      },
    ],
    claim: {
      at: "Sep 10, 8:36 am",
      edits: ["Condition set to Excellent"],
      ownedSince: 2016,
      provider: "Google",
    },
    contact: {
      bestTime: "Lunchtime",
      consent: "Agreed to be contacted · Sep 10",
      prefers: "Text",
    },
    crm: { status: "Pending" },
    equity: 2_140_000 - 780_000,
    nextStep:
      "Send the condition guide; they claimed the home and set it to Excellent.",
    photo: photos.comps[2],
    score: 61,
    signals: [
      { label: "Claimed the home", points: 22 },
      { label: "Adjusted condition to Excellent", points: 19 },
      { label: "Selling in 6 to 12 months", points: 20 },
    ],
    type: "Claimed",
    watch: { next: "Oct 1", opened: 0, sent: 0, since: "Sep 10" },
  },
  "L-4820": {
    actions: [],
    contact: {
      consent: "Agreed to be contacted · today",
      prefers: "Email",
    },
    crm: { status: "Not sent" },
    equity: 918_000 - 455_000,
    homes: [
      {
        address: "6130 SW 82nd St, South Miami",
        area: "33143",
        value: 1_050_000,
        views: 2,
        when: "35 min ago",
      },
      {
        address: "7901 SW 58th Ct, South Miami",
        area: "33143",
        value: 865_000,
        views: 1,
        when: "31 min ago",
      },
      {
        address: "9640 SW 67th Ave, Pinecrest",
        area: "33156",
        value: 1_420_000,
        views: 3,
        when: "22 min ago",
      },
    ],
    nextStep:
      "Assign an agent; unlocked buyer matches from a Meta ad 38 minutes ago.",
    photo: photos.comps[3],
    score: 42,
    signals: [
      { label: "Viewed 4 homes in 38 minutes", points: 14 },
      { label: "Unlocked buyer matches", points: 22 },
      { label: "First visit, from a Meta ad", points: 6 },
    ],
    type: "Buyers",
  },
  "L-4821": {
    actions: [],
    contact: {
      bestTime: "Today, any time",
      consent: "Agreed to be contacted · today",
      prefers: "Call",
    },
    crm: { status: "Not sent" },
    equity: 1_284_000 - 486_000,
    homes: [
      {
        address: "2214 Bayshore Ln, Coconut Grove",
        area: "33133",
        value: 1_310_000,
        views: 1,
        when: "10:43",
      },
    ],
    nextStep:
      "Call within the hour. Requested a visit and is selling within 3 months.",
    photo: photos.subject,
    score: 94,
    signals: [
      { label: "Checked a neighbor's home", points: 8 },
      { label: "Selling within 3 months", points: 32 },
      { label: "Requested a visit", points: 24 },
      { label: "Used the sale-price slider 3 times", points: 30 },
    ],
    type: "Consult",
  },
};

export interface Row extends Lead {
  extra: Extra;
}

export const rows: Row[] = leads.map((l) => ({
  ...l,
  extra: extras[l.id] ?? fallbackExtra,
}));

export const HOT_THRESHOLD = 75;

export interface AgentOption {
  coverage: string;
  load: number;
  name: string;
  photo?: string;
  response: string;
  suggested?: boolean;
}

export const agents: AgentOption[] = [
  {
    coverage: "33133, 33146",
    load: 12,
    name: "Dana Whitfield",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    response: "22 min",
    suggested: true,
  },
  {
    coverage: "33143, 33156",
    load: 9,
    name: "Luis Ferrer",
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    response: "41 min",
  },
  { coverage: "33129", load: 5, name: "Ana Reyes", response: "1 h 10 min" },
  { coverage: "33133", load: 7, name: "James Kim", response: "35 min" },
];

export const typeTone: Record<LeadType, "brand" | "neutral" | "good" | "warn"> =
  {
    Buyers: "brand",
    Claimed: "good",
    Consult: "warn",
    Watch: "neutral",
  };

export const statusTone = (
  status: Lead["status"]
): "brand" | "good" | "neutral" => {
  if (status === "New") {
    return "brand";
  }
  return status === "Synced" ? "good" : "neutral";
};

export const scoreTone = (score: number): string => {
  if (score >= HOT_THRESHOLD) {
    return "bg-[oklch(0.94_0.06_40)] text-[oklch(0.45_0.15_35)]";
  }
  if (score >= 50) {
    return "bg-brand-soft text-brand";
  }
  return "bg-surface text-ink-muted";
};

export const homesHint = (row: Row): string => {
  const homes = row.extra.homes ?? [];
  const areas = new Set([row.area, ...homes.map((h) => h.area)]);
  if (areas.size === 1) {
    return "All in the same area. Reads like an owner comparing with neighbors before selling.";
  }
  return `Across ${areas.size} areas. Reads like a buyer shopping, not an owner checking one home.`;
};

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");
