import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/utils";

/**
 * A currency figure that walks from its previous value to the new one.
 *
 * When the user edits an operation or switches month, the balance used to jump.
 * Counting makes the change legible: you see which direction it moved and by
 * how much. The final frame is always the exact value — never a rounded guess —
 * and users who ask for reduced motion get the number immediately.
 */
export function CountUp({
  value,
  duration = 600,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || fromRef.current === value) {
      setShown(value);
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic: fast off the mark, settles on the exact figure
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (value - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setShown(value);
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return (
    <span className={className} aria-label={money(value)}>
      <span aria-hidden className="tabular-nums">
        {money(shown)}
      </span>
    </span>
  );
}
