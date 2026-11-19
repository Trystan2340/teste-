import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Amount, Button, PageHead } from "@/components/ui";
import { SCHEDULE } from "@/lib/freev/data";
import { useFreev } from "@/lib/freev/store";
import { money } from "@/lib/utils";

export function Planner() {
  const [cursor, setCursor] = useState(new Date(2026, 10, 1));
  const open = useFreev((s) => s.open);
  const duplicated = useFreev((s) => s.duplicated);
  const accounts = useFreev((s) => s.accounts);
  const key = format(cursor, "yyyy-MM");
  const days = eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) });
  const lead = (getDay(startOfMonth(cursor)) + 6) % 7;
  const showSchedule = key === "2026-11" || duplicated.includes(key);
  const balance = accounts.reduce((s, a) => s + a.balance, 0);
  const ahead = SCHEDULE.filter((s) => key !== "2026-11" || s.day >= 19).reduce((s, item) => s + item.amount, 0);

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Planification"
        title="Planner"
        lede="Le mois posé à plat : ce qui est passé, ce qui arrive, le solde projeté."
        actions={
          <>
            <Button onClick={() => open({ name: "budget" })}>Budget</Button>
            <Button onClick={() => open({ name: "duplicate" })}>Dupliquer le mois</Button>
            <Button variant="primary" onClick={() => open({ name: "tx" })}>
              Nouvelle opération
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            Mois précédent
          </Button>
          <p className="min-w-40 text-center font-serif text-2xl capitalize">{format(cursor, "MMMM yyyy", { locale: fr })}</p>
          <Button size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            Mois suivant
          </Button>
        </div>
        <p className="text-sm text-mist">
          Solde projeté {money(balance + (showSchedule ? ahead : 0))}
          {duplicated.includes(key) ? " · mois dupliqué" : ""}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="grid grid-cols-7 text-center text-xs uppercase tracking-widest text-mist">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t border-l border-rule">
            {Array.from({ length: lead }).map((_, i) => (
              <div key={`e${i}`} className="min-h-16 border-r border-b border-rule bg-card-2" />
            ))}
            {days.map((d) => {
              const dom = d.getDate();
              const marks = showSchedule ? SCHEDULE.filter((s) => s.day === dom) : [];
              const today = key === "2026-11" && dom === 19;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => open({ name: "tx", date: format(d, "yyyy-MM-dd") })}
                  className="min-h-16 border-r border-b border-rule p-1 text-left hover:bg-card-2"
                >
                  <span className={today ? "inline-flex size-6 items-center justify-center bg-copper text-xs text-copper-ink" : "text-xs text-mist"}>
                    {dom}
                  </span>
                  {marks.map((m) => (
                    <span key={m.id} className="mt-1 block truncate text-xs text-copper">
                      {m.label}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-5">
          <h2 className="font-serif text-2xl">Échéances</h2>
          {showSchedule ? (
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {SCHEDULE.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <span>
                    <span className="block text-sm">{s.label}</span>
                    <span className="text-xs uppercase tracking-widest text-mist">Jour {s.day}</span>
                  </span>
                  <Amount value={s.amount} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-mist">Aucune échéance posée sur ce mois. Dupliquez novembre pour les reprendre.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => open({ name: "opening" })}>
              Solde de départ
            </Button>
            <Button size="sm" onClick={() => open({ name: "transfer" })}>
              Entre comptes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Smart() {
  const plans = useFreev((s) => s.plans);
  const toggle = useFreev((s) => s.togglePlan);
  const add = useFreev((s) => s.addPlan);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("100");
  return (
    <div className="space-y-8">
      <PageHead
        kicker="Planification"
        title="Smart"
        lede="Des règles simples qui déplacent l’argent avant que vous ayez à y penser."
      />
      <ul className="divide-y divide-rule border-y border-rule">
        {plans.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm">{p.name}</p>
              <p className="text-sm text-mist">{p.detail}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-mist">{p.status}</span>
              <span className="tabular-nums">{money(p.amount)}</span>
              <Button size="sm" onClick={() => toggle(p.id)}>
                {p.status === "actif" ? "Pause" : "Activer"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border-l-2 border-copper pl-4">
          <p className="text-xs uppercase tracking-widest text-copper">Suggestion</p>
          <p className="mt-2 text-sm">Les abonnements pèsent sur le mois. Mettre Spotify en pause libère 11 € sans toucher au loyer.</p>
          <p className="mt-2 text-sm">Un virement automatique de 200 € reste possible le 30, après le salaire.</p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            add({ name: name.trim(), detail: "Plan créé à la main", amount: Number(amount) || 0, status: "actif" });
            setName("");
            toast("Plan ajouté");
          }}
        >
          <p className="text-xs uppercase tracking-widest text-mist">Nouveau plan</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none" />
          <Button type="submit" variant="primary">
            Créer le plan
          </Button>
        </form>
      </section>
    </div>
  );
}

export function Savings() {
  const goals = useFreev((s) => s.goals);
  const open = useFreev((s) => s.open);
  const remove = useFreev((s) => s.removeGoal);
  const accounts = useFreev((s) => s.accounts);
  const names = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a.name])), [accounts]);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Planification"
        title="Épargne"
        lede="Chaque objectif a une cible, une échéance, et le compte qui le porte."
        actions={
          <Button variant="primary" onClick={() => open({ name: "goal" })}>
            Nouvel objectif
          </Button>
        }
      />
      <ul className="space-y-6">
        {goals.map((g) => {
          const ratio = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          return (
            <li key={g.id} className="border-b border-rule pb-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl">{g.name}</p>
                  <p className="text-xs uppercase tracking-widest text-mist">
                    {names[g.accountId] ?? "Compte"} · échéance {g.due}
                  </p>
                </div>
                <p className="tabular-nums">
                  {money(g.current)} <span className="text-mist">/ {money(g.target)}</span>
                </p>
              </div>
              <div className="mt-3 h-1 bg-card-2">
                <div className="h-1 bg-copper" style={{ width: `${ratio}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => open({ name: "goal", id: g.id })}>
                  Ajuster
                </Button>
                <Button size="sm" onClick={() => remove(g.id)}>
                  Retirer
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Debts() {
  const debts = useFreev((s) => s.debts);
  const open = useFreev((s) => s.open);
  const pay = useFreev((s) => s.payDebt);
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  const monthly = debts.reduce((s, d) => s + d.monthly, 0);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Planification"
        title="Dettes"
        lede="Ce qu’il reste à rembourser, et le rythme mensuel."
        actions={
          <Button variant="primary" onClick={() => open({ name: "debt" })}>
            Nouvelle dette
          </Button>
        }
      />
      <p className="text-sm text-mist">
        Reste {money(total)} · mensualités {money(monthly)}
      </p>
      <ul className="divide-y divide-rule border-y border-rule">
        {debts.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm">{d.name}</p>
              <p className="text-xs uppercase tracking-widest text-mist">
                {d.rate.toLocaleString("fr-FR")} % · fin {d.end} · {money(d.monthly)} / mois
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl tabular-nums">{money(d.remaining)}</span>
              <Button size="sm" onClick={() => pay(d.id)}>
                Rembourser
              </Button>
              <Button size="sm" onClick={() => open({ name: "debt", id: d.id })}>
                Modifier
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
