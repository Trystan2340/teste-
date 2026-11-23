import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button, Field, Select, Toggle } from "@/components/ui";
import { CATEGORIES, LOGOS, SCHEDULE, TODAY, type Scope, type TxKind } from "@/lib/freev/data";
import { nextMonth } from "@/lib/freev/calc";
import { useFreev } from "@/lib/freev/store";
import { cn, money, uid } from "@/lib/utils";
import { DialogCloseContext, useDialogClose, useSheetClose } from "@/components/dialog-motion";

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

/**
 * Every dialog closes through here.
 *
 * Leaving used to be instant: the node was unmounted the moment `dialog`
 * cleared. The sheet now plays a short exit first, which also means Escape,
 * the veil and the X button all feel like the same gesture.
 */
function Modal({
  title,
  lede,
  kicker = "Journal",
  children,
}: {
  title: string;
  lede?: string;
  kicker?: string;
  children: ReactNode;
}) {
  const { close, closing } = useSheetClose();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Escape closes the dialog — expected everywhere, and previously missing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  /*
   * A dialog that does not take focus is a dialog you can tab straight past:
   * focus stayed on the page behind the veil, so keyboard users were typing
   * into a form they could not see and Enter could re-trigger the button that
   * opened the sheet. Focus the first field, keep Tab inside the sheet, and
   * hand focus back to the opener on close.
   */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = sheetRef.current;
    if (!node) return;
    const focusables = () =>
      [
        ...node.querySelectorAll<HTMLElement>(
          "input, select, textarea, button, [href], [tabindex]",
        ),
      ].filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
    const first = node.querySelector<HTMLElement>("input, select, textarea") ?? focusables()[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const start = list[0];
      const end = list[list.length - 1];
      if (e.shiftKey && document.activeElement === start) {
        e.preventDefault();
        end.focus();
      } else if (!e.shiftKey && document.activeElement === end) {
        e.preventDefault();
        start.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  return (
    <DialogCloseContext.Provider value={close}>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
        <button
          type="button"
          aria-label="Fermer"
          data-closing={closing}
          className="sheet-veil absolute inset-0"
          onClick={close}
        />
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-closing={closing}
          className="sheet relative max-h-screen w-full overflow-y-auto rounded-t-3xl border border-rule bg-card p-5 shadow-lift sm:max-w-lg sm:rounded-3xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-copper">{kicker}</p>
              <h2 className="mt-1 font-serif text-3xl leading-tight tracking-tight">{title}</h2>
              {lede ? (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-mist">{lede}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={close}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-rule bg-card text-mist transition-colors hover:border-copper/40 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </DialogCloseContext.Provider>
  );
}

/**
 * Action bar for every dialog: cancel on the left, the committing action on the
 * right, stacked full-width on phones so nothing lands under the thumb edge.
 */
function DialogActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-2 flex flex-col-reverse gap-2 border-t border-rule/60 bg-card/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-2">
      {children}
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
    <div
      className="flex gap-1 rounded-full bg-card-2 p-1"
      role="tablist"
      aria-label="Type d’opération"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={
            value === o.id
              ? "pill-on h-9 flex-1 rounded-full bg-copper text-sm font-medium text-copper-ink shadow-float"
              : "h-9 flex-1 rounded-full text-sm text-mist transition-colors hover:text-ink"
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TxDialog() {
  const close = useDialogClose();
  const dialog = useFreev((s) => s.dialog);
  const accounts = useFreev((s) => s.accounts);
  const addTx = useFreev((s) => s.addTx);
  const txs = useFreev((s) => s.txs);
  const updateTx = useFreev((s) => s.updateTx);
  const editId = dialog && dialog.name === "tx" ? dialog.editId : undefined;
  const existing = txs.find((t) => t.id === editId);
  const date0 =
    existing?.date ?? (dialog && dialog.name === "tx" && dialog.date ? dialog.date : TODAY);
  const [kind, setKind] = useState<TxKind>(existing?.kind ?? "expense");
  const [label, setLabel] = useState(existing?.label ?? "");
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [date, setDate] = useState(date0);
  const [category, setCategory] = useState(existing?.category ?? "Alimentation");
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? "courant");
  const [toId, setToId] = useState(
    existing?.toAccountId ?? accounts[1]?.id ?? accounts[0]?.id ?? "",
  );
  const [scope, setScope] = useState<Scope>(existing?.scope ?? "perso");
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);
  const [logo, setLogo] = useState(existing?.logo ?? "FV");
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
      return;
    }
    const amountValue = kind === "expense" ? -n : n;
    if (existing) {
      updateTx(existing.id, {
        date,
        label: label.trim(),
        category,
        accountId,
        amount: amountValue,
        scope,
        kind,
        recurring,
        logo,
      });
      return;
    }
    addTx({
      date,
      label: label.trim(),
      category,
      accountId,
      amount: amountValue,
      scope,
      kind,
      recurring,
      pending: false,
      logo,
    });
  }

  return (
    <Modal
      title={existing ? "Modifier l’opération" : "Nouvelle opération"}
      kicker="Opérations"
      lede={
        existing
          ? "Le solde du compte est recalculé automatiquement."
          : "Dépense, revenu, ou mouvement entre vos comptes."
      }
    >
      <div className="space-y-4">
        <KindSwitch value={kind} onChange={setKind} />
        <Field label="Libellé" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Field
          label="Montant"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
        />
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {kind !== "transfer" ? (
          <Select label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        ) : null}
        <Select
          label={kind === "transfer" ? "Depuis" : "Compte"}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
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
          <Select
            label="Périmètre"
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
          >
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
                className={
                  mark === logo
                    ? "h-12 border border-copper font-serif text-copper"
                    : "h-12 border border-rule font-serif"
                }
              >
                {mark}
              </button>
            ))}
          </div>
        ) : null}
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <DialogActions>
          <Button type="button" onClick={close}>
            Annuler
          </Button>
          <Button type="button" variant="primary" onClick={save}>
            {existing ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function DuplicateDialog() {
  const close = useDialogClose();
  const mark = useFreev((s) => s.markDuplicated);
  const current = useFreev((s) => s.month);
  // Default to the month after the one being looked at, not a fixed December.
  const [month, setMonth] = useState(() => nextMonth(current));
  const [income, setIncome] = useState(true);
  const [expense, setExpense] = useState(true);
  return (
    <Modal
      title="Dupliquer le mois"
      kicker="Planification"
      lede="Reprend les échéances connues sur le mois choisi."
    >
      <div className="space-y-4">
        <Field
          label="Mois cible"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
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
              <span className="tabular-nums">
                {s.amount > 0 ? "+" : "−"}
                {Math.abs(s.amount)} €
              </span>
            </li>
          ))}
        </ul>
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              mark(month);
            }}
          >
            Dupliquer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function BudgetDialog() {
  const close = useDialogClose();
  const budgets = useFreev((s) => s.budgets);
  const setBudgets = useFreev((s) => s.setBudgets);
  const [draft, setDraft] = useState(budgets);
  return (
    <Modal
      title="Budget du mois"
      kicker="Budget"
      lede="Plafonds par catégorie. Le contrôle mensuel s’y réfère."
    >
      <div className="space-y-3">
        {Object.entries(draft).map(([k, v]) => (
          <Field
            key={k}
            label={k}
            inputMode="decimal"
            value={String(v)}
            onChange={(e) =>
              setDraft({ ...draft, [k]: Number(e.target.value.replace(",", ".")) || 0 })
            }
          />
        ))}
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              setBudgets(draft);
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function OpeningDialog() {
  const close = useDialogClose();
  const accounts = useFreev((s) => s.accounts);
  const patch = useFreev((s) => s.patchAccount);
  const [id, setId] = useState(accounts[0]?.id ?? "");
  const current = accounts.find((a) => a.id === id);
  const [amount, setAmount] = useState(String(current?.balance ?? 0));
  return (
    <Modal
      title="Solde de départ"
      kicker="Comptes"
      lede="Corrige le solde sans réécrire les opérations déjà passées."
    >
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
        <Field
          label="Solde"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!Number.isFinite(n)) return;
              patch(id, { balance: n });
              close();
            }}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function TransferDialog() {
  const close = useDialogClose();
  const accounts = useFreev((s) => s.accounts);
  const [from, setFrom] = useState(accounts[0]?.id ?? "");
  const [to, setTo] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(TODAY);
  const [error, setError] = useState("");
  return (
    <Modal
      title="Entre comptes"
      kicker="Comptes"
      lede="Le solde global ne change pas. Seule la répartition bouge."
    >
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
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!n || from === to) {
                setError("Montant valide, et deux comptes distincts.");
                return;
              }
              useFreev.getState().transfer(from, to, n, note, date);
            }}
          >
            Virer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function GoalDialog({ id }: { id?: string }) {
  const close = useDialogClose();
  const goals = useFreev((s) => s.goals);
  const save = useFreev((s) => s.saveGoal);
  const accounts = useFreev((s) => s.accounts);
  const existing = goals.find((g) => g.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [current, setCurrent] = useState(String(existing?.current ?? 0));
  const [target, setTarget] = useState(String(existing?.target ?? 1000));
  const [due, setDue] = useState(existing?.due ?? "2027-06-01");
  const [accountId, setAccountId] = useState(existing?.accountId ?? "livret");
  return (
    <Modal title={existing ? "Ajuster l’objectif" : "Nouvel objectif"} kicker="Épargne">
      <div className="space-y-4">
        <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          label="Déjà mis de côté"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Field label="Cible" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Field label="Échéance" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <Select label="Compte" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
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
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function DebtDialog({ id }: { id?: string }) {
  const close = useDialogClose();
  const debts = useFreev((s) => s.debts);
  const save = useFreev((s) => s.saveDebt);
  const existing = debts.find((d) => d.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [remaining, setRemaining] = useState(String(existing?.remaining ?? ""));
  const [monthly, setMonthly] = useState(String(existing?.monthly ?? ""));
  const [rate, setRate] = useState(String(existing?.rate ?? 0));
  const [end, setEnd] = useState(existing?.end ?? "2028-01-01");
  return (
    <Modal title={existing ? "Modifier la dette" : "Nouvelle dette"} kicker="Dettes">
      <div className="space-y-4">
        <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          label="Reste à payer"
          value={remaining}
          onChange={(e) => setRemaining(e.target.value)}
        />
        <Field label="Mensualité" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <Field label="Taux (%)" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Field label="Fin" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
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
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function AccountsDialog() {
  const close = useDialogClose();
  const open = useFreev((s) => s.open);
  const accounts = useFreev((s) => s.accounts);
  const add = useFreev((s) => s.addAccount);
  const remove = useFreev((s) => s.removeAccount);
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [kind, setKind] = useState<"courant" | "epargne" | "pro">("courant");
  const [scope, setScope] = useState<Scope>("perso");
  const [balance, setBalance] = useState("0");
  return (
    <Modal
      title="Gestion des comptes"
      kicker="Comptes"
      lede="Ajoutez un compte ou retirez-en un. Le solde de départ se règle à part."
    >
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
        <DialogActions>
          <Button onClick={close}>Fermer</Button>
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
            }}
          >
            Ajouter
          </Button>
          <Button size="sm" onClick={() => open({ name: "opening" })}>
            Solde de départ
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function PickAccountDialog() {
  const close = useDialogClose();
  const accounts = useFreev((s) => s.accounts);
  const active = useFreev((s) => s.activeAccountId);
  const setActive = useFreev((s) => s.setActiveAccount);
  const [id, setId] = useState(active);
  return (
    <Modal
      title="Choisir un compte"
      kicker="Comptes"
      lede="Le compte actif sert de défaut pour les nouvelles opérations."
    >
      <div className="space-y-2">
        {accounts.map((a) => {
          const on = id === a.id;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setId(a.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                on
                  ? "border-copper/50 bg-copper/8 ring-1 ring-copper/25"
                  : "border-rule bg-card hover:border-copper/25",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
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
                <span className="text-xs text-mist">
                  {a.bank} · {a.scope === "pro" ? "professionnel" : "personnel"}
                </span>
              </span>
              <span className="text-sm tabular-nums text-mist">{money(a.balance)}</span>
              <span
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
                  on ? "border-copper bg-copper text-copper-ink" : "border-rule",
                )}
              >
                {on ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button variant="primary" onClick={() => setActive(id)}>
            Utiliser ce compte
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function RecurrenceDialog({ id }: { id?: string }) {
  const close = useDialogClose();
  const txs = useFreev((s) => s.txs);
  const update = useFreev((s) => s.updateTx);
  const add = useFreev((s) => s.addTx);
  const existing = txs.find((t) => t.id === id);
  const [label, setLabel] = useState(existing?.label ?? "");
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [category, setCategory] = useState(existing?.category ?? "Abonnements");
  const [day, setDay] = useState(existing ? String(Number(existing.date.slice(8, 10))) : "1");
  const [scope, setScope] = useState<Scope>(existing?.scope ?? "perso");
  const [income, setIncome] = useState(existing ? existing.amount > 0 : false);
  return (
    <Modal title={existing ? "Modifier la récurrence" : "Nouvelle récurrence"} kicker="Récurrences">
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
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!label.trim() || !n) return;
              const signed = income ? n : -n;
              const d = Math.min(28, Math.max(1, Number(day) || 1));
              // Stamp the recurring line in the month being looked at, so it does
              // not silently land in November whatever the header says.
              const date = `${useFreev.getState().month}-${String(d).padStart(2, "0")}`;
              if (existing) {
                update(existing.id, {
                  label: label.trim(),
                  amount: signed,
                  category,
                  scope,
                  date,
                  recurring: true,
                  kind: income ? "income" : "expense",
                });
                close();
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
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function TrialDialog() {
  const close = useDialogClose();
  const add = useFreev((s) => s.addSub);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [trialEnd, setTrialEnd] = useState("2026-12-19");
  return (
    <Modal
      title="Nouvel essai"
      kicker="Abonnements"
      lede="On vous prévient avant la fin de la période gratuite."
    >
      <div className="space-y-4">
        <Field label="Service" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Prix ensuite" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Field
          label="Fin de l’essai"
          type="date"
          value={trialEnd}
          onChange={(e) => setTrialEnd(e.target.value)}
        />
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
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
            }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function InvoiceDialog() {
  const close = useDialogClose();
  const add = useFreev((s) => s.addInvoice);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(TODAY);
  return (
    <Modal title="Nouvelle facture" kicker="Business">
      <div className="space-y-4">
        <Field label="Client" value={client} onChange={(e) => setClient(e.target.value)} />
        <Field label="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              const n = Number(amount.replace(",", "."));
              if (!client.trim() || !n) return;
              add({ client: client.trim(), amount: n, status: "en attente", date });
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </div>
    </Modal>
  );
}

function WipeDialog() {
  const close = useDialogClose();
  const wipe = useFreev((s) => s.wipe);
  return (
    <Modal
      title="Supprimer mes données"
      kicker="Données"
      lede="Le journal, les objectifs, les dettes et les factures de cet appareil seront vidés. Les comptes restent."
    >
      <DialogActions>
        <Button onClick={close}>Annuler</Button>
        <Button
          variant="primary"
          onClick={() => {
            wipe();
          }}
        >
          Effacer
        </Button>
      </DialogActions>
    </Modal>
  );
}
