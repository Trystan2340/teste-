import { Link } from "@tanstack/react-router";
import { Pencil, ScanLine, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Amount, Button, Empty, PageHead } from "@/components/ui";
import { useConfirmAction } from "@/components/confirm";
import { FlowChart } from "@/components/charts";
import { HISTORY, SERIES, inScope, type TxKind } from "@/lib/freev/data";
import { useFreev } from "@/lib/freev/store";
import { dayLabel, money } from "@/lib/utils";

export function Transactions() {
  const txs = useFreev((s) => s.txs);
  const accounts = useFreev((s) => s.accounts);
  const mode = useFreev((s) => s.mode);
  const month = useFreev((s) => s.month);
  const open = useFreev((s) => s.open);
  const remove = useFreev((s) => s.removeTx);
  const confirm = useConfirmAction();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("toutes");
  const catOptions = useMemo(() => ["toutes", ...new Set(txs.map((t) => t.category))], [txs]);
  // Category options must survive the category filter, otherwise picking one
  // leaves that category as the only choice left in the list.
  const [account, setAccount] = useState("tous");
  const [kind, setKind] = useState<"tous" | TxKind>("tous");

  const rows = txs
    .filter((t) => inScope(t.scope, mode))
    .filter((t) => t.date.startsWith(month))
    .filter((t) => (cat === "toutes" ? true : t.category === cat))
    .filter((t) => (account === "tous" ? true : t.accountId === account))
    .filter((t) => (kind === "tous" ? true : t.kind === kind))
    .filter((t) => !q || `${t.label} ${t.category}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));
  const sum = rows.filter((t) => t.kind !== "transfer").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Opérations"
        title="Transactions"
        lede="Le journal filtré selon le périmètre choisi en haut de page."
        actions={
          <>
            <Link
              to="/scanner"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-rule bg-card px-4 text-sm font-medium text-ink shadow-float transition-colors duration-[var(--dur-1)] hover:border-copper/30 hover:text-copper active:scale-[0.98]"
            >
              <ScanLine className="size-4" strokeWidth={1.8} />
              Scanner
            </Link>
            <Button variant="primary" onClick={() => open({ name: "tx" })}>
              Nouvelle opération
            </Button>
          </>
        }
      />
      <div className="grid gap-2 rounded-2xl border border-rule bg-card/60 p-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Rechercher un libellé</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mist" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full rounded-full border border-transparent bg-card-2/70 pr-3 pl-9 text-sm text-ink outline-none transition-colors duration-[var(--dur-1)] placeholder:text-mist focus:border-copper/40"
            placeholder="Rechercher un libellé…"
          />
        </label>
        {[
          { label: "Catégorie", value: cat, set: setCat, options: catOptions },
          {
            label: "Compte",
            value: account,
            set: setAccount,
            options: ["tous", ...accounts.map((a) => a.id)],
          },
        ].map((f) => (
          <label key={f.label} className="block">
            <span className="sr-only">{f.label}</span>
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-full border border-transparent bg-card-2/70 px-3 text-sm text-ink outline-none transition-colors duration-[var(--dur-1)] focus:border-copper/40"
            >
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {f.label === "Compte"
                    ? o === "tous"
                      ? "tous les comptes"
                      : (accounts.find((a) => a.id === o)?.name ?? o)
                    : o}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="block">
          <span className="sr-only">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="h-10 w-full cursor-pointer rounded-full border border-transparent bg-card-2/70 px-3 text-sm text-ink outline-none transition-colors duration-[var(--dur-1)] focus:border-copper/40"
          >
            <option value="tous">tous les types</option>
            <option value="expense">dépense</option>
            <option value="income">revenu</option>
            <option value="transfer">virement</option>
          </select>
        </label>
        <Button
          variant="quiet"
          className="h-10 w-full px-3 text-copper disabled:text-mist md:w-auto md:text-right"
          onClick={() => {
            setQ("");
            setCat("toutes");
            setAccount("tous");
            setKind("tous");
          }}
          disabled={!q && cat === "toutes" && account === "tous" && kind === "tous"}
        >
          Réinitialiser
        </Button>
      </div>
      <p className="text-sm text-mist">
        {rows.length} ligne{rows.length > 1 ? "s" : ""} · sous-total {money(sum)}
      </p>
      {rows.length === 0 ? (
        <Empty
          title="Journal vide"
          body="Aucune opération ne correspond. Élargissez les filtres ou ajoutez une ligne."
        />
      ) : (
        <>
          {/* Phones get cards: a six-column table is never readable at 390 px. */}
          <ul className="space-y-2 md:hidden">
            {rows.map((t) => (
              <li
                key={t.id}
                className="rounded-2xl border border-rule bg-card/70 p-3 transition-[transform,border-color] duration-[var(--dur-1)] ease-[var(--ease-soft)] hover:-translate-y-px hover:border-copper/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.label}</p>
                    <p className="mt-0.5 text-xs text-mist">
                      {dayLabel(t.date)} · {t.category}
                    </p>
                  </div>
                  <Amount value={t.amount} kind={t.kind} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-2 py-0.5 text-[11px] text-mist">
                    {accounts.find((a) => a.id === t.accountId)?.name}
                    {t.pending ? <span className="text-copper"> · prévu</span> : null}
                  </span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`Modifier ${t.label}`}
                      onClick={() => open({ name: "tx", editId: t.id })}
                      className="inline-flex size-8 items-center justify-center rounded-full text-mist hover:bg-card-2 hover:text-copper"
                    >
                      <Pencil className="size-4" strokeWidth={1.7} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${t.label}`}
                      onClick={() =>
                        confirm(
                          {
                            title: `Supprimer « ${t.label} » ?`,
                            description: "Le solde du compte sera recalculé.",
                          },
                          () => remove(t.id),
                        )
                      }
                      className="inline-flex size-8 items-center justify-center rounded-full text-mist hover:bg-rose/12 hover:text-rose"
                    >
                      <Trash2 className="size-4" strokeWidth={1.7} />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-mist">
                <tr>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Libellé</th>
                  <th className="py-2 font-medium">Catégorie</th>
                  <th className="py-2 font-medium">Compte</th>
                  <th className="py-2 text-right font-medium">Montant</th>
                  <th className="py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    className="group/row border-t border-rule transition-colors duration-[var(--dur-1)] hover:bg-card/50 [&>td]:py-3"
                  >
                    <td className="whitespace-nowrap tabular-nums">{dayLabel(t.date)}</td>
                    <td className="max-w-[22rem]">
                      {t.label}
                      {t.pending ? (
                        <span className="ml-2 rounded-full bg-copper/12 px-1.5 py-0.5 text-[11px] text-copper">
                          prévu
                        </span>
                      ) : null}
                    </td>
                    <td className="text-mist">{t.category}</td>
                    <td className="text-mist">
                      {accounts.find((a) => a.id === t.accountId)?.name}
                    </td>
                    <td className="text-right">
                      <Amount value={t.amount} kind={t.kind} />
                    </td>
                    <td className="pl-4">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus-within:opacity-100">
                        <button
                          type="button"
                          aria-label={`Modifier ${t.label}`}
                          title="Modifier"
                          onClick={() => open({ name: "tx", editId: t.id })}
                          className="inline-flex size-8 items-center justify-center rounded-full text-mist transition-colors duration-[var(--dur-1)] hover:bg-card-2 hover:text-copper"
                        >
                          <Pencil className="size-4" strokeWidth={1.7} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer ${t.label}`}
                          title="Supprimer"
                          onClick={() =>
                            confirm(
                              {
                                title: `Supprimer « ${t.label} » ?`,
                                description: "Le solde du compte sera recalculé.",
                              },
                              () => remove(t.id),
                            )
                          }
                          className="inline-flex size-8 items-center justify-center rounded-full text-mist transition-colors duration-[var(--dur-1)] hover:bg-rose/12 hover:text-rose"
                        >
                          <Trash2 className="size-4" strokeWidth={1.7} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function Recurring() {
  const txs = useFreev((s) => s.txs);
  const open = useFreev((s) => s.open);
  const remove = useFreev((s) => s.removeTx);
  const confirm = useConfirmAction();
  const rows = txs.filter((t) => t.recurring);
  const out = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const inn = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Opérations"
        title="Récurrences"
        lede="Ce qui revient chaque mois : loyer, énergie, abonnements, prélèvements."
        actions={
          <Button variant="primary" onClick={() => open({ name: "recurrence" })}>
            Nouvelle récurrence
          </Button>
        }
      />
      <p className="text-sm text-mist">
        Sorties récurrentes {money(out)} · revenus récurrents {money(inn)}
      </p>
      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm">{t.label}</p>
              <p className="text-xs uppercase tracking-widest text-mist">
                {t.category} · jour {Number(t.date.slice(8, 10))} ·{" "}
                {t.scope === "pro" ? "pro" : "perso"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Amount value={t.amount} kind={t.kind} />
              <Button size="sm" onClick={() => open({ name: "recurrence", id: t.id })}>
                Modifier
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  confirm(
                    {
                      title: `Retirer la récurrence « ${t.label} » ?`,
                      description: "Les opérations déjà passées ne bougent pas.",
                      confirmLabel: "Retirer",
                    },
                    () => remove(t.id),
                  )
                }
              >
                Retirer
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HistoryPage() {
  const today = useFreev((s) => s.month);
  const setMonth = useFreev((s) => s.setMonth);
  const [id, setId] = useState(today);
  const current = HISTORY.find((h) => h.id === id) ?? HISTORY[0];
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Opérations"
        title="Historique"
        lede="Six mois de flux. Le mois courant ouvre le journal détaillé."
      />
      <FlowChart data={[...SERIES]} />
      <div className="grid gap-6 lg:grid-cols-12">
        <ul className="divide-y divide-rule border-y border-rule lg:col-span-5">
          {HISTORY.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => {
                  setId(h.id);
                  // Picking a month in the history also moves the whole app.
                  setMonth(h.id);
                }}
                className="flex w-full items-center justify-between py-3 text-left"
              >
                <span className={h.id === id ? "text-ink" : "text-mist"}>{h.label}</span>
                <span className="tabular-nums text-sm">{money(h.inn - h.out)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border border-rule p-5 lg:col-span-7">
          <p className="text-xs uppercase tracking-widest text-copper">{current.label}</p>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-mist">Entrées</dt>
              <dd className="font-serif text-2xl">{money(current.inn)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-mist">Sorties</dt>
              <dd className="font-serif text-2xl">{money(current.out)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-mist">Net</dt>
              <dd className="font-serif text-2xl">{money(current.inn - current.out)}</dd>
            </div>
          </dl>
          {current.id === today ? (
            <Link
              to="/transactions"
              className="mt-6 inline-block text-xs uppercase tracking-widest text-copper"
            >
              Ouvrir le journal de {current.label.split(" ")[0].toLowerCase()}
            </Link>
          ) : (
            <p className="mt-6 text-sm text-mist">
              Le détail ligne à ligne n’est tenu que pour le mois courant. Les autres restent en
              agrégat.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
