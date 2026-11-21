import { HISTORY, TODAY, inScope, type Mode, type Tx } from "@/lib/freev/data";

export function flows(txs: Tx[], mode: Mode, month = TODAY.slice(0, 7)) {
  const rows = txs.filter(
    (t) =>
      t.date.startsWith(month) && !t.pending && t.kind !== "transfer" && inScope(t.scope, mode),
  );
  const inn = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return { inn, out, rest: inn - out, rows };
}

export function spentByCategory(txs: Tx[], mode: Mode, month = TODAY.slice(0, 7)) {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (!t.date.startsWith(month) || t.kind !== "expense" || t.pending || !inScope(t.scope, mode))
      continue;
    map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Totals for one month, keeping past months readable.
 *
 * The journal only holds the current month, so a month the user navigates back
 * to has no rows of its own — yet the header, the report and the analytics all
 * claim to describe it. Past months fall back to the recorded aggregate, and a
 * month with neither rows nor history is honestly zero rather than a copy of
 * November.
 */
export function monthTotals(txs: Tx[], mode: Mode, month: string) {
  const own = flows(txs, mode, month);
  if (own.rows.length) return own;
  const history = HISTORY.find((h) => h.id === month);
  if (!history) return own;
  return { inn: history.inn, out: history.out, rest: history.inn - history.out, rows: [] };
}

/** `YYYY-MM` shifted by whole months, clamped by the Date constructor. */
function shift(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Previous calendar month key, `YYYY-MM` in, `YYYY-MM` out. */
export function previousMonth(month: string) {
  return shift(month, -1);
}

/** Following calendar month key, for "duplicate this month forward". */
export function nextMonth(month: string) {
  return shift(month, 1);
}

/** Relative change in %, or null when there is no base to compare against. */
export function change(current: number, previous: number) {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
