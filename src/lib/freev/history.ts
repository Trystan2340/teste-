import type {
  Account,
  Debt,
  Goal,
  Invoice,
  Notif,
  Rule,
  SmartPlan,
  Sub,
  Tx,
} from "@/lib/freev/data";
import type { ProSettings, Settings } from "@/lib/freev/store";

/**
 * The slice of state that a change can touch. Navigation and chrome state
 * (dialog, search, month, mode) stay out: moving around the app is not
 * something the user should ever have to undo.
 */
export type Snapshot = {
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
  pro: ProSettings;
  notifs: Notif[];
  closedSessions: string[];
  twoFa: boolean;
  duplicated: string[];
};

export type HistoryEntry = { label: string; snap: Snapshot };

export function capture(s: Snapshot): Snapshot {
  return {
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
    pro: s.pro,
    notifs: s.notifs,
    closedSessions: s.closedSessions,
    twoFa: s.twoFa,
    duplicated: s.duplicated,
  };
}

const KEYS = Object.keys(capture({} as Snapshot)) as (keyof Snapshot)[];

/**
 * Every slice is replaced immutably, so a reference check per key is enough —
 * no deep equality pass on each keystroke of a form.
 */
export function sameSnapshot(a: Snapshot, b: Snapshot): boolean {
  return KEYS.every((k) => a[k] === b[k]);
}

function sizeChange(before: unknown[], after: unknown[]) {
  if (after.length > before.length) return "ajout" as const;
  if (after.length < before.length) return "retrait" as const;
  return "modif" as const;
}

/** Explicit French forms — no guessing gender from a word ending. */
const NOUNS: {
  key: keyof Snapshot;
  noun: string;
  added: string;
  removed: string;
  updated: string;
}[] = [
  {
    key: "txs",
    noun: "opération",
    added: "Opération ajoutée",
    removed: "Opération supprimée",
    updated: "Opération mise à jour",
  },
  {
    key: "accounts",
    noun: "compte",
    added: "Compte ajouté",
    removed: "Compte supprimé",
    updated: "Compte mis à jour",
  },
  {
    key: "goals",
    noun: "objectif",
    added: "Objectif ajouté",
    removed: "Objectif retiré",
    updated: "Objectif mis à jour",
  },
  {
    key: "debts",
    noun: "dette",
    added: "Dette ajoutée",
    removed: "Dette supprimée",
    updated: "Dette mise à jour",
  },
  {
    key: "rules",
    noun: "règle",
    added: "Règle ajoutée",
    removed: "Règle supprimée",
    updated: "Règle mise à jour",
  },
  {
    key: "subs",
    noun: "abonnement",
    added: "Abonnement ajouté",
    removed: "Abonnement supprimé",
    updated: "Abonnement mis à jour",
  },
  {
    key: "plans",
    noun: "plan",
    added: "Plan ajouté",
    removed: "Plan retiré",
    updated: "Plan mis à jour",
  },
  {
    key: "invoices",
    noun: "facture",
    added: "Facture créée",
    removed: "Facture supprimée",
    updated: "Facture mise à jour",
  },
  {
    key: "budgets",
    noun: "budget du mois",
    added: "Budget ajouté",
    removed: "Budget retiré",
    updated: "Budget du mois enregistré",
  },
  {
    key: "notifs",
    noun: "notification",
    added: "Notification ajoutée",
    removed: "Notification retirée",
    updated: "Notifications mises à jour",
  },
  {
    key: "settings",
    noun: "réglage",
    added: "Réglage ajouté",
    removed: "Réglage retiré",
    updated: "Réglage mis à jour",
  },
  {
    key: "pro",
    noun: "paramètres professionnels",
    added: "Paramètres pro créés",
    removed: "Paramètres pro retirés",
    updated: "Paramètres pro mis à jour",
  },
  {
    key: "twoFa",
    noun: "double authentification",
    added: "Double authentification activée",
    removed: "Double authentification désactivée",
    updated: "Double authentification modifiée",
  },
  {
    key: "closedSessions",
    noun: "session",
    added: "Session ajoutée",
    removed: "Session fermée",
    updated: "Sessions mises à jour",
  },
  {
    key: "duplicated",
    noun: "duplication",
    added: "Mois dupliqué",
    removed: "Duplication retirée",
    updated: "Duplication mise à jour",
  },
];

/** Short French description of what just changed, used by undo toasts. */
export function describeChange(before: Snapshot, after: Snapshot): string {
  const changed = NOUNS.filter((n) => before[n.key] !== after[n.key]);
  if (changed.length === 0) return "Modification";
  if (changed.length > 1) return "Modifications enregistrées";

  const [first] = changed;
  const b = before[first.key];
  const a = after[first.key];

  if (Array.isArray(b) && Array.isArray(a)) {
    const kind = sizeChange(b, a);
    if (kind === "ajout")
      return `${capitalize(first.noun)} ajouté${first.noun.endsWith("s") || first.noun.endsWith("t") ? "" : "e"}`;
    if (kind === "retrait")
      return `${capitalize(first.noun)} supprimé${first.noun.endsWith("s") || first.noun.endsWith("t") ? "" : "e"}`;
  }
  return `${capitalize(first.noun)} mis à jour`;
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
