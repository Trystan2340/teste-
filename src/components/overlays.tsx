import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Field, Select, Toggle } from "@/components/ui";
import { CATEGORIES, LOGOS, SCHEDULE, TODAY, type Scope, type TxKind } from "@/lib/freev/data";
import { useFreev } from "@/lib/freev/store";
import { uid } from "@/lib/utils";

export function Overlays() {
  const dialog = useFreev((s) => s.dialog);
  if (!dialog) return null;
  if (dialog.name === "tx") return <TxDialog />;
  if (dialog.name === "duplicate") return <DuplicateDialog />;
  if (dialog.name === "budget") return <BudgetDialog />;
  if (dialog.name === "opening") return <OpeningDialog />;
  if (dialog.name === "transfer") return <TransferDialog />;
  if (dialog.name === "goal") return <GoalDialog id={dialog.id} />;
  if (dialog.name === "debt") return <DebtDialog id={dialog.id} />;
  if (dialog.name === "accounts") return <AccountsDialog />;
  if (dialog.name === "pick-account") return <PickAccountDialog />;
  if (dialog.name === "recurrence") return <RecurrenceDialog id={dialog.id} />;
  if (dialog.name === "trial") return <TrialDialog />;
  if (dialog.name === "invoice") return <InvoiceDialog />;
  if (dialog.name === "wipe") return <WipeDialog />;
  return null;
}

