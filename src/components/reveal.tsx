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

    const visible = () => {
      const rect = node.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    };
    const near = () => {
      const rect = node.getBoundingClientRect();
      // Coming from below, or still partly on screen after a jump.
      return rect.top < window.innerHeight * 1.05 && rect.bottom > -80;
    };

    // Already visible on arrival: keep it that way.
    if (visible()) return;

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

    /*
     * Safety net. A jump — anchor, browser restore, `scrollTo` — can move a
     * block from "below the fold" to "scrolled past" between two observer
     * callbacks; the entry then never reports `isIntersecting` and the block
     * stays at opacity 0 for good. Re-checking on escape hatch timers and on
     * scroll end guarantees the content always shows up.
     */
    const check = () => {
      // Deliberately looser than `visible`: the point is that nothing stays
      // stranded at opacity 0 once the user has scrolled near it.
      if (near()) {
        setState("shown");
        observer.disconnect();
        cleanup();
      }
    };
    const timers = [window.setTimeout(check, 400), window.setTimeout(check, 1600)];
    window.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check);
    // The app scrolls inside <main>, and a `window` scroll listener never hears
    // that: without this the net only fired on its two timers.
    const scroller = node.closest("main") ?? window;
    scroller.addEventListener("scroll", check, { passive: true });

    const cleanup = () => {
      for (const t of timers) window.clearTimeout(t);
      window.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
      scroller.removeEventListener("scroll", check);
    };

    return () => {
      observer.disconnect();
      cleanup();
    };
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
      // "idle" means the block was already on screen and never hid — the
      // honest value for debugging, not a booleans-as-string.
      data-revealed={state}
    >
      {children}
    </div>
  );
}
