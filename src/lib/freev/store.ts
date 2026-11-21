import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ACCOUNTS,
  BUDGETS,
  DEBTS,
  GOALS,
  INVOICES,
  NOTIFS,
  PLANS,
  RULES,
  SEED_TX,
  SUBS,
  TODAY,
  type Account,
  type Debt,
  type Goal,
  type Invoice,
  type Mode,
  type Notif,
  type Rule,
  type SmartPlan,
  type Sub,
  type Tx,
} from "@/lib/freev/data";
import { uid } from "@/lib/utils";
import { capture, describeChange, sameSnapshot, type HistoryEntry } from "@/lib/freev/history";

export type ThemeChoice = "ink" | "paper" | "system";

export type Dialog =
  | { name: "tx"; editId?: string; date?: string }
  | { name: "logo" }
  | { name: "duplicate" }
  | { name: "budget" }
  | { name: "opening" }
  | { name: "transfer" }
  | { name: "goal"; id?: string }
  | { name: "debt"; id?: string }
  | { name: "accounts" }
  | { name: "pick-account" }
  | { name: "recurrence"; id?: string }
  | { name: "trial" }
  | { name: "invoice" }
  | { name: "wipe" };

export type Settings = {
  notifEmail: boolean;
  notifPush: boolean;
  notifWeekly: boolean;
  advice: boolean;
};

/** Dashboard blocks, in the order the user chose. */
export const DASH_BLOCKS = ["schedule", "recent", "health", "accounts", "split", "watch"] as const;
export type DashBlock = (typeof DASH_BLOCKS)[number];
export const DASH_DEFAULT: DashBlock[] = [...DASH_BLOCKS];

export type ProSettings = {
  tradeName: string;
  siret: string;
  vat: string;
  address: string;
  prefix: string;
  delay: string;
  mention: string;
  remind: boolean;
  remindLate: boolean;
};

type Profile = {
  name: string;
  email: string;
  defaultMode: Mode;
};

type State = {
  theme: ThemeChoice;
  mode: Mode;
  /** Calendar month being looked at, `YYYY-MM`. Drives every screen. */
  month: string;
  txs: Tx[];
  accounts: Account[];
  goals: Goal[];
  debts: Debt[];
  rules: Rule[];
  subs: Sub[];
  plans: SmartPlan[];
  invoices: Invoice[];
  budgets: Record<string, number>;
  settings: Settings;
  /** Dashboard composition: order of the visible blocks, and the hidden ones. */
  dashOrder: DashBlock[];
  dashHidden: DashBlock[];
  pro: ProSettings;
  notifs: Notif[];
  profile: Profile;
  activeAccountId: string;
  logoPick: string;
  closedSessions: string[];
  twoFa: boolean;
  duplicated: string[];
  /** Label of the last undoable change, shown in the undo bar. */
  lastChange: string | null;
  undo: () => void;
  dialog: Dialog | null;
  searchOpen: boolean;
  notifOpen: boolean;
  userOpen: boolean;
  navOpen: boolean;
  setTheme: (t: ThemeChoice) => void;
  setMode: (m: Mode) => void;
  setMonth: (m: string) => void;
  open: (d: Dialog | null) => void;
  setSearch: (v: boolean) => void;
  setNotif: (v: boolean) => void;
  setUser: (v: boolean) => void;
  setNav: (v: boolean) => void;
  setLogo: (v: string) => void;
  addTx: (tx: Omit<Tx, "id">) => void;
  updateTx: (id: string, patch: Partial<Tx>) => void;
  removeTx: (id: string) => void;
  addAccount: (a: Omit<Account, "id">) => void;
  patchAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  setActiveAccount: (id: string) => void;
  transfer: (from: string, to: string, amount: number, note: string, date: string) => void;
  saveGoal: (g: Goal) => void;
  removeGoal: (id: string) => void;
  saveDebt: (d: Debt) => void;
  payDebt: (id: string) => void;
  toggleRule: (id: string) => void;
  addRule: (r: Omit<Rule, "id">) => void;
  setSubStatus: (id: string, status: Sub["status"]) => void;
  addSub: (s: Omit<Sub, "id">) => void;
  togglePlan: (id: string) => void;
  addPlan: (p: Omit<SmartPlan, "id">) => void;
  setBudgets: (b: Record<string, number>) => void;
  patchSettings: (p: Partial<Settings>) => void;
  moveDashBlock: (id: DashBlock, dir: -1 | 1) => void;
  placeDashBlock: (id: DashBlock, to: number) => void;
  toggleDashBlock: (id: DashBlock) => void;
  resetDash: () => void;
  patchPro: (p: Partial<ProSettings>) => void;
  patchProfile: (p: Partial<Profile>) => void;
  markNotifs: () => void;
  markInvoice: (id: string) => void;
  addInvoice: (i: Omit<Invoice, "id" | "number">) => void;
  remind: (id: string) => string;
  closeSession: (id: string) => void;
  setTwoFa: (v: boolean) => void;
  markDuplicated: (month: string) => void;
  wipe: () => void;
};

