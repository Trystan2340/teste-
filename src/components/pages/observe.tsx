import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Eye,
  EyeOff,
  Flame,
  GripVertical,
  Repeat,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { FlowChart, SplitChart } from "@/components/charts";
import { CountUp } from "@/components/count-up";
import { stagger } from "@/lib/stagger";
import { Reveal } from "@/components/reveal";
import { Amount, Button, Empty, PageHead, Stat } from "@/components/ui";
import { change, monthTotals, previousMonth, spentByCategory } from "@/lib/freev/calc";
import { HISTORY, SCHEDULE, SNAP, TODAY, inScope } from "@/lib/freev/data";
import { type DashBlock, useFreev } from "@/lib/freev/store";
import { dayLabel, money, monthName, pct, cn } from "@/lib/utils";

/**
 * One dashboard block, wrapped in the frame that lets the reader move it.
 *
 * Drag and drop alone is not an acceptable affordance: it does nothing from a
 * keyboard, and browsers do not start a native drag on touch. So the same
 * reordering is reachable from the small control cluster on top of each block
 * — "Monter", "Descendre", "Masquer" — disclosed by the "Personnaliser"
 * switch, not shown on a settled dashboard.
 */
function Block({
  id,
  label,
  editing,
  index,
  count,
  children,
}: {
  id: DashBlock;
  label: string;
  editing: boolean;
  index: number;
  count: number;
  children: React.ReactNode;
}) {
  const move = useFreev((s) => s.moveDashBlock);
  const place = useFreev((s) => s.placeDashBlock);
  const toggle = useFreev((s) => s.toggleDashBlock);
  const [over, setOver] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <section
      data-block={id}
      draggable={editing}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => {
        setDragging(false);
        setOver(false);
      }}
      onDragOver={(e) => {
        if (!editing) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!editing) return;
        e.preventDefault();
        setOver(false);
        const from = e.dataTransfer.getData("text/plain") as DashBlock;
        if (from && from !== id) place(from, index);
      }}
      className={cn(
        "relative mb-5 break-inside-avoid rounded-3xl transition-[background-color,box-shadow] duration-[var(--dur-1)]",
        editing && "cursor-grab border border-dashed border-copper/25 bg-card/25 p-2.5",
        dragging && "opacity-40",
        over && !dragging && "border-copper/70 bg-copper/6",
      )}
    >
      {editing ? (
        <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-copper">
            <GripVertical className="size-3.5" strokeWidth={2} />
            {label}
          </span>
          <span className="flex items-center gap-1">
            <IconBtn label={`Monter ${label}`} disabled={index === 0} onClick={() => move(id, -1)}>
              <ArrowUp className="size-3.5" strokeWidth={2.2} />
            </IconBtn>
            <IconBtn
              label={`Descendre ${label}`}
              disabled={index === count - 1}
              onClick={() => move(id, 1)}
            >
              <ArrowDown className="size-3.5" strokeWidth={2.2} />
            </IconBtn>
            <IconBtn label={`Masquer ${label}`} onClick={() => toggle(id)}>
              <EyeOff className="size-3.5" strokeWidth={2.2} />
            </IconBtn>
          </span>
        </div>
      ) : null}
      {children}
    </section>
  );
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-lg bg-card-2 text-mist transition-colors hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

const BLOCK_LABELS: Record<DashBlock, string> = {
  schedule: "Échéancier",
  recent: "Activité récente",
  health: "Santé du mois",
  accounts: "Comptes",
  split: "Répartition des sorties",
  watch: "À surveiller",
};

