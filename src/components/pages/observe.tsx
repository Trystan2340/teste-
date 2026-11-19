import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Clock, Flame, Repeat, TrendingUp } from "lucide-react";
import { FlowChart, SplitChart } from "@/components/charts";
import { Amount, Button, PageHead, Stat } from "@/components/ui";
import { flows, spentByCategory } from "@/lib/freev/calc";
import { HISTORY, SCHEDULE, SERIES, SNAP, TODAY, inScope } from "@/lib/freev/data";
import { useFreev } from "@/lib/freev/store";
import { dayLabel, money, pct, cn } from "@/lib/utils";

export function Dashboard() {
  const mode = useFreev((s) => s.mode);
  const month = useFreev((s) => s.month);
  const txs = useFreev((s) => s.txs);
  const accounts = useFreev((s) => s.accounts);
  const open = useFreev((s) => s.open);
  const activeId = useFreev((s) => s.activeAccountId);
  const setActive = useFreev((s) => s.setActiveAccount);
  const flow = flows(txs, mode, month);
  const visible = accounts.filter((a) => inScope(a.scope, mode));
  const balance = visible.reduce((s, a) => s + a.balance, 0);
  const recent = [...txs]
    .filter((t) => inScope(t.scope, mode) && t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  const split = spentByCategory(txs, mode, month);
  const snap = SNAP[mode];
  const monthName = format(parseISO(`${month}-01`), "MMMM", { locale: fr });
  const todayDay = Number(TODAY.slice(8, 10));
  const isCurrent = month === TODAY.slice(0, 7);
  const scopeLabel = mode === "pro" ? "pro" : mode === "perso" ? "personnel" : "global";

  return (
    <div className="space-y-5">
      <PageHead
        kicker={`${format(parseISO(`${month}-01`), "MMMM yyyy", { locale: fr })} · livre`}
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
          <p className="mt-2 font-serif text-5xl tabular-nums tracking-tight">{money(balance)}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sage/12 px-2.5 py-1 text-sm text-sage">
            <TrendingUp className="size-3.5" strokeWidth={2} />
            {pct(snap.delta)}
            <span className="text-mist">vs mois dernier</span>
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
          <MiniStat label="Entrées" value={money(flow.inn)} note="Mois en cours" tone="sage" />
          <MiniStat label="Sorties" value={money(flow.out)} note="Mois en cours" tone="clay" />
          <MiniStat label="Reste à vivre" value={money(flow.rest)} note="Entrées − sorties" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="chrome-pill rounded-3xl bg-card p-5">
            <h2 className="font-serif text-2xl tracking-tight">Échéancier</h2>
            <ul className="mt-3 divide-y divide-rule">
              {SCHEDULE.map((item) => {
                const passed = isCurrent && item.day < todayDay;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
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
                          {monthName}
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
          <div className="chrome-pill rounded-3xl bg-card p-5">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-2xl tracking-tight">Activité récente</h2>
              <Link to="/transactions" className="text-sm text-copper">
                Journal
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-rule">
              {recent.length === 0 ? (
                <li className="py-6 text-sm text-mist">Aucune opération ce mois.</li>
              ) : null}
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
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
        </div>
        <div className="space-y-5 lg:col-span-5">
          <div className="chrome-pill rounded-3xl bg-card p-5">
            <p className="text-xs font-medium tracking-wide text-mist">Santé du mois</p>
            <p className="mt-1 font-serif text-6xl tabular-nums tracking-tight">{snap.health}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-mist">
              Stable. Une charge d’énergie sort du rang, le reste suit le budget.
            </p>
          </div>
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
            <ul className="mt-3 space-y-1">
              {visible.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActive(a.id)}
                    title={a.id === activeId ? "Compte actif" : "Utiliser ce compte"}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors",
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
          <div className="chrome-pill rounded-3xl bg-card p-5">
            <h2 className="font-serif text-2xl tracking-tight">Répartition des sorties</h2>
            <SplitChart data={split} />
          </div>
          <div className="rounded-3xl bg-copper/8 p-5 ring-1 ring-copper/15">
            <p className="text-xs font-medium tracking-wide text-copper">À surveiller</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/analytique"
                  className="group flex items-start gap-2 rounded-xl p-1 -m-1 transition-colors hover:bg-copper/10"
                >
                  <Flame className="mt-0.5 size-4 shrink-0 text-clay" strokeWidth={1.8} />
                  <span className="text-sm">
                    EDF a augmenté de 18 % par rapport à la moyenne.
                    <span className="mt-0.5 block text-xs text-copper opacity-0 transition-opacity group-hover:opacity-100">
                      Voir l’analytique →
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/abonnements"
                  className="group flex items-start gap-2 rounded-xl p-1 -m-1 transition-colors hover:bg-copper/10"
                >
                  <Repeat className="mt-0.5 size-4 shrink-0 text-copper" strokeWidth={1.8} />
                  <span className="text-sm">
                    2 abonnements se renouvellent cette semaine.
                    <span className="mt-0.5 block text-xs text-copper opacity-0 transition-opacity group-hover:opacity-100">
                      Gérer les abonnements →
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <p className="text-xs text-mist">Date de référence {dayLabel(TODAY)}.</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "sage" | "clay";
}) {
  return (
    <div className="rounded-2xl bg-card-2 px-4 py-4">
      <p className="text-xs font-medium tracking-wide text-mist">{label}</p>
      <p
        className={cn(
          "mt-1 font-serif text-2xl tabular-nums tracking-tight",
          tone === "sage" && "text-sage",
          tone === "clay" && "text-clay",
        )}
      >
        {value}
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
  const flow = flows(txs, mode, month);
  const split = spentByCategory(txs, mode, month);
  const data = SERIES.slice(-span);
  const rate = flow.inn ? (flow.rest / flow.inn) * 100 : 0;

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
                    ? "h-9 rounded-full bg-copper px-4 text-sm font-medium text-copper-ink shadow-float"
                    : "h-9 rounded-full px-4 text-sm text-mist transition-colors hover:text-ink"
                }
              >
                {n} mois
              </button>
            ))}
          </div>
        }
      />
      <section className="grid border-y border-rule sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Entrées" value={money(flow.inn)} note={pct(6.4)} tone="sage" />
        <Stat label="Sorties" value={money(flow.out)} note={pct(-2.1)} tone="sage" />
        <Stat label="Épargne nette" value={money(flow.rest)} note="Novembre" />
        <Stat
          label="Taux d’épargne"
          value={`${rate.toFixed(1).replace(".", ",")} %`}
          note="Du mois"
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
            {split.map((c) => (
              <li key={c.name} className="flex items-center justify-between py-3 text-sm">
                <span>{c.name}</span>
                <span className="tabular-nums">{money(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Novembre contre octobre</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-mist">
              <tr>
                <th className="py-2 font-medium"> </th>
                <th className="py-2 font-medium">Nov.</th>
                <th className="py-2 font-medium">Oct.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-rule">
                <td className="py-3">Entrées</td>
                <td className="tabular-nums">{money(HISTORY[0].inn)}</td>
                <td className="tabular-nums text-mist">{money(HISTORY[1].inn)}</td>
              </tr>
              <tr className="border-t border-rule">
                <td className="py-3">Sorties</td>
                <td className="tabular-nums">{money(HISTORY[0].out)}</td>
                <td className="tabular-nums text-mist">{money(HISTORY[1].out)}</td>
              </tr>
              <tr className="border-t border-rule">
                <td className="py-3">Net</td>
                <td className="tabular-nums text-sage">{money(HISTORY[0].inn - HISTORY[0].out)}</td>
                <td className="tabular-nums text-mist">{money(HISTORY[1].inn - HISTORY[1].out)}</td>
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
  const open = useFreev((s) => s.open);
  const mark = useFreev((s) => s.markInvoice);
  const pro = accounts.find((a) => a.id === "pro");
  const waiting = invoices.filter((i) => i.status !== "payée");

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
      <section className="grid border-y border-rule sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="CA du mois" value={money(8640)} note="Facturé" />
        <Stat label="Charges" value={money(3120)} note="Estimées" tone="clay" />
        <Stat label="Résultat" value={money(5520)} note="Avant impôt" tone="sage" />
        <Stat
          label="Trésorerie"
          value={money(12480)}
          note={pro ? `dont Qonto ${money(pro.balance)}` : ""}
        />
      </section>
      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Clients</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {[
              ["Atelier Nord", "AN", "Payée · 2 400 €"],
              [
                "Studio Lina",
                "SL",
                waiting.some((i) => i.client === "Studio Lina")
                  ? "En attente · 1 800 €"
                  : "Payée · 1 800 €",
              ],
              ["Maison Brume", "MB", "Payée · 960 €"],
            ].map(([name, mark, last]) => (
              <li key={name} className="flex items-center gap-3 py-3">
                <span className="inline-flex size-10 items-center justify-center border border-rule font-serif text-sm">
                  {mark}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{name}</span>
                  <span className="text-xs text-mist">{last}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Factures</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm">
                    {inv.number} · {inv.client}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-mist">
                    {dayLabel(inv.date)} · {inv.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{money(inv.amount)}</span>
                  {inv.status !== "payée" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          toast(useFreev.getState().remind(inv.id));
                        }}
                      >
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
                        Payée
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
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
  const flow = flows(txs, mode, month);
  const split = spentByCategory(txs, mode, month);
  return (
    <div className="space-y-8">
      <PageHead
        kicker="Rapport mensuel"
        title="Novembre, en une page"
        lede="Le même récit que le tableau de bord, mis en forme pour être relu ou transmis."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    { mois: "2026-11", entrees: flow.inn, sorties: flow.out, categories: split },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "freev-novembre-2026.json";
              a.click();
              URL.revokeObjectURL(url);
              toast("Rapport exporté");
            }}
          >
            Exporter
          </Button>
        }
      />
      <article className="border border-rule p-6 md:p-10">
        <p className="text-xs uppercase tracking-widest text-copper">FREEV · Camille Morel</p>
        <h2 className="mt-3 font-serif text-4xl">Livre de novembre</h2>
        <p className="mt-4 max-w-2xl text-sm text-mist">
          Les entrées du mois s’établissent à {money(flow.inn)}, les sorties à {money(flow.out)}. Le
          reste à vivre est de {money(flow.rest)}. La santé du mois reste à {SNAP[mode].health}.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-widest text-mist">Entrées</dt>
            <dd className="font-serif text-3xl">{money(flow.inn)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-mist">Sorties</dt>
            <dd className="font-serif text-3xl">{money(flow.out)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-mist">Net</dt>
            <dd className="font-serif text-3xl">{money(flow.rest)}</dd>
          </div>
        </dl>
        <h3 className="mt-10 font-serif text-2xl">Sorties par poste</h3>
        <ul className="mt-3 divide-y divide-rule">
          {split.map((c) => (
            <li key={c.name} className="flex justify-between py-2 text-sm">
              <span>{c.name}</span>
              <span className="tabular-nums">{money(c.value)}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
