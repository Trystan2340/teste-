export type Scope = "perso" | "pro";
export type Mode = "perso" | "pro" | "both";
export type TxKind = "expense" | "income" | "transfer";

export type Account = {
  id: string;
  name: string;
  bank: string;
  balance: number;
  scope: Scope;
  kind: "courant" | "epargne" | "pro";
};

export type Tx = {
  id: string;
  date: string;
  label: string;
  category: string;
  accountId: string;
  toAccountId?: string;
  amount: number;
  scope: Scope;
  kind: TxKind;
  recurring: boolean;
  pending: boolean;
  logo?: string;
  note?: string;
};

export type Goal = {
  id: string;
  name: string;
  current: number;
  target: number;
  due: string;
  accountId: string;
};

export type Debt = {
  id: string;
  name: string;
  remaining: number;
  monthly: number;
  rate: number;
  end: string;
};

export type Rule = {
  id: string;
  name: string;
  when: string;
  action: string;
  on: boolean;
};

export type Sub = {
  id: string;
  name: string;
  price: number;
  renews: string;
  category: string;
  status: "actif" | "pause" | "essai" | "résilié";
  trialEnd?: string;
};

export type SmartPlan = {
  id: string;
  name: string;
  detail: string;
  amount: number;
  status: "actif" | "pause";
};

export type Invoice = {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: "payée" | "en attente" | "en retard";
  date: string;
};

export type Client = {
  id: string;
  name: string;
  logo: string;
  last: string;
  status: string;
};

export type Notif = {
  id: string;
  title: string;
  detail: string;
  time: string;
  href: string;
  read: boolean;
};

export const TODAY = "2026-11-19";

export const ACCOUNTS: Account[] = [
  {
    id: "courant",
    name: "Compte courant",
    bank: "BoursoBank",
    balance: 4280,
    scope: "perso",
    kind: "courant",
  },
  {
    id: "livret",
    name: "Livret A",
    bank: "BoursoBank",
    balance: 8640,
    scope: "perso",
    kind: "epargne",
  },
  { id: "pro", name: "Compte pro", bank: "Qonto", balance: 5500, scope: "pro", kind: "pro" },
];

export const CATEGORIES = [
  "Logement",
  "Alimentation",
  "Transport",
  "Abonnements",
  "Énergie",
  "Santé",
  "Loisirs",
  "Maison",
  "Impôts",
  "Charges",
  "Matériel",
  "Prestation",
  "Revenus",
  "Autre",
];

function row(
  id: string,
  date: string,
  label: string,
  category: string,
  accountId: string,
  amount: number,
  scope: Scope,
  extra: Partial<Tx> = {},
): Tx {
  return {
    id,
    date,
    label,
    category,
    accountId,
    amount,
    scope,
    kind: amount < 0 ? "expense" : "income",
    recurring: false,
    pending: false,
    ...extra,
  };
}

export const SEED_TX: Tx[] = [
  row("t1", "2026-11-18", "Courses Monoprix", "Alimentation", "courant", -64.2, "perso"),
  row("t2", "2026-11-17", "Atelier Nord", "Prestation", "pro", 2400, "pro", { logo: "AN" }),
  row("t3", "2026-11-17", "Cadeau", "Loisirs", "courant", -35, "perso"),
  row("t4", "2026-11-16", "Essence", "Transport", "courant", -52, "perso"),
  row("t5", "2026-11-15", "URSSAF", "Charges", "pro", -820, "pro", { recurring: true }),
  row("t6", "2026-11-15", "Assurance auto", "Transport", "courant", -62, "perso", {
    recurring: true,
  }),
  row("t7", "2026-11-14", "Maison Brume", "Prestation", "pro", 960, "pro", { logo: "MB" }),
  row("t8", "2026-11-14", "Courses bio", "Alimentation", "courant", -73.5, "perso"),
  row("t9", "2026-11-13", "Pharmacie", "Santé", "courant", -22, "perso"),
  row("t10", "2026-11-12", "Netflix", "Abonnements", "courant", -15.9, "perso", {
    recurring: true,
    logo: "N",
  }),
  row("t11", "2026-11-11", "Restaurant", "Loisirs", "courant", -46, "perso"),
  row("t12", "2026-11-10", "Courses Carrefour", "Alimentation", "courant", -128.4, "perso"),
  row("t13", "2026-11-09", "Comptable", "Charges", "pro", -150, "pro"),
  row("t14", "2026-11-09", "Spotify", "Abonnements", "courant", -11, "perso", {
    recurring: true,
    logo: "S",
  }),
  row("t15", "2026-11-08", "Internet", "Abonnements", "courant", -30, "perso", { recurring: true }),
  row("t16", "2026-11-08", "Remboursement impôts", "Revenus", "courant", 1800, "perso"),
  row("t17", "2026-11-07", "Logiciels", "Abonnements", "pro", -55, "pro", { recurring: true }),
  row("t18", "2026-11-06", "Fournitures", "Matériel", "pro", -140, "pro"),
  row("t19", "2026-11-06", "Prime", "Revenus", "courant", 1200, "perso"),
  row("t20", "2026-11-05", "EDF", "Énergie", "courant", -74, "perso", { recurring: true }),
  row("t21", "2026-11-04", "Salle de sport", "Abonnements", "courant", -39.9, "perso", {
    recurring: true,
  }),
  row("t22", "2026-11-04", "Leboncoin", "Revenus", "courant", 220, "perso"),
  row("t23", "2026-11-03", "Mutuelle", "Santé", "courant", -48, "perso", { recurring: true }),
  row("t24", "2026-11-03", "Sécurité sociale", "Revenus", "courant", 260, "perso"),
  row("t25", "2026-11-02", "Coworking", "Charges", "pro", -160, "pro"),
  row("t26", "2026-11-02", "Shopping", "Loisirs", "courant", -180, "perso"),
  row("t27", "2026-11-01", "Loyer", "Logement", "courant", -890, "perso", { recurring: true }),
  row("t28", "2026-11-01", "Navigo", "Transport", "courant", -86.1, "perso", { recurring: true }),
  row("t29", "2026-11-01", "Impôts locaux", "Impôts", "courant", -480, "perso"),
  row("t30", "2026-11-11", "Équipement maison", "Maison", "courant", -390, "perso"),
  row("t31", "2026-11-07", "Déjeuner client", "Loisirs", "courant", -72, "perso"),
  row("t32", "2026-11-13", "Divers", "Autre", "courant", -90, "perso"),
];