function Modal({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  const open = useFreev((s) => s.open);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <button type="button" aria-label="Fermer" className="veil absolute inset-0" onClick={() => open(null)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-screen w-full overflow-y-auto rounded-t-3xl border border-rule bg-card p-5 shadow-lift sm:max-w-lg sm:rounded-3xl sm:p-6"
      >
        <p className="text-xs uppercase tracking-widest text-copper">Journal</p>
        <h2 className="mt-1 font-serif text-3xl">{title}</h2>
        {lede ? <p className="mt-2 text-sm text-mist">{lede}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function KindSwitch({ value, onChange }: { value: TxKind; onChange: (k: TxKind) => void }) {
  const opts: { id: TxKind; label: string }[] = [
    { id: "expense", label: "Dépense" },
    { id: "income", label: "Revenu" },
    { id: "transfer", label: "Virement" },
  ];
  return (
    <div className="flex border border-rule">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={value === o.id ? "h-10 flex-1 bg-copper text-xs uppercase tracking-widest text-copper-ink" : "h-10 flex-1 text-xs uppercase tracking-widest text-mist"}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TxDialog() {
  const dialog = useFreev((s) => s.dialog);
  const accounts = useFreev((s) => s.accounts);
  const addTx = useFreev((s) => s.addTx);
  const open = useFreev((s) => s.open);
  const date0 = dialog && dialog.name === "tx" && dialog.date ? dialog.date : TODAY;
  const [kind, setKind] = useState<TxKind>("expense");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(date0);
  const [category, setCategory] = useState("Alimentation");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "courant");
  const [toId, setToId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [scope, setScope] = useState<Scope>("perso");
  const [recurring, setRecurring] = useState(false);
  const [logo, setLogo] = useState("FV");
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState("");

  function save() {
    const n = Number(amount.replace(",", "."));
    if (!label.trim() || !Number.isFinite(n) || n <= 0) {
      setError("Indiquez un libellé et un montant supérieur à zéro.");
      return;
    }
    if (kind === "transfer") {
      if (accountId === toId) {
        setError("Choisissez deux comptes différents.");
        return;
      }
      useFreev.getState().transfer(accountId, toId, n, label, date);
      toast("Virement enregistré");
      return;
    }
    addTx({
      date,
      label: label.trim(),
      category,
      accountId,
      amount: kind === "expense" ? -n : n,
      scope,
      kind,
      recurring,
      pending: false,
      logo,
    });
    toast("Opération ajoutée au journal");
  }

  return (
    <Modal title="Nouvelle opération" lede="Dépense, revenu, ou mouvement entre vos comptes.">
      <div className="space-y-4">
        <KindSwitch value={kind} onChange={setKind} />
        <Field label="Libellé" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Field label="Montant" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {kind !== "transfer" ? (
          <Select label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        ) : null}
        <Select label={kind === "transfer" ? "Depuis" : "Compte"} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        {kind === "transfer" ? (
          <Select label="Vers" value={toId} onChange={(e) => setToId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        ) : (
          <Select label="Périmètre" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
            <option value="perso">Personnel</option>
            <option value="pro">Professionnel</option>
          </Select>
        )}
        <div className="flex items-center justify-between border-b border-rule py-3">
          <span className="text-sm">Récurrence mensuelle</span>
          <Toggle on={recurring} onChange={setRecurring} label="Récurrence" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Signe {logo}</span>
          <Button type="button" size="sm" onClick={() => setPicking((v) => !v)}>
            Choisir un logo
          </Button>
        </div>
        {picking ? (
          <div className="grid grid-cols-4 gap-2">
            {LOGOS.map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => {
                  setLogo(mark);
                  setPicking(false);
                }}
                className={mark === logo ? "h-12 border border-copper font-serif text-copper" : "h-12 border border-rule font-serif"}
              >
                {mark}
              </button>
            ))}
          </div>
        ) : null}
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="primary" onClick={save}>
            Enregistrer
          </Button>
          <Button type="button" onClick={() => open(null)}>
            Annuler
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DuplicateDialog() {
  const mark = useFreev((s) => s.markDuplicated);
  const open = useFreev((s) => s.open);
  const [month, setMonth] = useState("2026-12");
  const [income, setIncome] = useState(true);
  const [expense, setExpense] = useState(true);
  return (
    <Modal title="Dupliquer le mois" lede="Reprend les échéances connues sur le mois choisi.">
      <div className="space-y-4">
        <Field label="Mois cible" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Reprendre les revenus</span>
          <Toggle on={income} onChange={setIncome} label="Revenus" />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Reprendre les dépenses</span>
          <Toggle on={expense} onChange={setExpense} label="Dépenses" />
        </div>
        <ul className="divide-y divide-rule border-y border-rule text-sm">
          {SCHEDULE.filter((s) => (s.amount > 0 ? income : expense)).map((s) => (
            <li key={s.id} className="flex justify-between py-2">
              <span>
                {s.label} · jour {s.day}
              </span>
              <span className="tabular-nums">{s.amount > 0 ? "+" : "−"}{Math.abs(s.amount)} €</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              mark(month);
              toast(`Échéances posées sur ${month}`);
            }}
          >
            Dupliquer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function BudgetDialog() {
  const budgets = useFreev((s) => s.budgets);
  const setBudgets = useFreev((s) => s.setBudgets);
  const open = useFreev((s) => s.open);
  const [draft, setDraft] = useState(budgets);
  return (
    <Modal title="Budget du mois" lede="Plafonds par catégorie. Le contrôle mensuel s’y réfère.">
      <div className="space-y-3">
        {Object.entries(draft).map(([k, v]) => (
          <Field
            key={k}
            label={k}
            inputMode="decimal"
            value={String(v)}
            onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value.replace(",", ".")) || 0 })}
          />
        ))}
        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            onClick={() => {
              setBudgets(draft);
              toast("Budget enregistré");
            }}
          >
            Enregistrer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function OpeningDialog() {
  const accounts = useFreev((s) => s.accounts);
  const patch = useFreev((s) => s.patchAccount);
  const open = useFreev((s) => s.open);
  const [id, setId] = useState(accounts[0]?.id ?? "");
  const current = accounts.find((a) => a.id === id);
  const [amount, setAmount] = useState(String(current?.balance ?? 0));
  return (
    <Modal title="Solde de départ" lede="Corrige le solde sans réécrire les opérations déjà passées.">
      <div className="space-y-4">
        <Select
          label="Compte"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            const acc = accounts.find((a) => a.id === e.target.value);
            setAmount(String(acc?.balance ?? 0));
          }}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Field label="Solde" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!Number.isFinite(n)) return;
              patch(id, { balance: n });
              open(null);
              toast("Solde mis à jour");
            }}
          >
            Mettre à jour
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function TransferDialog() {
  const accounts = useFreev((s) => s.accounts);
  const open = useFreev((s) => s.open);
  const [from, setFrom] = useState(accounts[0]?.id ?? "");
  const [to, setTo] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(TODAY);
  const [error, setError] = useState("");
  return (
    <Modal title="Entre comptes" lede="Le solde global ne change pas. Seule la répartition bouge.">
      <div className="space-y-4">
        <Select label="Depuis" value={from} onChange={(e) => setFrom(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select label="Vers" value={to} onChange={(e) => setTo(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Field label="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Field label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!n || from === to) {
                setError("Montant valide, et deux comptes distincts.");
                return;
              }
              useFreev.getState().transfer(from, to, n, note, date);
              toast("Virement passé");
            }}
          >
            Virer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function GoalDialog({ id }: { id?: string }) {
  const goals = useFreev((s) => s.goals);
  const save = useFreev((s) => s.saveGoal);
  const open = useFreev((s) => s.open);
  const accounts = useFreev((s) => s.accounts);
  const existing = goals.find((g) => g.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [current, setCurrent] = useState(String(existing?.current ?? 0));
  const [target, setTarget] = useState(String(existing?.target ?? 1000));
  const [due, setDue] = useState(existing?.due ?? "2027-06-01");
  const [accountId, setAccountId] = useState(existing?.accountId ?? "livret");
  return (
    <Modal title={existing ? "Ajuster l’objectif" : "Nouvel objectif"}>
      <div className="space-y-4">
        <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Déjà mis de côté" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Field label="Cible" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Field label="Échéance" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <Select label="Compte" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              if (!name.trim()) return;
              save({
                id: existing?.id ?? uid("goal"),
                name: name.trim(),
                current: Number(current.replace(",", ".")) || 0,
                target: Number(target.replace(",", ".")) || 0,
                due,
                accountId,
              });
              toast("Objectif enregistré");
            }}
          >
            Enregistrer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function DebtDialog({ id }: { id?: string }) {
  const debts = useFreev((s) => s.debts);
  const save = useFreev((s) => s.saveDebt);
  const open = useFreev((s) => s.open);
  const existing = debts.find((d) => d.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [remaining, setRemaining] = useState(String(existing?.remaining ?? ""));
  const [monthly, setMonthly] = useState(String(existing?.monthly ?? ""));
  const [rate, setRate] = useState(String(existing?.rate ?? 0));
  const [end, setEnd] = useState(existing?.end ?? "2028-01-01");
  return (
    <Modal title={existing ? "Modifier la dette" : "Nouvelle dette"}>
      <div className="space-y-4">
        <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Reste à payer" value={remaining} onChange={(e) => setRemaining(e.target.value)} />
        <Field label="Mensualité" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <Field label="Taux (%)" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Field label="Fin" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              if (!name.trim()) return;
              save({
                id: existing?.id ?? uid("debt"),
                name: name.trim(),
                remaining: Number(remaining.replace(",", ".")) || 0,
                monthly: Number(monthly.replace(",", ".")) || 0,
                rate: Number(rate.replace(",", ".")) || 0,
                end,
              });
              toast("Dette enregistrée");
            }}
          >
            Enregistrer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function AccountsDialog() {
  const accounts = useFreev((s) => s.accounts);
  const add = useFreev((s) => s.addAccount);
  const remove = useFreev((s) => s.removeAccount);
  const open = useFreev((s) => s.open);
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [kind, setKind] = useState<"courant" | "epargne" | "pro">("courant");
  const [scope, setScope] = useState<Scope>("perso");
  const [balance, setBalance] = useState("0");
  return (
    <Modal title="Gestion des comptes" lede="Ajoutez un compte ou retirez-en un. Le solde de départ se règle à part.">
      <ul className="divide-y divide-rule border-y border-rule">
        {accounts.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 py-3">
            <span>
              <span className="block text-sm">{a.name}</span>
              <span className="text-xs text-mist">
                {a.bank} · {a.kind}
              </span>
            </span>
            <Button size="sm" onClick={() => remove(a.id)} disabled={accounts.length < 2}>
              Retirer
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-3">
        <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Banque" value={bank} onChange={(e) => setBank(e.target.value)} />
        <Select label="Type" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="courant">Courant</option>
          <option value="epargne">Épargne</option>
          <option value="pro">Professionnel</option>
        </Select>
        <Select label="Périmètre" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
          <option value="perso">Personnel</option>
          <option value="pro">Professionnel</option>
        </Select>
        <Field label="Solde initial" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              if (!name.trim()) return;
              add({
                name: name.trim(),
                bank: bank.trim() || "Banque",
                balance: Number(balance.replace(",", ".")) || 0,
                scope,
                kind,
              });
              setName("");
              toast("Compte ajouté");
            }}
          >
            Ajouter
          </Button>
          <Button onClick={() => open(null)}>Fermer</Button>
          <Button size="sm" onClick={() => open({ name: "opening" })}>
            Solde de départ
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PickAccountDialog() {
  const accounts = useFreev((s) => s.accounts);
  const active = useFreev((s) => s.activeAccountId);
  const setActive = useFreev((s) => s.setActiveAccount);
  const [id, setId] = useState(active);
  return (
    <Modal title="Choisir un compte" lede="Le compte actif sert de défaut pour les nouvelles opérations.">
      <div className="space-y-2">
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setId(a.id)}
            className={id === a.id ? "flex w-full items-center justify-between border border-copper px-3 py-3 text-left" : "flex w-full items-center justify-between border border-rule px-3 py-3 text-left"}
          >
            <span>
              <span className="block text-sm">{a.name}</span>
              <span className="text-xs text-mist">{a.bank}</span>
            </span>
            <span className="text-xs uppercase tracking-widest">{a.scope}</span>
          </button>
        ))}
        <Button variant="primary" className="mt-3" onClick={() => setActive(id)}>
          Utiliser ce compte
        </Button>
      </div>
    </Modal>
  );
}

function RecurrenceDialog({ id }: { id?: string }) {
  const txs = useFreev((s) => s.txs);
  const update = useFreev((s) => s.updateTx);
  const add = useFreev((s) => s.addTx);
  const open = useFreev((s) => s.open);
  const existing = txs.find((t) => t.id === id);
  const [label, setLabel] = useState(existing?.label ?? "");
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [category, setCategory] = useState(existing?.category ?? "Abonnements");
  const [day, setDay] = useState(existing ? String(Number(existing.date.slice(8, 10))) : "1");
  const [scope, setScope] = useState<Scope>(existing?.scope ?? "perso");
  const [income, setIncome] = useState(existing ? existing.amount > 0 : false);
  return (
    <Modal title={existing ? "Modifier la récurrence" : "Nouvelle récurrence"}>
      <div className="space-y-4">
        <Field label="Libellé" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Field label="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Field label="Jour du mois" value={day} onChange={(e) => setDay(e.target.value)} />
        <Select label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select label="Périmètre" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
          <option value="perso">Personnel</option>
          <option value="pro">Professionnel</option>
        </Select>
        <div className="flex items-center justify-between">
          <span className="text-sm">C’est un revenu</span>
          <Toggle on={income} onChange={setIncome} label="Revenu" />
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!label.trim() || !n) return;
              const signed = income ? n : -n;
              const d = Math.min(28, Math.max(1, Number(day) || 1));
              const date = `2026-11-${String(d).padStart(2, "0")}`;
              if (existing) {
                update(existing.id, { label: label.trim(), amount: signed, category, scope, date, recurring: true, kind: income ? "income" : "expense" });
                open(null);
              } else {
                add({
                  label: label.trim(),
                  amount: signed,
                  category,
                  scope,
                  date,
                  accountId: scope === "pro" ? "pro" : "courant",
                  kind: income ? "income" : "expense",
                  recurring: true,
                  pending: true,
                });
              }
              toast("Récurrence enregistrée");
            }}
          >
            Enregistrer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function TrialDialog() {
  const add = useFreev((s) => s.addSub);
  const open = useFreev((s) => s.open);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [trialEnd, setTrialEnd] = useState("2026-12-19");
  return (
    <Modal title="Nouvel essai" lede="On vous prévient avant la fin de la période gratuite.">
      <div className="space-y-4">
        <Field label="Service" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Prix ensuite" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Field label="Fin de l’essai" type="date" value={trialEnd} onChange={(e) => setTrialEnd(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              if (!name.trim()) return;
              add({
                name: name.trim(),
                price: Number(price.replace(",", ".")) || 0,
                renews: "après l’essai",
                category: "Essai",
                status: "essai",
                trialEnd,
              });
              toast("Essai ajouté");
            }}
          >
            Ajouter
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function InvoiceDialog() {
  const add = useFreev((s) => s.addInvoice);
  const open = useFreev((s) => s.open);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(TODAY);
  return (
    <Modal title="Nouvelle facture">
      <div className="space-y-4">
        <Field label="Client" value={client} onChange={(e) => setClient(e.target.value)} />
        <Field label="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!client.trim() || !n) return;
              add({ client: client.trim(), amount: n, status: "en attente", date });
              toast("Facture créée");
            }}
          >
            Créer
          </Button>
          <Button onClick={() => open(null)}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}

function WipeDialog() {
  const wipe = useFreev((s) => s.wipe);
  const open = useFreev((s) => s.open);
  return (
    <Modal title="Supprimer mes données" lede="Le journal, les objectifs, les dettes et les factures de cet appareil seront vidés. Les comptes restent.">
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            wipe();
            toast("Données locales effacées");
          }}
        >
          Effacer
        </Button>
        <Button onClick={() => open(null)}>Annuler</Button>
      </div>
    </Modal>
  );
}
