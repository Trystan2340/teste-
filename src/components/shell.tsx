import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Calendar,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Compass,
  Globe,
  Landmark,
  List,
  SquareArrowOutUpRight,
  PiggyBank,
  Plus,
  Search,
  Settings,
  Shirt,
  Sparkles,
  Store,
  Target,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { HELP, type Mode } from "@/lib/freev/data";
import { useFreev } from "@/lib/freev/store";
import { Overlays } from "@/components/overlays";
import { useUndoableToast } from "@/components/undo";
import { cn } from "@/lib/utils";

const RAIL = [
  { to: "/", label: "Tableau de bord", icon: ChartLine },
  { to: "/transactions", label: "Transactions", icon: List },
  { to: "/planner", label: "Planner", icon: Compass },
  { to: "/smart", label: "Smart", icon: Sparkles },
  { to: "/epargne", label: "Épargne", icon: PiggyBank },
  { to: "/parametres", label: "Paramètres", icon: Settings },
] as const;

const LIFE = [
  { to: "/compte", label: "Compte", icon: "face" as const },
  { to: "/business", label: "Business", icon: "store" as const },
  { to: "/abonnements", label: "Abonnements", icon: "shirt" as const },
] as const;

const MORE = [
  { to: "/analytique", label: "Analytique" },
  { to: "/historique", label: "Historique" },
  { to: "/recurrences", label: "Récurrences" },
  { to: "/dettes", label: "Dettes" },
  { to: "/patrimoine", label: "Patrimoine" },
  { to: "/regles", label: "Règles" },
  { to: "/controle", label: "Contrôle mensuel" },
  { to: "/scanner", label: "Scanner" },
  { to: "/aide", label: "Aide" },
  { to: "/securite", label: "Sécurité" },
  { to: "/rapport", label: "Rapport" },
] as const;

const MODES: { id: Mode; label: string; icon: typeof UserRound }[] = [
  { id: "perso", label: "Individuel", icon: UserRound },
  { id: "pro", label: "Groupé", icon: Users },
  { id: "both", label: "Global", icon: Globe },
];

const MONTHS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

function isActive(path: string, to: string) {
  return to === "/" ? path === "/" : path === to || path.startsWith(`${to}/`);
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  return format(parseISO(`${month}-01`), "MMMM yyyy", { locale: fr });
}

function LinesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h11" />
    </svg>
  );
}

function FaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="7" fill="currentColor" />
      <rect x="7.2" y="7.2" width="2.4" height="9.6" rx="1.2" fill="white" />
      <rect x="14.4" y="7.2" width="2.4" height="9.6" rx="1.2" fill="white" />
    </svg>
  );
}

