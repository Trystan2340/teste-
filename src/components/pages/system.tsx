import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Flame, Monitor, Moon, Repeat, Sun } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, InlineInput, PageHead, Toggle } from "@/components/ui";
import { CountUp } from "@/components/count-up";
import { HELP, SESSIONS, TODAY } from "@/lib/freev/data";
import { monthTotals, spentByCategory } from "@/lib/freev/calc";
import { useFreev, type ThemeChoice } from "@/lib/freev/store";
import { cn, money, monthName } from "@/lib/utils";
import { stagger } from "@/lib/stagger";

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-rule py-5 md:grid-cols-12 md:items-center">
      <div className="md:col-span-5">
        <p className="text-sm">{label}</p>
        {hint ? <p className="text-sm text-mist">{hint}</p> : null}
      </div>
      {/*
        Control cluster: on a wide row the control belongs next to the label it
        describes, not floating at the start of an empty 7-column track. Rows
        with buttons or a segmented control keep their own layout.
      */}
      <div className="md:col-span-7 md:justify-self-end">{children}</div>
    </div>
  );
}

export function Settings() {
  const theme = useFreev((s) => s.theme);
  const setTheme = useFreev((s) => s.setTheme);
  const settings = useFreev((s) => s.settings);
  const patch = useFreev((s) => s.patchSettings);
  const open = useFreev((s) => s.open);
  const profile = useFreev((s) => s.profile);
  return (
    <div>
      <PageHead
        kicker="Réglages"
        title="Paramètres"
        lede="Apparence, langue, alertes, et la porte vers l’activité professionnelle."
      />
      <div className="stagger">
        <Row label="Apparence" hint="Encre sombre, papier clair, ou le réglage de l’appareil.">
          <div className="flex flex-wrap gap-1 rounded-full bg-card-2 p-1">
            {(
              [
                ["ink", "Sombre", Moon],
                ["paper", "Clair", Sun],
                ["system", "Système", Monitor],
              ] as [ThemeChoice, string, typeof Moon][]
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                aria-pressed={theme === id}
                onClick={() => setTheme(id)}
                className={
                  theme === id
                    ? "pill-on inline-flex h-9 items-center gap-1.5 rounded-full bg-copper px-3.5 text-sm font-medium text-copper-ink shadow-float"
                    : "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm text-mist transition-colors duration-[var(--dur-1)] hover:text-ink"
                }
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Devise" hint="Le livre est tenu en euros.">
          <p className="text-sm">EUR</p>
        </Row>
        <Row label="Langue">
          <p className="text-sm">Français</p>
        </Row>
        <Row label="Début de semaine">
          <p className="text-sm">Lundi</p>
        </Row>
        <Row label="Notifications e-mail">
          <Toggle
            on={settings.notifEmail}
            onChange={(v) => patch({ notifEmail: v })}
            label="E-mail"
          />
        </Row>
        <Row label="Notifications push">
          <Toggle on={settings.notifPush} onChange={(v) => patch({ notifPush: v })} label="Push" />
        </Row>
        <Row label="Récapitulatif hebdomadaire">
          <Toggle
            on={settings.notifWeekly}
            onChange={(v) => patch({ notifWeekly: v })}
            label="Hebdo"
          />
        </Row>
        <Row label="Conseils" hint="Suggestions sur l’écran Smart.">
          <Toggle on={settings.advice} onChange={(v) => patch({ advice: v })} label="Conseils" />
        </Row>
        <Row label="Comptes">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => open({ name: "accounts" })}>Gérer les comptes</Button>
            <Button onClick={() => open({ name: "opening" })}>Solde de départ</Button>
            <Button onClick={() => open({ name: "transfer" })}>Entre comptes</Button>
          </div>
        </Row>
        <Row label="Professionnel" hint={profile.name}>
          <Link to="/parametres-pro" className="text-xs uppercase tracking-widest text-copper">
            Paramètres professionnels
          </Link>
        </Row>
        <Row label="Données">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                const data = useFreev.getState();
                const blob = new Blob(
                  [
                    JSON.stringify(
                      { txs: data.txs, accounts: data.accounts, goals: data.goals },
                      null,
                      2,
                    ),
                  ],
                  {
                    type: "application/json",
                  },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "freev-export.json";
                a.click();
                URL.revokeObjectURL(url);
                toast("Export téléchargé");
              }}
            >
              Exporter
            </Button>
            <Button onClick={() => open({ name: "wipe" })}>Supprimer</Button>
          </div>
        </Row>
      </div>
    </div>
  );
}

