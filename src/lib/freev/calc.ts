import { inScope, type Mode, type Tx } from "@/lib/freev/data";

export function flows(txs: Tx[], mode: Mode, month = "2026-11") {
  const rows = txs.filter(
    (t) =>
      t.date.startsWith(month) && !t.pending && t.kind !== "transfer" && inScope(t.scope, mode),
  );
  const inn = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return { inn, out, rest: inn - out, rows };
}

export function spentByCategory(txs: Tx[], mode: Mode, month = "2026-11") {
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