function RailTip({ label, children }: { label: string; children: ReactNode }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <span
      className="flex w-full justify-center"
      title={label}
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: r.right + 10, y: r.top + r.height / 2 });
      }}
      onMouseLeave={() => setPos(null)}
      onFocus={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: r.right + 10, y: r.top + r.height / 2 });
      }}
      onBlur={() => setPos(null)}
    >
      {children}
      {pos ? (
        <span
          className="pointer-events-none fixed z-50 -translate-y-1/2 rounded-lg bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-canvas shadow-lift"
          style={{ left: pos.x, top: pos.y }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

function Rail({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const theme = useFreev((s) => s.theme);
  const setTheme = useFreev((s) => s.setTheme);
  const open = useFreev((s) => s.open);
  const [more, setMore] = useState(false);
  const moreOn = MORE.some((item) => isActive(path, item.to));

  return (
    <div className="grain relative flex h-full flex-col items-center border-r border-rule/70 bg-card/75 py-3 backdrop-blur-md">
      <Link
        to="/"
        onClick={onNavigate}
        aria-label="Accueil"
        className="inline-flex size-10 items-center justify-center rounded-full bg-copper font-serif text-lg text-copper-ink shadow-float ring-4 ring-copper/15"
      >
        C
      </Link>
      <div className="mt-3 flex gap-1">
        <button
          type="button"
          aria-label="Toutes les pages"
          aria-expanded={more}
          title="Toutes les pages"
          onClick={() => setMore((v) => !v)}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-xl border border-rule/80 bg-card text-mist shadow-float transition-colors hover:text-ink",
            (more || moreOn) && "border-copper/40 text-copper",
          )}
        >
          <LinesIcon />
        </button>
        <button
          type="button"
          aria-label="Ajouter une opération"
          title="Ajouter une opération"
          onClick={() => open({ name: "tx" })}
          className="inline-flex size-8 items-center justify-center rounded-xl border border-rule/80 bg-card text-ink shadow-float transition-colors hover:border-copper/40 hover:text-copper"
        >
          <Plus className="size-4" strokeWidth={1.8} />
        </button>
      </div>

      <nav
        className="mt-3 flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-1"
        aria-label="Navigation"
      >
        {RAIL.map((item) => {
          const Icon = item.icon;
          const on = isActive(path, item.to);
          return (
            <RailTip key={item.to} label={item.label}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-label={item.label}
                aria-current={on ? "page" : undefined}
                className="relative flex h-10 w-full items-center justify-center"
              >
                {on ? (
                  <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-copper" />
                ) : null}
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-2xl text-mist transition-[background-color,color,box-shadow] duration-150",
                    on
                      ? "bg-copper/12 text-copper shadow-[0_0_0_5px_color-mix(in_oklab,var(--copper)_10%,transparent)]"
                      : "hover:bg-card-2 hover:text-ink",
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={1.7} />
                </span>
              </Link>
            </RailTip>
          );
        })}
        <span className="my-2 h-px w-8 bg-rule" />
        {LIFE.map((item) => {
          const on = isActive(path, item.to);
          return (
            <RailTip key={item.to} label={item.label}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-label={item.label}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-2xl",
                  on && "bg-copper/10 ring-1 ring-copper/30",
                )}
              >
                {item.icon === "face" ? (
                  <FaceIcon className="size-7 text-teal" />
                ) : item.icon === "store" ? (
                  <Store
                    className={cn("size-[18px]", on ? "text-copper" : "text-mist")}
                    strokeWidth={1.7}
                  />
                ) : (
                  <Shirt
                    className={cn("size-[18px]", on ? "text-copper" : "text-mist")}
                    strokeWidth={1.7}
                  />
                )}
              </Link>
            </RailTip>
          );
        })}
      </nav>

      <div className="mt-2 flex w-[52px] flex-col items-center gap-1.5 rounded-3xl bg-card-2/80 p-1.5">
        <RailTip label={theme === "ink" ? "Thème clair" : "Thème sombre"}>
          <button
            type="button"
            aria-label={theme === "ink" ? "Passer au thème clair" : "Passer au thème sombre"}
            onClick={() => setTheme(theme === "paper" ? "ink" : "paper")}
            className="inline-flex size-9 items-center justify-center rounded-full bg-copper text-sm font-semibold text-copper-ink shadow-float"
          >
            T
          </button>
        </RailTip>
        <RailTip label="Rapport">
          <Link
            to="/rapport"
            onClick={onNavigate}
            aria-label="Rapport"
            className="inline-flex size-9 items-center justify-center rounded-2xl bg-leaf/15 text-leaf"
          >
            <CloudUpload className="size-[18px]" strokeWidth={1.7} />
          </Link>
        </RailTip>
        <RailTip label="Déconnexion">
          <Link
            to="/connexion"
            onClick={onNavigate}
            aria-label="Déconnexion"
            className="inline-flex size-9 items-center justify-center rounded-2xl bg-rose/12 text-rose"
          >
            <SquareArrowOutUpRight className="size-[18px]" strokeWidth={1.7} />
          </Link>
        </RailTip>
      </div>

      {more ? (
        <div className="fixed top-16 left-24 z-40 w-56 rounded-2xl border border-rule bg-card p-2 shadow-lift">
          <p className="px-2 py-1 text-xs text-mist">Toutes les pages</p>
          <ul>
            {MORE.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => {
                    setMore(false);
                    onNavigate?.();
                  }}
                  className={cn(
                    "block rounded-xl px-2 py-2 text-sm hover:bg-card-2",
                    isActive(path, item.to) && "bg-copper/10 text-copper",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  useUndoableToast();
  const mode = useFreev((s) => s.mode);
  const setMode = useFreev((s) => s.setMode);
  const month = useFreev((s) => s.month);
  const setMonth = useFreev((s) => s.setMonth);
  const setSearch = useFreev((s) => s.setSearch);
  const open = useFreev((s) => s.open);
  const theme = useFreev((s) => s.theme);
  const [cal, setCal] = useState(false);
  const [year, setYear] = useState(() => Number(month.slice(0, 4)));

  useEffect(() => {
    void useFreev.persist.rehydrate();
  }, []);

  useEffect(() => {
    const apply = () => {
      const choice = useFreev.getState().theme;
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme =
        choice === "system" ? (dark ? "ink" : "paper") : choice;
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    const unsub = useFreev.subscribe(apply);
    return () => {
      mq.removeEventListener("change", apply);
      unsub();
    };
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearch]);

  useEffect(() => {
    setYear(Number(month.slice(0, 4)));
  }, [month]);

  return (
    <div className="flex h-dvh overflow-hidden text-ink">
      <aside className="w-20 shrink-0">
        <Rail />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative px-2 pt-2 md:px-3 md:pt-3">
          <header className="chrome-pill flex items-center gap-2 overflow-x-auto rounded-3xl bg-card/95 px-2 py-2 [scrollbar-width:none] backdrop-blur-md lg:h-14 lg:flex-nowrap lg:rounded-full lg:py-0">
            <div className="flex h-10 shrink-0 items-center rounded-full bg-card-2 px-1">
              <button
                type="button"
                aria-label="Mois précédent"
                className="inline-flex size-8 items-center justify-center rounded-full text-mist hover:bg-card-2 hover:text-ink"
                onClick={() => setMonth(shiftMonth(month, -1))}
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-1 text-center text-sm whitespace-nowrap capitalize">
                {monthLabel(month)}
              </span>
              <button
                type="button"
                aria-label="Choisir un mois"
                aria-expanded={cal}
                className="inline-flex size-8 items-center justify-center rounded-full text-mist hover:bg-card-2 hover:text-ink"
                onClick={() => setCal((v) => !v)}
              >
                <Calendar className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Mois suivant"
                className="inline-flex size-8 items-center justify-center rounded-full text-mist hover:bg-card-2 hover:text-ink"
                onClick={() => setMonth(shiftMonth(month, 1))}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div
              className="flex h-10 shrink-0 items-center rounded-full bg-card-2 p-1"
              role="tablist"
              aria-label="Périmètre"
            >
              {MODES.map((m) => {
                const Icon = m.icon;
                const on = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors sm:px-3",
                      on
                        ? "pill-on bg-copper text-copper-ink shadow-float"
                        : "text-mist hover:text-ink",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={1.8} />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setSearch(true)}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-2.5 text-sm text-mist transition-colors hover:bg-card-2 hover:text-ink"
              >
                <Search className="size-4" />
                <span className="hidden xl:inline">Rechercher</span>
                <kbd className="hidden rounded-md bg-card-2 px-1.5 py-0.5 text-xs text-mist xl:inline">
                  Ctrl K
                </kbd>
              </button>
              <TopAction
                icon={Target}
                label="Budget du mois"
                onClick={() => open({ name: "budget" })}
              />
              <TopAction
                icon={Landmark}
                label="Solde de départ"
                onClick={() => open({ name: "opening" })}
              />
              <TopAction
                icon={ArrowLeftRight}
                label="Entre comptes"
                onClick={() => open({ name: "transfer" })}
              />
              <button
                type="button"
                onClick={() => open({ name: "tx" })}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-copper pr-3.5 pl-3 text-sm font-medium text-copper-ink shadow-float transition-[filter] hover:brightness-110 active:scale-[0.98]"
              >
                <Plus className="size-4" strokeWidth={2} />
                <span className="hidden sm:inline">Ajouter une opération</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>
          </header>
          {cal ? (
            <div className="absolute top-16 left-3 z-30 w-64 rounded-2xl border border-rule bg-card p-3 shadow-lift md:left-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Année précédente"
                  className="inline-flex size-8 items-center justify-center rounded-full hover:bg-card-2"
                  onClick={() => setYear((y) => y - 1)}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <p className="text-sm font-medium">{year}</p>
                <button
                  type="button"
                  aria-label="Année suivante"
                  className="inline-flex size-8 items-center justify-center rounded-full hover:bg-card-2"
                  onClick={() => setYear((y) => y + 1)}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {MONTHS.map((name, i) => {
                  const id = `${year}-${String(i + 1).padStart(2, "0")}`;
                  const on = id === month;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setMonth(id);
                        setCal(false);
                      }}
                      className={cn(
                        "h-9 rounded-xl text-sm",
                        on ? "bg-copper text-copper-ink" : "hover:bg-card-2",
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <Overlays />
      <SearchOverlay />
    </div>
  );
}

function TopAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Target;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-sm text-ink transition-colors hover:bg-card-2"
    >
      <Icon className="size-4 text-mist" strokeWidth={1.7} />
      <span className="hidden lg:inline">{label}</span>
      <span className="sr-only lg:hidden">{label}</span>
    </button>
  );
}

function SearchOverlay() {
  const open = useFreev((s) => s.searchOpen);
  const setSearch = useFreev((s) => s.setSearch);
  const txs = useFreev((s) => s.txs);
  const [value, setValue] = useState("");
  useEffect(() => {
    if (!open) setValue("");
  }, [open]);
  if (!open) return null;
  const q = value.trim().toLowerCase();
  const pages = [...RAIL, ...LIFE.map((l) => ({ to: l.to, label: l.label })), ...MORE].filter(
    (i) => !q || i.label.toLowerCase().includes(q),
  );
  const ops = txs
    .filter((t) => !q || `${t.label} ${t.category}`.toLowerCase().includes(q))
    .slice(0, 6);
  const help = HELP.filter((h) => !q || h.title.toLowerCase().includes(q));
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer la recherche"
        className="veil absolute inset-0"
        onClick={() => setSearch(false)}
      />
      <div
        role="dialog"
        aria-label="Recherche"
        className="relative mx-auto mt-16 w-full max-w-xl rounded-3xl border border-rule bg-card p-5 shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-rule">
          <Search className="size-4 text-mist" />
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Page, opération, aide"
            className="h-12 w-full bg-transparent text-lg outline-none placeholder:text-mist"
          />
          <button type="button" aria-label="Fermer" onClick={() => setSearch(false)}>
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <Group title="Pages">
            {pages.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                onClick={() => setSearch(false)}
                className="block rounded-xl px-2 py-2 text-sm hover:bg-card-2"
              >
                {p.label}
              </Link>
            ))}
          </Group>
          <Group title="Opérations">
            {ops.length === 0 ? <p className="text-sm text-mist">Aucune opération.</p> : null}
            {ops.map((t) => (
              <Link
                key={t.id}
                to="/transactions"
                onClick={() => setSearch(false)}
                className="block rounded-xl px-2 py-2 text-sm hover:bg-card-2"
              >
                {t.label}
              </Link>
            ))}
          </Group>
          <Group title="Aide">
            {help.map((h) => (
              <Link
                key={h.id}
                to="/aide"
                onClick={() => setSearch(false)}
                className="block rounded-xl px-2 py-2 text-sm hover:bg-card-2"
              >
                {h.title}
              </Link>
            ))}
          </Group>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-mist">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