export function ProSettings() {
  const pro = useFreev((s) => s.pro);
  const patch = useFreev((s) => s.patchPro);
  const open = useFreev((s) => s.open);
  return (
    <div>
      <PageHead
        kicker="Studio"
        title="Paramètres professionnels"
        lede="Identité, factures, relances."
      />
      <Row label="Nom commercial">
        <input
          value={pro.tradeName}
          onChange={(e) => patch({ tradeName: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="SIRET">
        <input
          value={pro.siret}
          onChange={(e) => patch({ siret: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="TVA">
        <input
          value={pro.vat}
          onChange={(e) => patch({ vat: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="Adresse">
        <input
          value={pro.address}
          onChange={(e) => patch({ address: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="Préfixe des factures">
        <input
          value={pro.prefix}
          onChange={(e) => patch({ prefix: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="Délai de paiement (jours)">
        <input
          value={pro.delay}
          onChange={(e) => patch({ delay: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="Mention">
        <input
          value={pro.mention}
          onChange={(e) => patch({ mention: e.target.value })}
          className="w-full border-b border-rule bg-transparent py-2 text-sm outline-none"
        />
      </Row>
      <Row label="Relances automatiques">
        <Toggle on={pro.remind} onChange={(v) => patch({ remind: v })} label="Relances" />
      </Row>
      <Row label="Relance si retard">
        <Toggle on={pro.remindLate} onChange={(v) => patch({ remindLate: v })} label="Retard" />
      </Row>
      <Row label="Comptes encaissement">
        <Button onClick={() => open({ name: "accounts" })}>Gérer les comptes</Button>
      </Row>
      <div className="pt-4">
        <Button variant="primary" onClick={() => toast("Paramètres professionnels enregistrés")}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

const STEPS = ["Aperçu", "Anomalies", "Budget", "Rapport"];

export function MonthCheck() {
  const [step, setStep] = useState(0);
  const txs = useFreev((s) => s.txs);
  const budgets = useFreev((s) => s.budgets);
  const month = useFreev((s) => s.month);
  const flow = monthTotals(txs, "both", month);
  const split = spentByCategory(txs, "both", month);
  const label = monthName(month);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Centre"
        title="Contrôle mensuel"
        lede={`Quatre temps pour fermer ${label} sans rien laisser de côté.`}
      />
      <ol
        className="flex gap-1 overflow-x-auto rounded-full bg-card-2 p-1 [scrollbar-width:none]"
        aria-label="Étapes du contrôle mensuel"
      >
        {STEPS.map((label, i) => (
          <li key={label} className="shrink-0">
            <button
              type="button"
              aria-current={i === step ? "step" : undefined}
              onClick={() => setStep(i)}
              className={
                i === step
                  ? "inline-flex h-9 items-center gap-2 rounded-full bg-copper px-3.5 text-sm font-medium text-copper-ink shadow-float"
                  : "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm text-mist transition-colors duration-[var(--dur-1)] hover:text-ink"
              }
            >
              <span
                className={
                  i === step
                    ? "inline-flex size-5 items-center justify-center rounded-full bg-copper-ink/20 text-[11px]"
                    : "inline-flex size-5 items-center justify-center rounded-full bg-card text-[11px]"
                }
              >
                {i + 1}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Entrées", value: flow.inn, tone: "text-sage" },
            { label: "Sorties", value: flow.out, tone: "text-clay" },
            { label: "Net", value: flow.rest, tone: "text-ink" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-rule bg-card/70 p-4">
              <span className="block text-xs font-medium tracking-wide text-mist">{s.label}</span>
              <span
                className={cn("mt-1 block font-serif text-3xl tabular-nums tracking-tight", s.tone)}
              >
                {money(s.value)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <ul className="space-y-2">
          {[
            {
              icon: Flame,
              text: "EDF est 18 % au-dessus de la moyenne des six derniers mois.",
              tone: "clay" as const,
            },
            {
              icon: Repeat,
              text: "Deux abonnements se renouvellent encore cette semaine.",
              tone: "copper" as const,
            },
            {
              icon: FileText,
              text: "La facture Studio Lina est toujours en attente.",
              tone: "copper" as const,
            },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <li
                key={a.text}
                className="flex items-start gap-3 rounded-2xl border border-rule bg-card/70 px-4 py-3 text-sm"
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    a.tone === "clay" ? "text-clay" : "text-copper",
                  )}
                  strokeWidth={1.8}
                />
                {a.text}
              </li>
            );
          })}
        </ul>
      ) : null}

      {step === 2 ? (
        <ul className="divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-card/70">
          {split.map((c) => {
            const cap = budgets[c.name];
            const ratio = cap ? Math.min(100, Math.round((c.value / cap) * 100)) : null;
            const over = cap ? c.value > cap : false;
            return (
              <li key={c.name} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{c.name}</span>
                  <span className="tabular-nums">
                    {money(c.value)}
                    {cap ? <span className="text-mist"> / {money(cap)}</span> : null}
                  </span>
                </div>
                {ratio !== null ? (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-[var(--dur-4)] ease-[var(--ease-soft)]",
                        over ? "bg-clay" : "bg-sage",
                      )}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {step === 3 ? (
        <div>
          <p className="max-w-xl text-sm text-mist">
            {label} se ferme avec un net de {money(flow.rest)}. Le rapport reprend les mêmes
            chiffres.
          </p>
          <Link
            to="/rapport"
            className="mt-4 inline-block text-xs uppercase tracking-widest text-copper"
          >
            Ouvrir le rapport
          </Link>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Retour
        </Button>
        {step < 3 ? (
          <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
            Continuer
          </Button>
        ) : (
          <Button variant="primary" onClick={() => toast(`Contrôle de ${label} terminé`)}>
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}

export function Rules() {
  const rules = useFreev((s) => s.rules);
  const toggle = useFreev((s) => s.toggleRule);
  const add = useFreev((s) => s.addRule);
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [action, setAction] = useState("");
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Centre"
        title="Règles"
        lede="Si quelque chose se produit, FREEV fait le geste que vous avez écrit."
      />
      <ul className="divide-y divide-rule border-y border-rule">
        {rules.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm">{r.name}</p>
              <p className="text-sm text-mist">
                Si {r.when} → {r.action}
              </p>
            </div>
            <Toggle on={r.on} onChange={() => toggle(r.id)} label={r.name} />
          </li>
        ))}
      </ul>
      <form
        className="grid gap-3 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          add({
            name: name.trim(),
            when: when || "condition",
            action: action || "Notifier",
            on: true,
          });
          setName("");
          setWhen("");
          setAction("");
          toast("Règle ajoutée");
        }}
      >
        <InlineInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom"
          aria-label="Nom de la règle"
        />
        <InlineInput
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          placeholder="Condition"
          aria-label="Condition"
        />
        <InlineInput
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Action"
          aria-label="Action"
        />
        <Button type="submit" variant="primary">
          Nouvelle règle
        </Button>
      </form>
    </div>
  );
}

export function Subscriptions() {
  const subs = useFreev((s) => s.subs);
  const setStatus = useFreev((s) => s.setSubStatus);
  const open = useFreev((s) => s.open);
  const active = subs.filter((s) => s.status === "actif" || s.status === "essai");
  const monthly = active.reduce((s, x) => s + x.price, 0);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Centre"
        title="Abonnements"
        lede={`${money(monthly)} partent encore chaque mois.`}
        actions={
          <Button variant="primary" onClick={() => open({ name: "trial" })}>
            Nouvel essai
          </Button>
        }
      />
      <div className="stagger grid gap-3 md:grid-cols-2">
        {subs.map((s, index) => {
          const tone =
            s.status === "actif"
              ? { dot: "bg-sage", chip: "bg-sage/15 text-sage", label: "actif" }
              : s.status === "essai"
                ? { dot: "bg-copper", chip: "bg-copper/12 text-copper", label: "essai" }
                : s.status === "pause"
                  ? { dot: "bg-mist", chip: "bg-card-2 text-mist", label: "en pause" }
                  : { dot: "bg-clay", chip: "bg-clay/15 text-clay", label: "résilié" };
          return (
            <div
              key={s.id}
              {...stagger(index)}
              className="chrome-pill flex flex-col rounded-3xl bg-card p-5 transition-[transform,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-soft)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-2xl tracking-tight">{s.name}</p>
                  <p className="mt-0.5 text-xs text-mist">
                    Renouvellement le {s.renews.replace(" du mois", "")}
                    {s.trialEnd
                      ? ` · essai jusqu’au ${format(parseISO(s.trialEnd), "d MMM", { locale: fr })}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${tone.chip}`}
                >
                  <span className={`size-1.5 rounded-full ${tone.dot}`} />
                  {tone.label}
                </span>
              </div>

              <p className="mt-4 font-serif text-3xl tabular-nums tracking-tight">
                {money(s.price)}
                <span className="text-sm text-mist"> / mois</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {s.status !== "résilié" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setStatus(s.id, s.status === "pause" ? "actif" : "pause")}
                    >
                      {s.status === "pause" ? "Reprendre" : "Mettre en pause"}
                    </Button>
                    <Button size="sm" variant="quiet" onClick={() => setStatus(s.id, "résilié")}>
                      Résilier
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="quiet" onClick={() => setStatus(s.id, "actif")}>
                    Réactiver
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Wealth() {
  const accounts = useFreev((s) => s.accounts);
  const debts = useFreev((s) => s.debts);
  const goals = useFreev((s) => s.goals);
  const liquid = accounts.reduce((s, a) => s + a.balance, 0);
  const debt = debts.reduce((s, d) => s + d.remaining, 0);
  const goalsSum = goals.reduce((s, g) => s + g.current, 0);
  return (
    <div className="space-y-8">
      <PageHead
        kicker="Centre"
        title="Patrimoine"
        lede="Liquidités, objectifs, dettes. Le net est la seule ligne qui compte."
      />
      <p className="font-serif text-5xl tabular-nums">
        <CountUp value={liquid - debt} />
      </p>
      <p className="text-sm text-mist">
        Patrimoine net · liquidités moins dettes. Les objectifs sont déjà dans les livrets.
      </p>
      <dl className="stagger grid gap-4 border-y border-rule sm:grid-cols-3">
        {[
          { label: "Liquidités", value: liquid },
          { label: "Dans les objectifs", value: goalsSum },
          { label: "Dettes", value: debt },
        ].map((row, index) => (
          <div key={row.label} {...stagger(index, 80)} className="py-4">
            <dt className="text-xs uppercase tracking-widest text-mist">{row.label}</dt>
            <dd className="font-serif text-3xl tabular-nums">{money(row.value)}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest">
        <Link to="/epargne" className="text-copper">
          Épargne
        </Link>
        <Link to="/dettes" className="text-copper">
          Dettes
        </Link>
        <Link to="/" className="text-copper">
          Comptes
        </Link>
      </div>
    </div>
  );
}

export function Security() {
  const twoFa = useFreev((s) => s.twoFa);
  const setTwoFa = useFreev((s) => s.setTwoFa);
  const closed = useFreev((s) => s.closedSessions);
  const close = useFreev((s) => s.closeSession);
  const [password, setPassword] = useState("");
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Centre"
        title="Sécurité"
        lede="Mot de passe, seconde étape, sessions ouvertes."
      />
      <form
        className="max-w-md space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 8) {
            toast("Huit caractères minimum");
            return;
          }
          setPassword("");
          toast("Mot de passe mis à jour");
        }}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Nouveau mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none"
          />
        </label>
        <Button type="submit" variant="primary">
          Changer le mot de passe
        </Button>
      </form>
      <div className="flex items-center justify-between border-y border-rule py-4">
        <div>
          <p className="text-sm">Validation en deux étapes</p>
          <p className="text-sm text-mist">
            {twoFa ? "Active sur cet appareil." : "Encore inactive."}
          </p>
        </div>
        <Toggle on={twoFa} onChange={setTwoFa} label="Deux étapes" />
      </div>
      <ul className="divide-y divide-rule">
        {SESSIONS.filter((s) => !closed.includes(s.id)).map((s) => (
          <li key={s.id} className="flex items-center justify-between py-3">
            <span>
              <span className="block text-sm">{s.device}</span>
              <span className="text-xs uppercase tracking-widest text-mist">{s.when}</span>
            </span>
            {s.current ? (
              <span className="text-xs uppercase tracking-widest text-copper">Cet appareil</span>
            ) : (
              <Button size="sm" onClick={() => close(s.id)}>
                Fermer
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Account() {
  const profile = useFreev((s) => s.profile);
  const patch = useFreev((s) => s.patchProfile);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [mode, setMode] = useState(profile.defaultMode);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Compte"
        title="Mon compte"
        lede="Le nom qui signe les rapports et l’e-mail des alertes."
      />
      <form
        className="max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          patch({ name, email, defaultMode: mode });
          toast("Compte enregistré");
        }}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Nom</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-mist">Mode par défaut</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className="mt-1 h-10 w-full rounded-full border border-transparent bg-card-2/70 px-3 text-sm text-ink outline-none transition-colors duration-[var(--dur-1)] focus:border-copper/40"
          >
            <option value="perso">Personnel</option>
            <option value="pro">Pro</option>
            <option value="both">Les deux</option>
          </select>
        </label>
        <Button type="submit" variant="primary">
          Enregistrer
        </Button>
      </form>
    </div>
  );
}

export function Help() {
  const [id, setId] = useState(HELP[0].id);
  const current = HELP.find((h) => h.id === id) ?? HELP[0];
  return (
    <div className="space-y-6">
      <PageHead kicker="Aide" title="Mode d’emploi" lede="Cinq gestes, pas un manuel." />
      <div className="grid gap-8 lg:grid-cols-12">
        <ul className="lg:col-span-4">
          {HELP.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => setId(h.id)}
                className={
                  h.id === id
                    ? "block w-full border-l-2 border-copper py-3 pl-3 text-left"
                    : "block w-full border-l-2 border-transparent py-3 pl-3 text-left text-mist"
                }
              >
                {h.title}
              </button>
            </li>
          ))}
        </ul>
        <article className="lg:col-span-8">
          <h2 className="font-serif text-3xl">{current.title}</h2>
          <p className="mt-4 max-w-xl text-sm text-mist">{current.body}</p>
        </article>
      </div>
    </div>
  );
}

export function Scanner() {
  const add = useFreev((s) => s.addTx);
  const [file, setFile] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Capture"
        title="Scanner un reçu"
        lede="Déposez une photo. On en tire un libellé et un montant à confirmer."
      />
      <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center border border-dashed border-rule p-6 text-center">
        <span className="font-serif text-3xl">{file ? "Reçu lu" : "Déposer un reçu"}</span>
        <span className="mt-2 text-sm text-mist">
          {file ?? "JPG ou PNG · la lecture reste sur cet appareil"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFile(f ? f.name : null);
            setSaved(false);
          }}
        />
      </label>
      {file ? (
        <div className="border border-rule p-4">
          <p className="text-xs uppercase tracking-widest text-copper">Lecture</p>
          <p className="mt-2 text-sm">Courses · 42,18 € · Alimentation · compte courant</p>
          <Button
            className="mt-4"
            variant="primary"
            disabled={saved}
            onClick={() => {
              add({
                date: TODAY,
                label: "Reçu scanné",
                category: "Alimentation",
                accountId: "courant",
                amount: -42.18,
                scope: "perso",
                kind: "expense",
                recurring: false,
                pending: false,
              });
              setSaved(true);
              toast("Reçu ajouté au journal");
            }}
          >
            {saved ? "Ajouté" : "Enregistrer dans le journal"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