export function Dashboard() {
  const mode = useFreev((s) => s.mode);
  const month = useFreev((s) => s.month);
  const txs = useFreev((s) => s.txs);
  const accounts = useFreev((s) => s.accounts);
  const open = useFreev((s) => s.open);
  const activeId = useFreev((s) => s.activeAccountId);
  const setActive = useFreev((s) => s.setActiveAccount);
  const flow = monthTotals(txs, mode, month);
  const before = monthTotals(txs, mode, previousMonth(month));
  // Month-on-month movement, recomputed per month instead of a baked figure.
  const balanceDelta = change(flow.rest, before.rest);
  const visible = accounts.filter((a) => inScope(a.scope, mode));
  const balance = visible.reduce((s, a) => s + a.balance, 0);
  const recent = [...txs]
    .filter((t) => inScope(t.scope, mode) && t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  const split = spentByCategory(txs, mode, month);
  const snap = SNAP[mode];
  const monthShort = monthName(month, "short");
  const todayDay = Number(TODAY.slice(8, 10));
  const isCurrent = month === TODAY.slice(0, 7);
  const scopeLabel =
    mode === "pro" ? "professionnel" : mode === "perso" ? "personnel" : "personnel + pro";

  const dashOrder = useFreev((s) => s.dashOrder);
  const dashHidden = useFreev((s) => s.dashHidden);
  const toggleDash = useFreev((s) => s.toggleDashBlock);
  const resetDash = useFreev((s) => s.resetDash);
  const [editing, setEditing] = useState(false);
  const visibleBlocks = dashOrder.filter((b) => !dashHidden.includes(b));
  const hiddenBlocks = dashOrder.filter((b) => dashHidden.includes(b));

  /*
   * Each block is a closed piece of markup: it only reads the values computed
   * above, so the order below can change without touching any block.
   */
  const content: Record<DashBlock, React.ReactNode> = {
    schedule: (
      <div className="chrome-pill rounded-3xl bg-card p-5">
        <h2 className="font-serif text-2xl tracking-tight">Échéancier</h2>
        <ul className="stagger mt-3 divide-y divide-rule">
          {SCHEDULE.map((item, index) => {
            const passed = isCurrent && item.day < todayDay;
            return (
              <li
                key={item.id}
                {...stagger(index)}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-medium tabular-nums",
                      passed ? "bg-card-2 text-mist" : "bg-copper/10 text-copper",
                    )}
                  >
                    {item.day}
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-sm">{item.label}</p>
                    <p className="text-xs text-mist">
                      {monthShort}
                      <span
                        className={cn(
                          "ml-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[11px]",
                          passed ? "bg-card-2 text-mist" : "bg-copper/10 text-copper",
                        )}
                      >
                        {passed ? (
                          <Check className="size-2.5" strokeWidth={3} />
                        ) : (
                          <Clock className="size-2.5" />
                        )}
                        {passed ? "passé" : "à venir"}
                      </span>
                    </p>
                  </span>
                </div>
                <Amount value={item.amount} />
              </li>
            );
          })}
        </ul>
      </div>
    ),
    recent: (
      <div className="chrome-pill rounded-3xl bg-card p-5">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl tracking-tight">Activité récente</h2>
          <Link to="/transactions" className="text-sm text-copper">
            Journal
          </Link>
        </div>
        <ul className="stagger mt-3 divide-y divide-rule">
          {recent.length === 0 ? (
            <li className="py-6 text-sm text-mist">
              {flow.rows.length
                ? "Aucune opération visible dans ce périmètre."
                : `Le détail n’est tenu que pour le mois courant : ${monthName(month)} reste en agrégat.`}
            </li>
          ) : null}
          {recent.map((t, index) => (
            <li
              key={t.id}
              {...stagger(index, 120)}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{t.label}</p>
                <p className="text-xs text-mist">
                  {dayLabel(t.date)} · {t.category}
                </p>
              </div>
              <Amount value={t.amount} kind={t.kind} />
            </li>
          ))}
        </ul>
      </div>
    ),
    health: (
      <div className="chrome-pill rounded-3xl bg-card p-5">
        <p className="text-xs font-medium tracking-wide text-mist">Santé du mois · sur 100</p>
        <p className="mt-1 font-serif text-6xl tabular-nums tracking-tight">{snap.health}</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-mist">
          {snap.health >= 80
            ? "Le mois tient. Une charge d’énergie sort du rang, le reste suit le budget."
            : snap.health >= 60
              ? "Correct, mais la marge se réduit : deux postes dépassent leur moyenne."
              : "Sous tension. Les sorties pèsent plus lourd que d’habitude pour ce stade du mois."}
        </p>
      </div>
    ),
    accounts: (
      <div className="chrome-pill rounded-3xl bg-card p-5">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-serif text-2xl tracking-tight">Comptes</h2>
          <div className="flex gap-3">
            <button
              type="button"
              className="text-sm text-copper"
              onClick={() => open({ name: "pick-account" })}
            >
              Choisir
            </button>
            <button
              type="button"
              className="text-sm text-copper"
              onClick={() => open({ name: "accounts" })}
            >
              Gérer
            </button>
          </div>
        </div>
        <ul className="stagger mt-3 space-y-1">
          {visible.map((a, index) => (
            <li key={a.id} {...stagger(index, 60)}>
              <button
                type="button"
                onClick={() => setActive(a.id)}
                title={a.id === activeId ? "Compte actif" : "Utiliser ce compte"}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors duration-[var(--dur-1)]",
                  a.id === activeId ? "bg-card-2/80" : "hover:bg-card-2/50",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tracking-tight",
                    a.kind === "pro"
                      ? "bg-copper/12 text-copper"
                      : a.kind === "epargne"
                        ? "bg-sage/15 text-sage"
                        : "bg-teal/15 text-teal",
                  )}
                >
                  {a.bank.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{a.name}</span>
                  <span className="text-xs text-mist">{a.bank}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">{money(a.balance)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    ),
    split: (
      <div className="chrome-pill rounded-3xl bg-card p-5">
        <h2 className="font-serif text-2xl tracking-tight">Répartition des sorties</h2>
        <SplitChart data={split} />
      </div>
    ),
    watch: (
      <div className="rounded-3xl bg-copper/8 p-5 ring-1 ring-copper/15">
        <p className="text-xs font-medium tracking-wide text-copper">À surveiller</p>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              to="/analytique"
              className="group flex items-start gap-2 rounded-xl p-1 -m-1 transition-colors duration-[var(--dur-1)] hover:bg-copper/10"
            >
              <Flame className="mt-0.5 size-4 shrink-0 text-clay" strokeWidth={1.8} />
              <span className="text-sm">
                EDF a augmenté de 18 % par rapport à la moyenne.
                <span className="mt-0.5 block text-xs text-copper/80 transition-colors group-hover:text-copper">
                  Voir l’analytique →
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/abonnements"
              className="group flex items-start gap-2 rounded-xl p-1 -m-1 transition-colors duration-[var(--dur-1)] hover:bg-copper/10"
            >
              <Repeat className="mt-0.5 size-4 shrink-0 text-copper" strokeWidth={1.8} />
              <span className="text-sm">
                2 abonnements se renouvellent cette semaine.
                <span className="mt-0.5 block text-xs text-copper/80 transition-colors group-hover:text-copper">
                  Gérer les abonnements →
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    ),
  };

  return (
    <div className="space-y-5">
      <PageHead
        kicker={`${monthName(month)} · livre`}
        title="Tableau de bord"
        lede="Le mois en cours, les échéances encore devant, et ce qui a déjà bougé."
        actions={
          <>
            <Link
              to="/rapport"
              className="inline-flex h-10 items-center rounded-full border border-rule bg-card px-4 text-sm shadow-float hover:border-copper/30 hover:text-copper"
            >
              Rapport
            </Link>
            <Button variant="primary" onClick={() => open({ name: "tx" })}>
              Nouvelle opération
            </Button>
          </>
        }
      />

      <section className="chrome-pill grid gap-6 rounded-3xl bg-card p-5 md:p-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="text-xs font-medium tracking-wide text-mist">Solde {scopeLabel}</p>
          <p className="mt-2 font-serif text-5xl tracking-tight">
            <CountUp value={balance} />
          </p>
          {balanceDelta === null ? (
            <p className="mt-2 text-sm text-mist">Pas de mois précédent à comparer.</p>
          ) : (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm",
                balanceDelta >= 0 ? "bg-sage/12 text-sage" : "bg-clay/12 text-clay",
              )}
            >
              <TrendingUp
                className={cn("size-3.5", balanceDelta < 0 && "rotate-180")}
                strokeWidth={2}
              />
              {pct(balanceDelta)}
              <span className="text-mist">vs {monthName(previousMonth(month), "short")}</span>
            </p>
          )}
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:col-span-7">
          <MiniStat label="Entrées" amount={flow.inn} note={monthShort} tone="sage" />
          <MiniStat label="Sorties" amount={flow.out} note={monthShort} tone="clay" />
          <MiniStat label="Reste à vivre" amount={flow.rest} note="Entrées − sorties" />
        </div>
      </section>

      {/* Block layout: the reader chooses the order and the blocks worth seeing. */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-mist">
            {mode === "pro" ? "Vue pro" : mode === "perso" ? "Vue perso" : "Vue complète"} ·{" "}
            {visibleBlocks.length} bloc{visibleBlocks.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  resetDash();
                  toast("Ordre d’origine rétabli");
                }}
                className="text-xs text-mist underline decoration-rule underline-offset-4 hover:text-ink"
              >
                Ordre d’origine
              </button>
            ) : null}
            <button
              type="button"
              aria-pressed={editing}
              onClick={() => setEditing((v) => !v)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                editing ? "bg-copper text-canvas" : "bg-card-2 text-mist hover:text-ink",
              )}
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={2} />
              {editing ? "Terminer" : "Personnaliser"}
            </button>
          </div>
        </div>

        {editing ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-card px-3 py-2.5">
            <span className="text-xs text-mist">Masqués :</span>
            {hiddenBlocks.length === 0 ? (
              <span className="text-xs text-mist">aucun</span>
            ) : (
              hiddenBlocks.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleDash(b)}
                  className="inline-flex items-center gap-1 rounded-full bg-card-2 px-2.5 py-1 text-xs text-ink hover:text-copper"
                >
                  <Eye className="size-3" strokeWidth={2.2} />
                  {BLOCK_LABELS[b]}
                </button>
              ))
            )}
            {hiddenBlocks.length ? (
              <button type="button" onClick={resetDash} className="ml-auto text-xs text-copper">
                Tout réafficher
              </button>
            ) : null}
          </div>
        ) : null}
      </Reveal>

      {visibleBlocks.length === 0 ? (
        <Empty
          title="Aucun bloc affiché"
          body="Tous les blocs du tableau de bord sont masqués. Rouvrez « Personnaliser » pour en réafficher."
          action={
            <Button variant="primary" onClick={resetDash}>
              Rétablir
            </Button>
          }
        />
      ) : (
        <div className="gap-5 lg:columns-2">
          {visibleBlocks.map((id, index) => (
            <Block
              key={id}
              id={id}
              label={BLOCK_LABELS[id]}
              editing={editing}
              index={index}
              count={visibleBlocks.length}
            >
              {content[id]}
            </Block>
          ))}
        </div>
      )}
      <p className="text-xs text-mist">Date de référence {dayLabel(TODAY)}.</p>
    </div>
  );
}