export const SCHEDULE = [
  { id: "s1", day: 1, label: "Loyer", amount: -890, category: "Logement" },
  { id: "s2", day: 5, label: "EDF", amount: -74, category: "Énergie" },
  { id: "s3", day: 12, label: "Netflix", amount: -15.9, category: "Abonnements" },
  { id: "s4", day: 21, label: "iCloud", amount: -2.99, category: "Abonnements" },
  { id: "s5", day: 28, label: "Salaire", amount: 3200, category: "Revenus" },
  { id: "s6", day: 30, label: "Épargne auto", amount: -200, category: "Épargne" },
];

export const SERIES = [
  { m: "Juin", inn: 6100, out: 4800 },
  { m: "Juil.", inn: 6400, out: 5100 },
  { m: "Août", inn: 5900, out: 4700 },
  { m: "Sept.", inn: 6400, out: 5100 },
  { m: "Oct.", inn: 6510, out: 4480 },
  { m: "Nov.", inn: 6840, out: 4215 },
];

export const HISTORY = [
  { id: "2026-11", label: "Novembre 2026", inn: 6840, out: 4215 },
  { id: "2026-10", label: "Octobre 2026", inn: 6510, out: 4480 },
  { id: "2026-09", label: "Septembre 2026", inn: 6400, out: 5100 },
  { id: "2026-08", label: "Août 2026", inn: 5900, out: 4700 },
  { id: "2026-07", label: "Juillet 2026", inn: 6400, out: 5100 },
  { id: "2026-06", label: "Juin 2026", inn: 6100, out: 4800 },
];

export const GOALS: Goal[] = [
  {
    id: "g1",
    name: "Voyage Japon",
    current: 2400,
    target: 4000,
    due: "2027-06-01",
    accountId: "livret",
  },
  {
    id: "g2",
    name: "Apport appartement",
    current: 8600,
    target: 20000,
    due: "2028-12-01",
    accountId: "livret",
  },
  {
    id: "g3",
    name: "Fonds de sécurité",
    current: 3200,
    target: 3000,
    due: "2026-12-01",
    accountId: "livret",
  },
];

export const DEBTS: Debt[] = [
  { id: "d1", name: "Crédit auto", remaining: 4800, monthly: 210, rate: 3.2, end: "2028-06-01" },
  { id: "d2", name: "Prêt familial", remaining: 1200, monthly: 100, rate: 0, end: "2027-11-01" },
];

export const RULES: Rule[] = [
  { id: "r1", name: "Alerte loyer", when: "Logement dépasse 900 €", action: "Notifier", on: true },
  {
    id: "r2",
    name: "Épargne au salaire",
    when: "Salaire reçu",
    action: "Virer 200 € vers le Livret A",
    on: true,
  },
  {
    id: "r3",
    name: "Gros abonnement",
    when: "Abonnement supérieur à 20 €",
    action: "Demander confirmation",
    on: false,
  },
];

