import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { searchSuggestions } from "@/lib/mock-data";
import { track } from "@/lib/track";

interface AddressSearchProps {
  autoFocus?: boolean;
  variant: "hero" | "compact";
}

const MAX_RESULTS = 5;

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

  const q = query.trim().toLowerCase();
  const results = (
    q.length === 0
      ? searchSuggestions.slice(0, 4)
      : searchSuggestions.filter((s) =>
          `${s.line1} ${s.line2}`.toLowerCase().includes(q)
        )
  ).slice(0, MAX_RESULTS);

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const choose = (index: number) => {
    const picked = results[index] ?? results[0];
    if (!picked) {
      return;
    }
    setQuery(`${picked.line1}, ${picked.line2}`);
    setOpen(false);
    track("address_selected", picked.line1);
    navigate({ to: "/home-report/2148-bayshore-lane" });
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

  const hero = variant === "hero";
  const showList = open && results.length > 0;

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
          } ring-brand/40 transition-shadow focus-within:ring-2`}
          onSubmit={(event) => {
            event.preventDefault();
            choose(active);
          }}
        >
          <MapPin
            aria-hidden="true"
            className={`shrink-0 text-ink-muted ${hero ? "size-5" : "size-4"}`}
          />
          <label className="sr-only" htmlFor={`${listId}-input`}>
            Home address
          </label>
          <input
            aria-activedescendant={
              showList ? `${listId}-opt-${active}` : undefined
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
              hero ? "Enter your home address" : "Search another address"
            }
            role="combobox"
            type="text"
            value={query}
          />
          {hero ? (
            <button
              aria-label="Get my estimate"
              className="btn btn-brand h-12 w-12 rounded-full text-base sm:w-auto sm:px-5"
              type="submit"
            >
              <span className="hidden sm:inline">Get my estimate</span>
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
        aria-label="Address suggestions"
        className={`absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl bg-canvas p-1.5 shadow-float ring-1 ring-line transition-[opacity,transform] duration-200 ease-out ${
          showList
            ? "opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
        hidden={!showList}
        id={listId}
        role="listbox"
      >
        {q.length === 0 && (
          <div className="px-3 pt-2 pb-1 text-ink-muted text-xs">
            Try an example address
          </div>
        )}
        {results.map((s, i) => (
          <div
            aria-selected={i === active}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${
              i === active ? "bg-surface" : ""
            }`}
            id={`${listId}-opt-${i}`}
            key={s.line1}
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
            <MapPin
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-muted"
            />
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">
                {s.line1}
              </span>
              <span className="block truncate text-ink-muted text-sm">
                {s.line2}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
