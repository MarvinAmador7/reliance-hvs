import { useEffect, useRef, useState } from "react";

import { track } from "@/lib/track";

interface SectionNavProps {
  items: readonly { id: string; label: string }[];
}

export function SectionNav({ items }: SectionNavProps) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const [first] = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (first && first.target.id !== lastTracked.current) {
          lastTracked.current = first.target.id;
          setActive(first.target.id);
          track("section_viewed", first.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    for (const s of sections) {
      observer.observe(s);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Report sections"
      className="sticky top-0 z-20 border-line border-b bg-canvas/90 backdrop-blur-md"
    >
      <div className="wrap overflow-x-auto py-2.5 [scrollbar-width:none]">
        <ul className="flex w-max gap-1">
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id}>
                <a
                  aria-current={isActive ? "location" : undefined}
                  className={`inline-flex h-9 items-center rounded-full px-3.5 text-[0.9375rem] transition-colors ${
                    isActive
                      ? "bg-ink font-medium text-canvas"
                      : "text-ink-muted hover:bg-surface hover:text-ink"
                  }`}
                  href={`#${item.id}`}
                  onClick={() => track("section_nav_clicked", item.label)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
