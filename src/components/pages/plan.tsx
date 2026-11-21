import { eachDayOfInterval, endOfMonth, format, getDay, parseISO, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Amount, Button, Empty, InlineInput, PageHead } from "@/components/ui";
import { useConfirmAction } from "@/components/confirm";
import { SCHEDULE, TODAY } from "@/lib/freev/data";
import { useFreev } from "@/lib/freev/store";
import { cn, money } from "@/lib/utils";
import { stagger } from "@/lib/stagger";

export function Planner() {
  const month = useFreev((s) => s.month);
  // The planner opens on the month the rest of the app is showing.
  const [cursor, setCursor] = useState(() => parseISO(`${month}-01`));
  // The month selector in the header and the planner stay in step: changing one
  // used to leave the other showing a different month.
  useEffect(() => setCursor(parseISO(`${month}-01`)), [month]);
  const open = useFreev((s) => s.open);
  const duplicated = useFreev((s) => s.duplicated);
  const accounts = useFreev((s) => s.accounts);
  const key = format(cursor, "yyyy-MM");
  const days = eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) });
  const lead = (getDay(startOfMonth(cursor)) + 6) % 7;
  const currentKey = TODAY.slice(0, 7);
  const todayDay = Number(TODAY.slice(8, 10));
  const showSchedule = key === currentKey || duplicated.includes(key);
  const balance = accounts.reduce((s, a) => s + a.balance, 0);
  const ahead = SCHEDULE.filter((s) => key !== currentKey || s.day >= todayDay).reduce(
    (s, item) => s + item.amount,
    0,
  );

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
          <p className="min-w-40 text-center font-serif text-2xl capitalize">
            {format(cursor, "MMMM yyyy", { locale: fr })}
          </p>
          <Button
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            Mois suivant
          </Button>
          {key === currentKey ? null : (
            <Button size="sm" onClick={() => setCursor(parseISO(`${currentKey}-01`))}>
              Aujourd’hui
            </Button>
          )}
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
              const today = key === currentKey && dom === todayDay;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => open({ name: "tx", date: format(d, "yyyy-MM-dd") })}
                  className="min-h-16 border-r border-b border-rule p-1 text-left hover:bg-card-2"
                >
                  <span
                    className={
                      today
                        ? "inline-flex size-6 items-center justify-center bg-copper text-xs text-copper-ink"
                        : "text-xs text-mist"
                    }
                  >
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
                    <span className="text-xs uppercase tracking-widest text-mist">
                      Jour {s.day}
                    </span>
                  </span>
                  <Amount value={s.amount} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-mist">
              Aucune échéance posée sur ce mois. Dupliquez le mois courant pour les reprendre.
            </p>
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
      <ul className="stagger divide-y divide-rule border-y border-rule">
        {plans.map((plan, index) => (
          <li
            key={plan.id}
            {...stagger(index)}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div>
              <p className="text-sm">{plan.name}</p>
              <p className="text-sm text-mist">{plan.detail}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-mist">{plan.status}</span>
              <span className="tabular-nums">{money(plan.amount)}</span>
              <Button size="sm" onClick={() => toggle(plan.id)}>
                {plan.status === "actif" ? "Pause" : "Activer"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border-l-2 border-copper pl-4">
          <p className="text-xs uppercase tracking-widest text-copper">Suggestion</p>
          <p className="mt-2 text-sm">
            Les abonnements pèsent sur le mois. Mettre Spotify en pause libère 11 € sans toucher au
            loyer.
          </p>
          <p className="mt-2 text-sm">
            Un virement automatique de 200 € reste possible le 30, après le salaire.
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            add({
              name: name.trim(),
              detail: "Plan créé à la main",
              amount: Number(amount) || 0,
              status: "actif",
            });
            setName("");
            toast("Plan ajouté");
          }}
        >
          <p className="text-xs uppercase tracking-widest text-mist">Nouveau plan</p>
          <InlineInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du plan"
            aria-label="Nom du plan"
          />
          <InlineInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant mensuel"
            inputMode="decimal"
            aria-label="Montant mensuel"
          />
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
  const confirm = useConfirmAction();
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
      <ul className="stagger grid gap-3 md:grid-cols-2">
        {goals.map((g, index) => {
          const ratio = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          const done = ratio >= 100;
          const left = Math.max(g.target - g.current, 0);
          return (
            <li
              key={g.id}
              {...stagger(index)}
              className="chrome-pill flex flex-col rounded-3xl bg-card p-5 transition-[transform,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-soft)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-2xl tracking-tight">{g.name}</p>
                  <p className="mt-0.5 text-xs text-mist">
                    {names[g.accountId] ?? "Compte"} ·{" "}
                    {format(parseISO(g.due), "MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium",
                    done ? "bg-sage/15 text-sage" : "bg-copper/10 text-copper",
                  )}
                >
                  {ratio} %
                </span>
              </div>

              <p className="mt-4 text-sm tabular-nums">
                <span className="font-serif text-3xl tracking-tight">{money(g.current)}</span>
                <span className="text-mist"> / {money(g.target)}</span>
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-card-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-[var(--dur-4)] ease-[var(--ease-soft)]",
                    done ? "bg-sage" : "bg-copper",
                  )}
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-mist">
                {done ? "Objectif atteint." : `Il reste ${money(left)} à mettre de côté.`}
              </p>

              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => open({ name: "goal", id: g.id })}>
                  Ajuster
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  onClick={() =>
                    confirm(
                      { title: `Retirer l’objectif « ${g.name} » ?`, confirmLabel: "Retirer" },
                      () => remove(g.id),
                    )
                  }
                >
                  Retirer
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {goals.length === 0 ? (
        <Empty
          title="Aucun objectif pour l’instant"
          body="Créez-en un pour suivre ce que vous mettez de côté, compte par compte."
        />
      ) : null}
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-card/70 p-4">
          <p className="text-xs font-medium tracking-wide text-mist">Capital restant</p>
          <p className="mt-1 font-serif text-3xl tabular-nums tracking-tight">{money(total)}</p>
        </div>
        <div className="rounded-2xl border border-rule bg-card/70 p-4">
          <p className="text-xs font-medium tracking-wide text-mist">Mensualités</p>
          <p className="mt-1 font-serif text-3xl tabular-nums tracking-tight">{money(monthly)}</p>
          <p className="mt-1 text-xs text-mist">par mois, toutes dettes confondues</p>
        </div>
      </div>
      <ul className="stagger space-y-3">
        {debts.map((d, index) => {
          const months = d.monthly > 0 ? Math.ceil(d.remaining / d.monthly) : null;
          return (
            <li
              key={d.id}
              {...stagger(index, 60)}
              className="chrome-pill rounded-3xl bg-card p-5 transition-[transform,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-soft)] hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="mt-0.5 text-xs text-mist">
                    {d.rate.toLocaleString("fr-FR")} % · échéance{" "}
                    {format(parseISO(d.end), "MMM yyyy", { locale: fr })}
                    {months ? ` · ${months} mensualités restantes` : null}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-3xl tabular-nums tracking-tight">
                    {money(d.remaining)}
                  </p>
                  <p className="text-xs text-mist">{money(d.monthly)} / mois</p>
                </div>
              </div>
              {d.remaining > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => pay(d.id)}>
                    Rembourser {money(d.monthly)}
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => open({ name: "debt", id: d.id })}
                  >
                    Modifier
                  </Button>
                </div>
              ) : (
                <p className="mt-4 inline-flex rounded-full bg-sage/15 px-2.5 py-1 text-xs font-medium text-sage">
                  Dette soldée
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {debts.length === 0 ? (
        <Empty
          title="Aucune dette en cours"
          body="Rien à rembourser : ajoutez un crédit seulement s’il en reste un."
        />
      ) : null}
    </div>
  );
}
