import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type TenantId = "harborvale" | "keystone" | "summit";

export interface Tenant {
  agent: {
    name: string;
    title: string;
    license: string;
    initials: string;
    photo: string;
    email: string;
  };
  city: string;
  hostedDomain: string;
  id: TenantId;
  legalName: string;
  mark: "harbor" | "key" | "peak";
  mlsDisclaimer: string;
  name: string;
  phone: string;
  state: string;
  tagline: string;
  theme: {
    brand: string;
    brandSoft: string;
    brandInk: string;
    dark: string;
    radius: string;
  };
  website: string;
}

export const tenants: Record<TenantId, Tenant> = {
  harborvale: {
    agent: {
      email: "dana@harborvale.com",
      initials: "DW",
      license: "FL SL3418822",
      name: "Dana Whitfield",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
      title: "Broker Associate",
    },
    city: "Coconut Grove",
    hostedDomain: "gethomevalue.harborvale.com",
    id: "harborvale",
    legalName: "Harbor & Vale Real Estate, LLC",
    mark: "harbor",
    mlsDisclaimer:
      "Estimates are generated automatically from public records and MLS data and are not an appraisal. Listing data © 2026 MIAMI Association of Realtors. Information deemed reliable but not guaranteed.",
    name: "Harbor & Vale",
    phone: "(305) 555-0148",
    state: "FL",
    tagline: "Coconut Grove's neighborhood brokerage since 1998.",
    theme: {
      brand: "oklch(0.42 0.1 200)",
      brandInk: "oklch(1 0 0)",
      brandSoft: "oklch(0.95 0.025 200)",
      dark: "oklch(0.2 0.012 200)",
      radius: "20px",
    },
    website: "harborvale.com",
  },
  keystone: {
    agent: {
      email: "marcus@keystonegroup.com",
      initials: "MB",
      license: "MO 2018021044",
      name: "Marcus Bell",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
      title: "Managing Broker",
    },
    city: "Kansas City",
    hostedDomain: "homevalue.keystonegroup.com",
    id: "keystone",
    legalName: "Keystone Group Realty, Inc.",
    mark: "key",
    mlsDisclaimer:
      "Estimates are generated automatically and are not an appraisal. Listing data © 2026 Heartland MLS. Information deemed reliable but not guaranteed.",
    name: "Keystone Group",
    phone: "(816) 555-0122",
    state: "MO",
    tagline: "Kansas City's most referred brokerage.",
    theme: {
      brand: "oklch(0.5 0.17 28)",
      brandInk: "oklch(1 0 0)",
      brandSoft: "oklch(0.95 0.03 28)",
      dark: "oklch(0.2 0.01 28)",
      radius: "10px",
    },
    website: "keystonegroup.com",
  },
  summit: {
    agent: {
      email: "priya@summitrealty.co",
      initials: "PN",
      license: "CO FA100089221",
      name: "Priya Natarajan",
      photo: "https://randomuser.me/api/portraits/women/68.jpg",
      title: "Listing Specialist",
    },
    city: "Denver",
    hostedDomain: "value.summitrealty.co",
    id: "summit",
    legalName: "Summit Realty Partners",
    mark: "peak",
    mlsDisclaimer:
      "Estimates are generated automatically and are not an appraisal. Listing data © 2026 REcolorado. Information deemed reliable but not guaranteed.",
    name: "Summit Realty",
    phone: "(720) 555-0190",
    state: "CO",
    tagline: "Front Range homes, valued with care.",
    theme: {
      brand: "oklch(0.45 0.16 280)",
      brandInk: "oklch(1 0 0)",
      brandSoft: "oklch(0.95 0.03 280)",
      dark: "oklch(0.2 0.015 280)",
      radius: "16px",
    },
    website: "summitrealty.co",
  },
};

export const tenantOrder: TenantId[] = ["harborvale", "keystone", "summit"];

const STORAGE_KEY = "rl.preview.tenant";

interface TenantContextValue {
  setTenantId: (id: TenantId) => void;
  tenant: Tenant;
}

const TenantContext = createContext<TenantContextValue>({
  setTenantId: () => undefined,
  tenant: tenants.harborvale,
});

const isTenantId = (value: string | null): value is TenantId =>
  value === "harborvale" || value === "keystone" || value === "summit";

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState<TenantId>("harborvale");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isTenantId(stored)) {
        setTenantIdState(stored);
      }
    } catch {
      // Storage unavailable (private mode); keep the default tenant.
    }
  }, []);

  const setTenantId = (id: TenantId) => {
    setTenantIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignore storage failures; the choice still applies for this session.
    }
  };

  return (
    <TenantContext.Provider value={{ setTenantId, tenant: tenants[tenantId] }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);

/** CSS custom properties that re-theme every `--c-*` token for a tenant. */
export const tenantVars = (tenant: Tenant): CSSProperties =>
  ({
    "--c-bg": "oklch(1 0 0)",
    "--c-brand": tenant.theme.brand,
    "--c-brand-ink": tenant.theme.brandInk,
    "--c-brand-soft": tenant.theme.brandSoft,
    "--c-dark": tenant.theme.dark,
    "--c-ink": "oklch(0.15 0 0)",
    "--c-line": "oklch(0.9 0 0)",
    "--c-muted": "oklch(0.45 0 0)",
    "--c-radius": tenant.theme.radius,
    "--c-surface": "oklch(0.97 0 0)",
  }) as CSSProperties;
