import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Amount, Button, Empty, PageHead } from "@/components/ui";
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
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("toutes");
  const [account, setAccount] = useState("tous");
  const [kind, setKind] = useState<"tous" | TxKind>("tous");

  const cats = useMemo(() => ["toutes", ...new Set(txs.map((t) => t.category))], [txs]);
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
            <Link to="/scanner" className="inline-flex h-11 items-center border border-rule px-4 text-xs uppercase tracking-widest">
              Scanner
            </Link>
            <Button variant="primary" onClick={() => open({ name: "tx" })}>
              Nouvelle opération
            </Button>
          </>
        }
      />
      <div className="grid gap-3 border-y border-rule py-4 md:grid-cols-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Recherche</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 text-sm outline-none" placeholder="Libellé" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Catégorie</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 text-sm">
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Compte</span>
          <select value={account} onChange={(e) => setAccount(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 text-sm">
            <option value="tous">tous</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="mt-1 w-full border-b border-rule bg-transparent py-2 text-sm">
            <option value="tous">tous</option>
            <option value="expense">dépense</option>
            <option value="income">revenu</option>
            <option value="transfer">virement</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-mist">
        {rows.length} ligne{rows.length > 1 ? "s" : ""} · sous-total {money(sum)}
      </p>
      {rows.length === 0 ? (
        <Empty title="Journal vide" body="Aucune opération ne correspond. Élargissez les filtres ou ajoutez une ligne." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-mist">
              <tr>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Libellé</th>
                <th className="py-2 font-medium">Catégorie</th>
                <th className="py-2 font-medium">Compte</th>
                <th className="py-2 text-right font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-rule">
                  <td className="py-3 whitespace-nowrap">{dayLabel(t.date)}</td>
                  <td className="py-3">
                    {t.label}
                    {t.pending ? <span className="ml-2 text-xs uppercase tracking-widest text-copper">prévu</span> : null}
                  </td>
                  <td className="py-3 text-mist">{t.category}</td>
                  <td className="py-3 text-mist">{accounts.find((a) => a.id === t.accountId)?.name}</td>
                  <td className="py-3 text-right">
                    <Amount value={t.amount} kind={t.kind} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Recurring() {
  const txs = useFreev((s) => s.txs);
  const open = useFreev((s) => s.open);
  const remove = useFreev((s) => s.removeTx);
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
                {t.category} · jour {Number(t.date.slice(8, 10))} · {t.scope === "pro" ? "pro" : "perso"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Amount value={t.amount} kind={t.kind} />
              <Button size="sm" onClick={() => open({ name: "recurrence", id: t.id })}>
                Modifier
              </Button>
              <Button size="sm" onClick={() => remove(t.id)}>
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
  const [id, setId] = useState(HISTORY[0].id);
  const current = HISTORY.find((h) => h.id === id) ?? HISTORY[0];
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Opérations"
        title="Historique"
        lede="Six mois de flux. Novembre ouvre le journal détaillé."
      />
      <FlowChart data={[...SERIES]} />
      <div className="grid gap-6 lg:grid-cols-12">
        <ul className="divide-y divide-rule border-y border-rule lg:col-span-5">
          {HISTORY.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => setId(h.id)} className="flex w-full items-center justify-between py-3 text-left">
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
          {current.id === "2026-11" ? (
            <Link to="/transactions" className="mt-6 inline-block text-xs uppercase tracking-widest text-copper">
              Ouvrir le journal de novembre
            </Link>
          ) : (
            <p className="mt-6 text-sm text-mist">Le détail ligne à ligne est tenu pour novembre. Les mois précédents restent en agrégat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
