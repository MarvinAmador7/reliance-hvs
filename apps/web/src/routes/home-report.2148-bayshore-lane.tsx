import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { useEffect } from "react";

import { AddressSearch } from "@/components/home-report/address-search";
import { SiteHeader } from "@/components/home-report/site-chrome";
import { type AddressHit, titleCase, toSuggestion } from "@/lib/address-search";
import { track } from "@/lib/track";

/** One Fieldgeist search hit, carried in the URL from the search box. */
interface DetailsSearch {
  address?: string;
  apn?: string;
  city?: string;
  fips?: string;
  id?: string;
  lat?: string;
  lon?: string;
  state?: string;
  street?: string;
  zip?: string;
}

const KEYS = [
  "address",
  "apn",
  "city",
  "fips",
  "id",
  "lat",
  "lon",
  "state",
  "street",
  "zip",
] as const;

/** Strings as given; numbers (TanStack parses "33133" or "25.73" as JSON) back to strings. */
const text = (v: unknown): string | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return typeof v === "string" && v.length > 0 && v.length <= 200
    ? v
    : undefined;
};

export const Route = createFileRoute("/home-report/2148-bayshore-lane")({
  component: DetailsPage,
  validateSearch: (search: Record<string, unknown>): DetailsSearch =>
    Object.fromEntries(KEYS.map((k) => [k, text(search[k])])),
});

const coord = (v: string | undefined): number | undefined => {
  const n = v === undefined ? Number.NaN : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** OpenStreetMap's embeddable map, centered on the parcel with a marker. */
function ParcelMap({ lat, lon }: { lat: number; lon: number }) {
  const dLat = 0.0025;
  const dLon = 0.004;
  const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  return (
    <figure className="rise rise-2 overflow-hidden rounded-3xl ring-1 ring-line">
      <iframe
        className="aspect-[4/3] w-full border-0"
        loading="lazy"
        src={src}
        title="Map of the parcel location"
      />
    </figure>
  );
}

function DetailsPage() {
  const params = Route.useSearch();

  useEffect(() => {
    if (params.address) {
      track("details_viewed", params.address);
    }
  }, [params.address]);

  if (!params.address) {
    return (
      <>
        <SiteHeader compact />
        <main className="wrap flex flex-col items-center pt-16 pb-[min(28rem,45svh)] text-center md:pt-24">
          <h1 className="t-h2">Find a home first.</h1>
          <p className="t-lead mt-3 text-ink-muted">
            Search for an address to see its details.
          </p>
          <div className="relative z-20 mt-8 flex w-full justify-center">
            <AddressSearch autoFocus variant="hero" />
          </div>
        </main>
      </>
    );
  }

  const hit: AddressHit = {
    address: params.address,
    apn: params.apn ?? null,
    city: params.city,
    fips: params.fips ?? null,
    id: params.id,
    state: params.state,
    street: params.street,
    zip: params.zip,
  };
  const { line1, line2 } = toSuggestion(hit);
  const lat = coord(params.lat);
  const lon = coord(params.lon);
  const hasMap = lat !== undefined && lon !== undefined;

  const rows: [string, string | undefined, boolean?][] = [
    ["Standardized address", params.address],
    ["Street", params.street ? titleCase(params.street) : undefined],
    ["City", params.city ? titleCase(params.city) : undefined],
    ["State", params.state],
    ["ZIP code", params.zip],
    ["Parcel number (APN)", params.apn ?? "Not recorded by the county", true],
    ["County FIPS", params.fips, true],
    ["Coordinates", hasMap ? `${params.lat}, ${params.lon}` : undefined, true],
    ["Fieldgeist ID", params.id, true],
  ];

  return (
    <>
      <SiteHeader compact />
      <main id="top">
        <section
          className={`wrap grid items-start gap-10 pt-6 pb-20 md:pt-10 ${
            hasMap ? "md:grid-cols-[1.05fr_1fr]" : ""
          }`}
        >
          <div>
            <Link
              className="inline-flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink md:hidden"
              to="/home-report"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Search another address
            </Link>
            <h1 className="t-h2 rise mt-3 md:mt-0">{line1}</h1>
            <p className="t-lead rise rise-2 mt-1 text-ink-muted">{line2}</p>
            <p className="rise rise-2 mt-3 inline-flex items-center gap-1.5 text-ink-muted text-sm">
              <MapPin aria-hidden="true" className="size-4" />
              Matched to a parcel by Fieldgeist
            </p>

            <dl className="rise rise-3 mt-8 divide-y divide-line border-line border-y">
              {rows
                .filter(([, value]) => value !== undefined)
                .map(([label, value, tabular]) => (
                  <div
                    className="grid grid-cols-[minmax(9rem,40%)_1fr] gap-4 py-3"
                    key={label}
                  >
                    <dt className="text-ink-muted">{label}</dt>
                    <dd
                      className={`min-w-0 break-words text-ink ${
                        tabular ? "tabular-nums" : ""
                      }`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
          {hasMap ? <ParcelMap lat={lat} lon={lon} /> : null}
        </section>
      </main>
    </>
  );
}
