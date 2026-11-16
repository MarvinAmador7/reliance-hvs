import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
  groupSuggestions,
  isNested,
  type Suggestion,
  useAddressSearch,
} from "@/lib/address-search";
import { track } from "@/lib/track";

interface AddressSearchProps {
  autoFocus?: boolean;
  variant: "hero" | "compact";
}

/** Smallest list height before it may run off screen; room kept for the list's offset, footer and a margin. */
const LIST_MIN_PX = 240;
const LIST_GAP_PX = 64;

const QUERY_SPLIT = /[\s,]+/;
const KEEP_SPACES = /(\s+|-)/;

/** Bolds the parts of a line that the typed words start, so people see why it matched. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = query
    .toLowerCase()
    .split(QUERY_SPLIT)
    .filter((w) => w.length > 0);
  return (
    <>
      {text.split(KEEP_SPACES).map((part, i) => {
        const lower = part.toLowerCase();
        const hit = words.find((w) => lower.startsWith(w));
        if (!hit) {
          return part;
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
          <span key={i}>
            <mark className="bg-transparent font-semibold text-ink">
              {part.slice(0, hit.length)}
            </mark>
            {part.slice(hit.length)}
          </span>
        );
      })}
    </>
  );
}

/** The room left under the search box, so every visible result fits on screen. */
function useListMaxHeight(
  rootRef: React.RefObject<HTMLDivElement | null>,
  open: boolean
): React.CSSProperties | undefined {
  const [max, setMax] = useState<number | null>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const measure = () => {
      const box = rootRef.current?.getBoundingClientRect();
      if (box) {
        setMax(
          Math.max(LIST_MIN_PX, window.innerHeight - box.bottom - LIST_GAP_PX)
        );
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open, rootRef]);
  return max === null ? undefined : { maxHeight: max };
}

