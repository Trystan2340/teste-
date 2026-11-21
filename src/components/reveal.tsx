import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades a block in the first time it scrolls into view.
 *
 * Long pages (the dashboard, the report, the settings screens) used to animate
 * only their first screenful, because the CSS runs at mount; anything below the
 * fold had finished animating long before anyone scrolled to it. This observes.
 *
 * Rules that keep it honest:
 * - the server renders the block fully visible, so no-JS, crawlers and a
 *   reduced-motion visitor all see plain content — the hidden state is only
 *   ever applied from a layout effect, i.e. in a browser that can animate;
 * - a block that is already on screen at mount is left untouched (no flash of
 *   disappearing content, the page-level motion already covers it);
 * - it animates once, then stops observing: no flicker on scroll back;
 * - the observer disconnects on unmount, so route changes leave nothing behind.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    // Already visible on arrival: keep it that way.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    setState("hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      // Start slightly before the block is fully on screen.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        state === "hidden" && "reveal-pending",
        state === "shown" && "reveal",
        className,
      )}
      style={state === "shown" && delay ? { animationDelay: `${delay}ms` } : undefined}
      data-revealed={state === "shown"}
    >
      {children}
    </div>
  );
}
