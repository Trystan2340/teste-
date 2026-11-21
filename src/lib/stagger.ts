/**
 * List choreography.
 *
 * A list that appears all at once reads as a page load; a list whose rows
 * arrive in sequence reads as a page *composing itself*. These helpers keep
 * that stagger in one place so every list in the app moves the same way, and
 * so the delay stays capped for long lists.
 *
 * The animation itself lives in styles.css (`.stagger > *`), which means it
 * runs without JavaScript and is switched off wholesale for users who ask for
 * reduced motion.
 */

/** Per-row delay, in ms. Small enough that ten rows land in under 400 ms. */
const STEP = 32;

/** Rows past this index stop waiting, so a 40-line journal never lags behind. */
const MAX_STEPS = 12;

/**
 * Inline delay for the row at `index`.
 *
 * Used with `<ul className="stagger">`: the parent sets up the animation, each
 * row only says when it should start.
 */
export function stagger(index: number, base = 0): { style: { animationDelay: string } } {
  return { style: { animationDelay: `${base + Math.min(index, MAX_STEPS) * STEP}ms` } };
}