const seedSettings: Settings = {
  notifEmail: true,
  notifPush: false,
  notifWeekly: true,
  advice: true,
};

const seedPro: ProSettings = {
  tradeName: "Camille Morel Studio",
  siret: "849 302 118 00024",
  vat: "FR 12 849302118",
  address: "14 rue des Archives, 75004 Paris",
  prefix: "FAC-",
  delay: "30",
  mention: "TVA non applicable, art. 293 B du CGI.",
  remind: true,
  remindLate: true,
};

export const useFreev = create<State>()(
  persist(
    (set, get) => {
      const history: HistoryEntry[] = [];

      /** Apply a change and record how to walk it back. */
      const commit = (partial: Partial<State> | ((s: State) => Partial<State>)) => {
        const before = capture(get());
        set(partial as never, false);
        const after = capture(get());
        if (sameSnapshot(before, after)) return;
        history.push({ label: describeChange(before, after), snap: before });
        if (history.length > 25) history.shift();
        set({ lastChange: history[history.length - 1].label }, false);
      };

      /** Walk the last change back, keeping the toast honest about it. */
      const undo = () => {
        const entry = history.pop();
        if (!entry) return;
        set({ ...entry.snap, lastChange: null }, false);
      };

      return {
        theme: "ink",
        mode: "both",
        month: TODAY.slice(0, 7),
        txs: SEED_TX,
        accounts: ACCOUNTS,
        goals: GOALS,
        debts: DEBTS,
        rules: RULES,
        subs: SUBS,
        plans: PLANS,
        invoices: INVOICES,
        budgets: BUDGETS,
        settings: seedSettings,
        dashOrder: DASH_DEFAULT,
        dashHidden: [],
        pro: seedPro,
        notifs: NOTIFS,
        profile: { name: "Camille Morel", email: "camille@freev.app", defaultMode: "both" },
        activeAccountId: "courant",
        logoPick: "FV",
        lastChange: null,
        undo,
        closedSessions: [],
        twoFa: false,
        duplicated: [],
        dialog: null,
        searchOpen: false,
        notifOpen: false,
        userOpen: false,
        navOpen: false,
        setTheme: (theme) => set({ theme }),
        setMode: (mode) => set({ mode }),
        setMonth: (month) => set({ month }),
        open: (dialog) => set({ dialog }),
        setSearch: (searchOpen) => set({ searchOpen, notifOpen: false, userOpen: false }),
        setNotif: (notifOpen) => set({ notifOpen, searchOpen: false, userOpen: false }),
        setUser: (userOpen) => set({ userOpen, searchOpen: false, notifOpen: false }),
        setNav: (navOpen) => set({ navOpen }),
        setLogo: (logoPick) => set({ logoPick }),
        addTx: (tx) =>
          commit((s) => {
            const id = uid("tx");
            const next = [{ ...tx, id }, ...s.txs];
            const accounts = s.accounts.map((a) => {
              if (tx.kind === "transfer") return a;
              if (a.id !== tx.accountId || tx.pending) return a;
              return { ...a, balance: Math.round((a.balance + tx.amount) * 100) / 100 };
            });
            return { txs: next, accounts, dialog: null };
          }),
        updateTx: (id, patch) =>
          commit((s) => {
            const prev = s.txs.find((t) => t.id === id);
            if (!prev) return {};
            const next = { ...prev, ...patch };
            const accounts = s.accounts
              // Walk the old effect back, then apply the new one: editing an
              // amount used to leave the account balance stale.
              .map((a) =>
                a.id === prev.accountId && !prev.pending && prev.kind !== "transfer"
                  ? { ...a, balance: a.balance - prev.amount }
                  : a,
              )
              .map((a) =>
                a.id === next.accountId && !next.pending && next.kind !== "transfer"
                  ? { ...a, balance: a.balance + next.amount }
                  : a,
              )
              .map((a) => ({ ...a, balance: Math.round(a.balance * 100) / 100 }));
            return { txs: s.txs.map((t) => (t.id === id ? next : t)), accounts };
          }),
        removeTx: (id) =>
          commit((s) => {
            const tx = s.txs.find((t) => t.id === id);
            if (!tx) return {};
            const accounts = s.accounts.map((a) => {
              if (tx.kind === "transfer") {
                if (a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
                if (a.id === tx.toAccountId) return { ...a, balance: a.balance - tx.amount };
                return a;
              }
              // Pending lines never touched the balance, so they leave it alone.
              if (a.id !== tx.accountId || tx.pending) return a;
              return { ...a, balance: a.balance - tx.amount };
            });
            return {
              txs: s.txs.filter((t) => t.id !== id),
              accounts: accounts.map((a) => ({ ...a, balance: Math.round(a.balance * 100) / 100 })),
            };
          }),
        addAccount: (a) => commit((s) => ({ accounts: [...s.accounts, { ...a, id: uid("acc") }] })),
        patchAccount: (id, patch) =>
          commit((s) => ({
            accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          })),
        removeAccount: (id) =>
          commit((s) => ({
            accounts: s.accounts.filter((a) => a.id !== id),
            activeAccountId:
              s.activeAccountId === id
                ? (s.accounts.find((a) => a.id !== id)?.id ?? "")
                : s.activeAccountId,
          })),
        setActiveAccount: (activeAccountId) => set({ activeAccountId, dialog: null }),
        transfer: (from, to, amount, note, date) =>
          commit((s) => {
            const accounts = s.accounts.map((a) => {
              if (a.id === from)
                return { ...a, balance: Math.round((a.balance - amount) * 100) / 100 };
              if (a.id === to)
                return { ...a, balance: Math.round((a.balance + amount) * 100) / 100 };
              return a;
            });
            const src = s.accounts.find((a) => a.id === from);
            const dst = s.accounts.find((a) => a.id === to);
            const tx: Tx = {
              id: uid("tx"),
              date,
              label: note || `Virement → ${dst?.name ?? "compte"}`,
              category: "Virement",
              accountId: from,
              toAccountId: to,
              amount,
              scope: src?.scope ?? "perso",
              kind: "transfer",
              recurring: false,
              pending: false,
            };
            return { accounts, txs: [tx, ...s.txs], dialog: null };
          }),
        saveGoal: (g) =>
          commit((s) => ({
            goals: s.goals.some((x) => x.id === g.id)
              ? s.goals.map((x) => (x.id === g.id ? g : x))
              : [g, ...s.goals],
            dialog: null,
          })),
        removeGoal: (id) => commit((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
        saveDebt: (d) =>
          commit((s) => ({
            debts: s.debts.some((x) => x.id === d.id)
              ? s.debts.map((x) => (x.id === d.id ? d : x))
              : [d, ...s.debts],
            dialog: null,
          })),
        payDebt: (id) =>
          commit((s) => ({
            debts: s.debts.map((d) =>
              d.id === id
                ? {
                    ...d,
                    remaining: Math.max(0, Math.round((d.remaining - d.monthly) * 100) / 100),
                  }
                : d,
            ),
          })),
        toggleRule: (id) =>
          commit((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, on: !r.on } : r)) })),
        addRule: (r) =>
          commit((s) => ({ rules: [{ ...r, id: uid("rule") }, ...s.rules], dialog: null })),
        setSubStatus: (id, status) =>
          commit((s) => ({ subs: s.subs.map((x) => (x.id === id ? { ...x, status } : x)) })),
        addSub: (sub) =>
          commit((s) => ({ subs: [{ ...sub, id: uid("sub") }, ...s.subs], dialog: null })),
        togglePlan: (id) =>
          commit((s) => ({
            plans: s.plans.map((p) =>
              p.id === id ? { ...p, status: p.status === "actif" ? "pause" : "actif" } : p,
            ),
          })),
        addPlan: (p) => commit((s) => ({ plans: [{ ...p, id: uid("plan") }, ...s.plans] })),
        setBudgets: (budgets) => commit({ budgets, dialog: null }),
        patchSettings: (p) => commit((s) => ({ settings: { ...s.settings, ...p } })),
        /*
         * Layout changes are preferences, not ledger edits: they must not land
         * in the undo history (an undo should never reshuffle the dashboard).
         * They are still persisted, so the arrangement survives a reload.
         */
        moveDashBlock: (id, dir) =>
          set((s) => {
            const order = [...s.dashOrder];
            const i = order.indexOf(id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= order.length) return {};
            [order[i], order[j]] = [order[j], order[i]];
            return { dashOrder: order };
          }),
        placeDashBlock: (id, to) =>
          set((s) => {
            const order = [...s.dashOrder];
            const from = order.indexOf(id);
            if (from < 0) return {};
            order.splice(from, 1);
            order.splice(Math.max(0, Math.min(to, order.length)), 0, id);
            return { dashOrder: order };
          }),
        toggleDashBlock: (id) =>
          set((s) => ({
            dashHidden: s.dashHidden.includes(id)
              ? s.dashHidden.filter((x) => x !== id)
              : [...s.dashHidden, id],
          })),
        resetDash: () => set({ dashOrder: DASH_DEFAULT, dashHidden: [] }),
        patchPro: (p) => commit((s) => ({ pro: { ...s.pro, ...p } })),
        patchProfile: (p) => commit((s) => ({ profile: { ...s.profile, ...p } })),
        markNotifs: () => set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, read: true })) })),
        markInvoice: (id) =>
          commit((s) => {
            const inv = s.invoices.find((i) => i.id === id);
            if (!inv || inv.status === "payée") return s;
            const tx: Tx = {
              id: uid("tx"),
              date: TODAY,
              label: inv.client,
              category: "Prestation",
              accountId: "pro",
              amount: inv.amount,
              scope: "pro",
              kind: "income",
              recurring: false,
              pending: false,
            };
            return {
              invoices: s.invoices.map((i) =>
                i.id === id ? { ...i, status: "payée" as const } : i,
              ),
              txs: [tx, ...s.txs],
              accounts: s.accounts.map((a) =>
                a.id === "pro"
                  ? { ...a, balance: Math.round((a.balance + inv.amount) * 100) / 100 }
                  : a,
              ),
            };
          }),
        addInvoice: (i) =>
          commit((s) => {
            const n = 1043 + s.invoices.length;
            return {
              invoices: [{ ...i, id: uid("inv"), number: `${s.pro.prefix}${n}` }, ...s.invoices],
              dialog: null,
            };
          }),
        remind: (id) => {
          const inv = get().invoices.find((i) => i.id === id);
          return inv ? `Relance envoyée à ${inv.client}` : "Relance envoyée";
        },
        closeSession: (id) => commit((s) => ({ closedSessions: [...s.closedSessions, id] })),
        setTwoFa: (twoFa) => commit({ twoFa }),
        markDuplicated: (month) =>
          commit((s) => ({ duplicated: [...new Set([...s.duplicated, month])], dialog: null })),
        wipe: () =>
          commit({
            txs: [],
            goals: [],
            debts: [],
            subs: [],
            rules: [],
            invoices: [],
            dialog: null,
          }),
      };
    },
    {
      name: "freev",
      skipHydration: true,
      partialize: (s) => ({
        theme: s.theme,
        mode: s.mode,
        month: s.month,
        txs: s.txs,
        accounts: s.accounts,
        goals: s.goals,
        debts: s.debts,
        rules: s.rules,
        subs: s.subs,
        plans: s.plans,
        invoices: s.invoices,
        budgets: s.budgets,
        settings: s.settings,
        dashOrder: s.dashOrder,
        dashHidden: s.dashHidden,
        pro: s.pro,
        notifs: s.notifs,
        profile: s.profile,
        activeAccountId: s.activeAccountId,
        logoPick: s.logoPick,
        closedSessions: s.closedSessions,
        twoFa: s.twoFa,
        duplicated: s.duplicated,
      }),
    },
  ),
);
