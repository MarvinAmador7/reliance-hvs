import { useEffect, useState } from "react";

/*
  Demo analytics tracer. Components call `track()` with an event name and a
  human-readable value; the preview tray subscribes and shows each event as a
  short-lived label. In the real product these calls would go to the events
  pipeline described in the design notes.
*/

export interface TrackedEvent {
  at: number;
  id: number;
  name: string;
  value?: string;
}

const EVENT_NAME = "rl:track";
const TOAST_MS = 2600;
const MAX_VISIBLE = 4;

let counter = 0;

export const track = (name: string, value?: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  counter += 1;
  const detail: TrackedEvent = { at: Date.now(), id: counter, name, value };
  window.dispatchEvent(new CustomEvent<TrackedEvent>(EVENT_NAME, { detail }));
};

/** Recent tracked events, each dropping off after a short delay. */
export const useTrackedEvents = (): TrackedEvent[] => {
  const [events, setEvents] = useState<TrackedEvent[]>([]);

  useEffect(() => {
    const timers = new Set<number>();
    const onTrack = (event: Event) => {
      const { detail } = event as CustomEvent<TrackedEvent>;
      setEvents((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), detail]);
      const timer = window.setTimeout(() => {
        setEvents((prev) => prev.filter((e) => e.id !== detail.id));
        timers.delete(timer);
      }, TOAST_MS);
      timers.add(timer);
    };
    window.addEventListener(EVENT_NAME, onTrack);
    return () => {
      window.removeEventListener(EVENT_NAME, onTrack);
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return events;
};