function MiniStat({
  label,
  amount,
  note,
  tone,
}: {
  label: string;
  amount: number;
  note: string;
  tone?: "sage" | "clay";
}) {
  return (
    <div className="rounded-2xl bg-card-2 px-4 py-4">
      <p className="text-xs font-medium tracking-wide text-mist">{label}</p>
      <p
        className={cn(
          "mt-1 font-serif text-2xl tracking-tight",
          tone === "sage" && "text-sage",
          tone === "clay" && "text-clay",
        )}
      >
        <CountUp value={amount} duration={520} />
      </p>
      <p className="mt-1 text-xs text-mist">{note}</p>
    </div>
  );
}

export function Analytics() {
  const [span, setSpan] = useState(6);
  const mode = useFreev((s) => s.mode);
  const month = useFreev((s) => s.month);
  const txs = useFreev((s) => s.txs);
  const flow = monthTotals(txs, mode, month);
  const before = monthTotals(txs, mode, previousMonth(month));
  const split = spentByCategory(txs, mode, month);
  const categoryTotal = split.reduce((sum, item) => sum + item.value, 0);
  const data = HISTORY.filter((item) => item.id <= month)
    .reverse()
    .slice(-span)
    .map((item) => ({ m: monthName(item.id, "short"), inn: item.inn, out: item.out }));
  // Headline movement, computed from the two months on screen.
  const innDelta = change(flow.inn, before.inn);
  const outDelta = change(flow.out, before.out);
  const rate = flow.inn ? (flow.rest / flow.inn) * 100 : 0;
  const monthShortName = monthName(month);

  return (
    <div className="space-y-8">
      <PageHead
        kicker="Analytique"
        title="Ce que le mois raconte"
        lede="Entrées, sorties, et les catégories qui pèsent — sur la période choisie."
        actions={
          <div
            className="flex gap-1 rounded-full bg-card-2 p-1"
            role="tablist"
            aria-label="Période"
          >
            {[3, 6].map((n) => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={span === n}
                onClick={() => setSpan(n)}
                className={
                  span === n
                    ? "pill-on h-9 rounded-full bg-copper px-4 text-sm font-medium text-copper-ink shadow-float"
                    : "h-9 rounded-full px-4 text-sm text-mist transition-colors duration-[var(--dur-1)] hover:text-ink"
                }
              >
                {n} mois
              </button>
            ))}
          </div>
        }
      />
      <section className="grid divide-y divide-rule border-y border-rule sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Stat
          label="Entrées"
          value={money(flow.inn)}
          note={innDelta === null ? "—" : `${pct(innDelta)} vs mois précédent`}
          tone="sage"
        />
        <Stat
          label="Sorties"
          value={money(flow.out)}
          note={outDelta === null ? "—" : `${pct(outDelta)} vs mois précédent`}
          tone="clay"
        />
        <Stat label="Épargne nette" value={money(flow.rest)} note={monthShortName} />
        <Stat
          label="Taux d’épargne"
          value={`${rate.toFixed(1).replace(".", ",")} %`}
          note="Part du net sur les entrées"
        />
      </section>
      <section>
        <h2 className="font-serif text-2xl">Flux mensuel</h2>
        <div className="mt-4">
          <FlowChart data={data} />
        </div>
      </section>
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Catégories</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {split.map((c) => {
              const share = categoryTotal > 0 ? (c.value / categoryTotal) * 100 : 0;
              return (
                <li key={c.name} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{c.name}</span>
                    <span className="shrink-0 tabular-nums">{money(c.value)}</span>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-2"
                    role="progressbar"
                    aria-label={`${c.name}, part des sorties`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(share)}
                  >
                    <div
                      className="h-full rounded-full bg-copper/80 transition-[width] duration-[var(--dur-3)]"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">
            {monthShortName} contre {monthName(previousMonth(month), "short")}
          </h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-mist">
              <tr>
                <th className="py-2 font-medium"> </th>
                <th className="py-2 font-medium">{monthName(month, "short")}</th>
                <th className="py-2 font-medium">{monthName(previousMonth(month), "short")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-rule">
                <td className="py-3">Entrées</td>
                <td className="tabular-nums">{money(flow.inn)}</td>
                <td className="tabular-nums text-mist">{money(before.inn)}</td>
              </tr>
              <tr className="border-t border-rule">
                <td className="py-3">Sorties</td>
                <td className="tabular-nums">{money(flow.out)}</td>
                <td className="tabular-nums text-mist">{money(before.out)}</td>
              </tr>
              <tr className="border-t border-rule">
                <td className="py-3">Net</td>
                <td className="tabular-nums text-sage">{money(flow.rest)}</td>
                <td className="tabular-nums text-mist">{money(before.rest)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function Business() {
  const invoices = useFreev((s) => s.invoices);
  const accounts = useFreev((s) => s.accounts);
  const txs = useFreev((s) => s.txs);
  const open = useFreev((s) => s.open);
  const mark = useFreev((s) => s.markInvoice);
  const pro = accounts.find((a) => a.id === "pro");
  const waiting = invoices.filter((i) => i.status !== "payée");
  const waitingSum = waiting.reduce((s, i) => s + i.amount, 0);
  // Real professional flows for the month being looked at, not a fixed table.
  const month = useFreev((s) => s.month);
  const flowsPro = monthTotals(txs, "pro", month);
  const billed = flowsPro.inn;
  const charges = flowsPro.out;

  return (
    <div className="space-y-8">
      <PageHead
        kicker="Activité professionnelle"
        title="Business"
        lede="Chiffre facturé, charges, et ce que les clients vous doivent encore."
        actions={
          <Button variant="primary" onClick={() => open({ name: "invoice" })}>
            Nouvelle facture
          </Button>
        }
      />
      {/*
        These four figures used to be typed in (8 640 / 3 120 / 5 520 / 12 480),
        so they never moved when a transaction changed. They are now derived
        from the month's professional rows and the pro account.
      */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "CA du mois",
            value: money(billed),
            note: "Encaissé sur le périmètre pro",
            tone: "",
          },
          {
            label: "Attendu",
            value: money(waitingSum),
            note: "Factures non payées",
            tone: "text-clay",
          },
          {
            label: "Charges",
            value: money(charges),
            note: "Sur le périmètre pro",
            tone: "text-clay",
          },
          {
            label: "Trésorerie",
            value: money(pro?.balance ?? 0),
            note: "Compte Qonto",
            tone: "text-sage",
          },
        ].map((k, index) => (
          <div
            key={k.label}
            {...stagger(index, 60)}
            className="rounded-2xl border border-rule bg-card/70 p-4"
          >
            <p className="text-xs font-medium tracking-wide text-mist">{k.label}</p>
            <p className={cn("mt-1 font-serif text-3xl tabular-nums tracking-tight", k.tone)}>
              {k.value}
            </p>
            {k.note ? <p className="mt-1 text-xs text-mist">{k.note}</p> : null}
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="chrome-pill rounded-3xl bg-card p-5">
          <h2 className="font-serif text-2xl tracking-tight">Clients</h2>
          <ul className="stagger mt-3 space-y-1">
            {(
              [
                ["Atelier Nord", "AN", "Payée · 2 400 €", true],
                [
                  "Studio Lina",
                  "SL",
                  waiting.some((i) => i.client === "Studio Lina")
                    ? "En attente · 1 800 €"
                    : "Payée · 1 800 €",
                  !waiting.some((i) => i.client === "Studio Lina"),
                ],
                ["Maison Brume", "MB", "Payée · 960 €", true],
              ] as [string, string, string, boolean][]
            ).map(([name, mark, last, ok], index) => (
              <li
                key={name}
                {...stagger(index, 60)}
                className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-[var(--dur-1)] hover:bg-card-2/50"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal/12 text-xs font-semibold text-teal">
                  {mark}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{name}</span>
                  <span className="text-xs text-mist">{last}</span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[11px] font-medium",
                    ok ? "bg-sage/15 text-sage" : "bg-copper/12 text-copper",
                  )}
                >
                  {ok ? "à jour" : "relance"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="chrome-pill rounded-3xl bg-card p-5">
          <h2 className="font-serif text-2xl tracking-tight">Factures</h2>
          <ul className="stagger mt-3 divide-y divide-rule">
            {invoices.map((inv, index) => {
              const paid = inv.status === "payée";
              return (
                <li key={inv.id} {...stagger(index, 80)} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="text-mist">{inv.number}</span> · {inv.client}
                      </p>
                      <p className="mt-0.5 text-xs text-mist">{dayLabel(inv.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular-nums">{money(inv.amount)}</p>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          paid
                            ? "bg-sage/15 text-sage"
                            : inv.status === "en retard"
                              ? "bg-clay/15 text-clay"
                              : "bg-copper/12 text-copper",
                        )}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                  {!paid ? (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => toast(useFreev.getState().remind(inv.id))}>
                        Relancer
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          mark(inv.id);
                          toast("Facture marquée payée");
                        }}
                      >
                        Marquer payée
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

export function Report() {
  const mode = useFreev((s) => s.mode);
  const month = useFreev((s) => s.month);
  const txs = useFreev((s) => s.txs);
  const profile = useFreev((s) => s.profile);
  const flow = monthTotals(txs, mode, month);
  const before = monthTotals(txs, mode, previousMonth(month));
  // Past months keep their category split from the journal where it exists.
  const split = spentByCategory(txs, mode, month);
  const label = monthName(month);
  const top = split.slice(0, 6);
  const netDelta = change(flow.rest, before.rest);
  const biggest = top[0];
  const share = biggest && flow.out > 0 ? Math.round((biggest.value / flow.out) * 100) : 0;
  const rate = flow.inn > 0 ? Math.round((flow.rest / flow.inn) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Rapport mensuel"
        title="Le mois, en une page"
        lede="Le même récit que le tableau de bord, mis en forme pour être relu ou transmis."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    {
                      mois: month,
                      entrees: flow.inn,
                      sorties: flow.out,
                      net: flow.rest,
                      tauxEpargne: rate,
                      categories: split,
                    },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `freev-${month}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast("Rapport exporté");
            }}
          >
            Exporter
          </Button>
        }
      />

      <article className="chrome-pill overflow-hidden rounded-3xl bg-card">
        {/* Masthead: the page should read like a statement, not a screen. */}
        <header className="border-b border-rule px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-copper">
                FREEV · {profile.name}
              </p>
              <h2 className="mt-2 font-serif text-4xl leading-none tracking-tight md:text-5xl">
                Livre de <span className="capitalize">{label}</span>
              </h2>
            </div>
            <p className="max-w-[13rem] text-right text-xs leading-relaxed text-mist">
              {flow.rows.length ? (
                <>
                  Établi sur {flow.rows.length} opération{flow.rows.length > 1 ? "s" : ""}
                </>
              ) : (
                <>Mois clos · total agrégé</>
              )}{" "}
              · périmètre{" "}
              {mode === "both" ? "personnel + pro" : mode === "pro" ? "professionnel" : "personnel"}
            </p>
          </div>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-mist">
            Les entrées du mois s’établissent à{" "}
            <strong className="font-medium text-ink">{money(flow.inn)}</strong>, les sorties à{" "}
            <strong className="font-medium text-ink">{money(flow.out)}</strong>. Le reste à vivre
            est de <strong className="font-medium text-ink">{money(flow.rest)}</strong>
            {rate > 0 ? `, soit ${rate} % des entrées gardés de côté` : null}
            {netDelta === null ? null : (
              <>
                {" "}
                — {netDelta >= 0 ? "en hausse" : "en baisse"} de{" "}
                <strong className="font-medium text-ink">{pct(Math.abs(netDelta))}</strong> sur{" "}
                {monthName(previousMonth(month), "short")}
              </>
            )}
            . La santé du mois reste à{" "}
            <strong className="font-medium text-ink">{SNAP[mode].health} sur 100</strong>.
          </p>
        </header>

        {/* The three figures, set as a ledger row. */}
        <dl className="grid divide-y divide-rule border-b border-rule sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {[
            { label: "Entrées", value: flow.inn, tone: "text-sage" },
            { label: "Sorties", value: flow.out, tone: "text-clay" },
            { label: "Net", value: flow.rest, tone: flow.rest >= 0 ? "text-sage" : "text-clay" },
          ].map((k) => (
            <div key={k.label} className="px-6 py-6 md:px-10">
              <dt className="text-xs font-medium tracking-wide text-mist">{k.label}</dt>
              <dd className={cn("mt-1 font-serif text-4xl tracking-tight", k.tone)}>
                <CountUp value={k.value} duration={700} />
              </dd>
            </div>
          ))}
        </dl>

        <Reveal className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <h3 className="font-serif text-2xl tracking-tight">Sorties par poste</h3>
            {top.length === 0 ? (
              <p className="mt-3 text-sm text-mist">
                Le détail par poste n’est tenu que pour le mois courant. Ce mois reste en agrégat.
              </p>
            ) : null}
            <ul className="mt-3 space-y-2">
              {top.map((c) => {
                const width = biggest ? Math.max((c.value / biggest.value) * 100, 3) : 0;
                return (
                  <li key={c.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate">{c.name}</span>
                      <span className="shrink-0 tabular-nums">{money(c.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card-2">
                      <div
                        className="h-full rounded-full bg-copper/80 transition-[width] duration-[var(--dur-4)] ease-[var(--ease-soft)]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="lg:col-span-5">
            <h3 className="font-serif text-2xl tracking-tight">À retenir</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {biggest ? (
                <li className="rounded-2xl bg-card-2/70 p-3">
                  <p className="text-xs text-mist">Poste le plus lourd</p>
                  <p className="mt-0.5">
                    {biggest.name} — <span className="tabular-nums">{money(biggest.value)}</span>,
                    soit {share} % des sorties du mois.
                  </p>
                </li>
              ) : null}
              <li className="rounded-2xl bg-card-2/70 p-3">
                <p className="text-xs text-mist">Taux d’épargne</p>
                <p className="mt-0.5">{rate} % des entrées restent disponibles en fin de mois.</p>
              </li>
              <li className="rounded-2xl bg-card-2/70 p-3">
                <p className="text-xs text-mist">Prochaine étape</p>
                <p className="mt-0.5">
                  Passer le contrôle mensuel pour fermer {label} sans rien laisser de côté.
                </p>
                <Link to="/controle" className="mt-1 inline-block text-sm text-copper">
                  Ouvrir le contrôle →
                </Link>
              </li>
            </ul>
          </aside>
        </Reveal>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-6 py-4 text-xs text-mist md:px-10">
          <span>FREEV · livre tenu localement · {profile.email}</span>
          <Link to="/transactions" className="text-copper">
            Voir le journal du mois
          </Link>
        </footer>
      </article>
    </div>
  );
}