export function AddressSearch({
  variant,
  autoFocus = false,
}: AddressSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const search = useAddressSearch(query);
  const groups = groupSuggestions(search.suggestions);
  // Options in the order they render, so arrow keys follow the nesting.
  const results = groups.flatMap((g) => g.items);
  const more = search.total > results.length;

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Keep the highlighted option visible while the list scrolls.
  useEffect(() => {
    if (open) {
      document
        .getElementById(`${listId}-opt-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [active, listId, open]);

  const pick = (s: Suggestion) => {
    setQuery(`${s.line1}, ${s.line2}`);
    setOpen(false);
    track("address_selected", s.line1);
    // The details page shows exactly what this search hit carries, nothing more.
    const { hit } = s;
    navigate({
      search: {
        address: hit.address,
        apn: hit.apn ?? undefined,
        city: hit.city,
        fips: hit.fips ?? undefined,
        id: hit.id,
        lat: hit.lat === undefined ? undefined : String(hit.lat),
        lon: hit.lon === undefined ? undefined : String(hit.lon),
        state: hit.state,
        street: hit.street,
        zip: hit.zip,
      },
      to: "/home-report/2148-bayshore-lane",
    });
  };

  const choose = (index: number) => {
    const picked = results[index] ?? results[0];
    if (picked) {
      pick(picked);
    } else {
      setOpen(true);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  /** One selectable suggestion: a plain address row, or a unit nested under its building. */
  const renderOption = (s: Suggestion, kind: "row" | "child") => {
    const i = results.indexOf(s);
    const child = kind === "child";
    const label = s.unit ?? (child ? "Building parcel" : s.line1);
    return (
      <div
        aria-label={`${s.line1}, ${s.line2}`}
        aria-selected={i === active}
        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 ${
          child ? "py-2" : "py-2.5"
        } ${i === active ? "bg-surface" : ""}`}
        id={`${listId}-opt-${i}`}
        key={s.hit.id ?? s.hit.address}
        onClick={() => choose(i)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            choose(i);
          }
        }}
        onMouseEnter={() => setActive(i)}
        role="option"
        tabIndex={-1}
      >
        {child ? null : (
          <MapPin
            aria-hidden="true"
            className="size-4 shrink-0 text-ink-muted"
          />
        )}
        {child ? (
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <span className="truncate text-ink">
              <Highlight query={query} text={label} />
            </span>
            {s.hit.apn ? (
              <span className="shrink-0 text-ink-muted text-xs tabular-nums">
                APN {s.hit.apn}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="min-w-0">
            <span className="block truncate text-ink">
              <Highlight query={query} text={label} />
            </span>
            <span className="block truncate text-ink-muted text-sm">
              {s.line2}
            </span>
          </span>
        )}
      </div>
    );
  };

  const hero = variant === "hero";
  const typed = query.trim().length >= 3;
  const empty = search.status === "ready" && results.length === 0;
  const failed = search.status === "error";
  const showList = open && typed && (results.length > 0 || empty || failed);
  const loading = search.status === "loading";

  const listStyle = useListMaxHeight(rootRef, showList);

  return (
    <div
      className={`relative ${hero ? "w-full max-w-2xl" : "w-full max-w-md"}`}
      ref={rootRef}
    >
      <search>
        <form
          className={`flex items-center bg-canvas ${
            hero
              ? "h-16 rounded-full pr-2 pl-5 shadow-float"
              : "h-11 rounded-full pr-1.5 pl-3.5 ring-1 ring-line"
          } ring-[var(--c-signal)] transition-shadow focus-within:ring-2`}
          onSubmit={(event) => {
            event.preventDefault();
            choose(active);
          }}
        >
          {loading ? (
            <LoaderCircle
              aria-hidden="true"
              className={`shrink-0 animate-spin text-ink-muted motion-reduce:animate-none ${hero ? "size-5" : "size-4"}`}
            />
          ) : (
            <MapPin
              aria-hidden="true"
              className={`shrink-0 text-ink-muted ${hero ? "size-5" : "size-4"}`}
            />
          )}
          <label className="sr-only" htmlFor={`${listId}-input`}>
            Home address
          </label>
          <input
            aria-activedescendant={
              showList && results.length > 0
                ? `${listId}-opt-${active}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={showList}
            autoComplete="off"
            autoFocus={autoFocus}
            className={`min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-muted ${
              hero ? "px-3 text-lg" : "px-2.5 text-[0.9375rem]"
            }`}
            id={`${listId}-input`}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={
              hero ? "Start typing an address" : "Search another address"
            }
            role="combobox"
            spellCheck={false}
            type="text"
            value={query}
          />
          {hero ? (
            <button
              aria-label="Find my home"
              className="btn btn-brand h-12 w-12 rounded-full text-base sm:w-auto sm:px-5"
              type="submit"
            >
              <span className="hidden sm:inline">Find my home</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          ) : (
            <button
              aria-label="Search"
              className="btn btn-ink size-8 rounded-full"
              type="submit"
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
          )}
        </form>
      </search>

      <div
        className={`absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl bg-canvas text-left shadow-float ring-1 ring-line transition-[opacity,transform] duration-200 ease-out ${
          showList
            ? "opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
        hidden={!showList}
      >
        <div
          aria-label="Address suggestions"
          className="max-h-[min(30rem,55svh)] overflow-y-auto overscroll-contain p-1.5"
          id={listId}
          role="listbox"
          style={listStyle}
        >
          {groups.map((g, gi) => {
            if (!isNested(g)) {
              const s = g.items[0] as Suggestion;
              return renderOption(s, "row");
            }
            const headId = `${listId}-g-${gi}`;
            return (
              // biome-ignore lint/a11y/useSemanticElements: ARIA listboxes group options with role="group"; a fieldset is for form controls
              <div aria-labelledby={headId} key={g.key} role="group">
                <div
                  className="flex items-center gap-3 px-3 pt-2.5 pb-1.5"
                  id={headId}
                >
                  <Building2
                    aria-hidden="true"
                    className="size-4 shrink-0 text-ink-muted"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-ink">
                      <Highlight query={query} text={g.base} />
                    </span>
                    <span className="block truncate text-ink-muted text-sm">
                      {g.line2}
                    </span>
                  </span>
                </div>
                <div className="mb-1 ml-5 border-line border-l pl-2">
                  {g.items.map((s) => renderOption(s, "child"))}
                  {more && g.hasUnits ? (
                    <div className="px-3 py-1.5 text-ink-muted text-xs">
                      More units here. Type a unit number to narrow.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {empty ? (
            <div className="px-3 py-3 text-ink-muted text-sm">
              No matching address yet. Keep typing, or check the street name.
            </div>
          ) : null}
          {failed ? (
            <div className="px-3 py-3 text-ink-muted text-sm">
              Address search is unavailable right now. Try again in a moment.
            </div>
          ) : null}
        </div>
        {results.length > 0 ? (
          <div className="flex items-center justify-between border-line border-t px-4 py-2 text-ink-muted text-xs">
            <span>Address search by Fieldgeist</span>
            {search.ms !== null && (
              <span className="tabular-nums">{Math.round(search.ms)} ms</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