export const SUBS: Sub[] = [
  {
    id: "sub1",
    name: "Netflix",
    price: 15.9,
    renews: "12 du mois",
    category: "Abonnements",
    status: "actif",
  },
  {
    id: "sub2",
    name: "Spotify",
    price: 11,
    renews: "9 du mois",
    category: "Abonnements",
    status: "actif",
  },
  {
    id: "sub3",
    name: "Salle de sport",
    price: 39.9,
    renews: "4 du mois",
    category: "Abonnements",
    status: "actif",
  },
  {
    id: "sub4",
    name: "iCloud",
    price: 2.99,
    renews: "21 du mois",
    category: "Abonnements",
    status: "actif",
  },
  {
    id: "sub5",
    name: "Suite créative",
    price: 23,
    renews: "18 du mois",
    category: "Outils",
    status: "essai",
    trialEnd: "2026-11-30",
  },
];

export const PLANS: SmartPlan[] = [
  {
    id: "p1",
    name: "Épargne auto",
    detail: "200 € virés vers le Livret A le 30",
    amount: 200,
    status: "actif",
  },
  {
    id: "p2",
    name: "Lissage des charges",
    detail: "Réserve de 150 € pour EDF et impôts",
    amount: 150,
    status: "actif",
  },
  {
    id: "p3",
    name: "Remboursement anticipé",
    detail: "100 € de plus sur le crédit auto",
    amount: 100,
    status: "pause",
  },
];

export const INVOICES: Invoice[] = [
  {
    id: "i1",
    number: "FAC-1042",
    client: "Atelier Nord",
    amount: 2400,
    status: "payée",
    date: "2026-11-17",
  },
  {
    id: "i2",
    number: "FAC-1038",
    client: "Studio Lina",
    amount: 1800,
    status: "en attente",
    date: "2026-11-12",
  },
  {
    id: "i3",
    number: "FAC-1031",
    client: "Maison Brume",
    amount: 960,
    status: "payée",
    date: "2026-11-04",
  },
];

export const CLIENTS: Client[] = [
  { id: "c1", name: "Atelier Nord", logo: "AN", last: "Payée · 2 400 €", status: "à jour" },
  { id: "c2", name: "Studio Lina", logo: "SL", last: "En attente · 1 800 €", status: "relance" },
  { id: "c3", name: "Maison Brume", logo: "MB", last: "Payée · 960 €", status: "à jour" },
];

export const NOTIFS: Notif[] = [
  {
    id: "n1",
    title: "EDF a augmenté de 18 %",
    detail: "Par rapport à votre moyenne des six derniers mois.",
    time: "il y a 2 h",
    href: "/analytique",
    read: false,
  },
  {
    id: "n2",
    title: "2 abonnements se renouvellent",
    detail: "iCloud le 21, épargne auto le 30.",
    time: "hier",
    href: "/abonnements",
    read: false,
  },
  {
    id: "n3",
    title: "FAC-1038 encore en attente",
    detail: "Studio Lina · 1 800 € depuis le 12 novembre.",
    time: "il y a 3 j",
    href: "/business",
    read: false,
  },
];

export const LOGOS = ["AN", "SL", "MB", "N", "S", "FV", "QB", "EDF"];

export const HELP = [
  {
    id: "h1",
    title: "Ajouter une opération",
    body: "Depuis n’importe quel écran, « Nouvelle opération » ouvre le journal. Choisissez dépense, revenu ou virement, puis le compte. Le solde du compte bouge tout de suite.",
  },
  {
    id: "h2",
    title: "Lire le solde projeté",
    body: "Le planner additionne ce qui est déjà passé et les échéances restantes du mois. Le salaire du 28 et l’épargne auto du 30 sont encore devant vous.",
  },
  {
    id: "h3",
    title: "Relier un compte",
    body: "Paramètres → Gérer les comptes. Ajoutez un courant, un livret ou un compte pro. Le solde de départ se corrige sans réécrire l’historique.",
  },
  {
    id: "h4",
    title: "Contrôle de fin de mois",
    body: "Le centre « Contrôle mensuel » passe en revue les anomalies, le budget, puis prépare le rapport. Rien n’est figé tant que vous ne terminez pas.",
  },
  {
    id: "h5",
    title: "Passer en mode professionnel",
    body: "Le sélecteur Personnel / Pro / Les deux, en haut, filtre le journal et le tableau de bord. La page Business reste la vue factures et trésorerie.",
  },
];

export const SESSIONS = [
  { id: "se1", device: "Chrome · Paris", when: "en ce moment", current: true },
  { id: "se2", device: "Safari · Lyon", when: "il y a 3 jours", current: false },
];

export const BUDGETS: Record<string, number> = {
  Logement: 1400,
  Alimentation: 500,
  Transport: 250,
  Abonnements: 120,
  Énergie: 90,
  Santé: 80,
  Loisirs: 250,
  Charges: 1200,
  Autre: 200,
};

export const SNAP = {
  both: { balance: 18420, delta: 4.2, health: 82 },
  perso: { balance: 12920, delta: 3.1, health: 76 },
  pro: { balance: 5500, delta: 8.4, health: 88 },
} as const;

export function inScope(scope: Scope, mode: Mode) {
  return mode === "both" || mode === scope;
}
