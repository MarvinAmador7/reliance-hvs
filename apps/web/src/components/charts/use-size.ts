import { type RefObject, useEffect, useState } from "react";

const DEFAULT_WIDTH = 640;

/** Observes the rendered width of an element so SVG charts can lay out in pixels. */
export const useWidth = (ref: RefObject<HTMLElement | null>): number => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const update = () =>
      setWidth(Math.max(200, Math.round(el.getBoundingClientRect().width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
};
