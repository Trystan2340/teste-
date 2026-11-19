import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const LINKS = [
  { to: "/budget-personnel", label: "Budget" },
  { to: "/suivi-depenses", label: "Dépenses" },
  { to: "/abonnements-recurrents", label: "Abonnements" },
  { to: "/tresorerie", label: "Trésorerie" },
] as const;

function Site({
  kicker,
  title,
  lede,
  points,
}: {
  kicker: string;
  title: string;
  lede: string;
  points: { t: string; d: string }[];
}) {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="flex flex-wrap items-center gap-4 border-b border-rule px-5 py-4">
        <Link to="/" className="font-serif text-2xl">
          FREEV
        </Link>
        <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-mist">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="ml-auto border border-copper px-3 py-2 text-xs uppercase tracking-widest text-copper">
          Ouvrir l’app
        </Link>
      </header>
      <main>
        <section className="grid gap-8 border-b border-rule px-5 py-16 lg:grid-cols-12 lg:px-10">
          <p className="text-xs uppercase tracking-widest text-copper lg:col-span-3">{kicker}</p>
          <div className="lg:col-span-9">
            <h1 className="max-w-3xl font-serif text-5xl leading-none md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-xl text-sm text-mist">{lede}</p>
          </div>
        </section>
        <section className="grid border-b border-rule lg:grid-cols-3">
          {points.map((p, i) => (
            <article key={p.t} className="border-b border-rule p-6 lg:border-r lg:border-b-0">
              <p className="text-xs uppercase tracking-widest text-mist">0{i + 1}</p>
              <h2 className="mt-3 font-serif text-2xl">{p.t}</h2>
              <p className="mt-2 text-sm text-mist">{p.d}</p>
            </article>
          ))}
        </section>
        <section className="grid gap-8 px-5 py-16 lg:grid-cols-12 lg:px-10">
          <h2 className="font-serif text-3xl lg:col-span-4">Tarifs</h2>
          <div className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
            <Price name="Essai" price="0 €" note="14 jours, sans carte." />
            <Price name="Personnel" price="6 €" note="Budget, récurrences, planner." />
            <Price name="Professionnel" price="14 €" note="Factures, clients, trésorerie." />
          </div>
        </section>
        <Faq />
      </main>
      <footer className="grid gap-6 border-t border-rule px-5 py-10 text-sm text-mist md:grid-cols-3 lg:px-10">
        <div>
          <p className="font-serif text-xl text-ink">FREEV</p>
          <p className="mt-2">Le livre de comptes personnel et professionnel.</p>
        </div>
        <div className="space-y-1">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="block hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="space-y-1">
          <Link to="/confidentialite" className="block hover:text-ink">
            Confidentialité
          </Link>
          <Link to="/conditions" className="block hover:text-ink">
            Conditions
          </Link>
          <a href="mailto:bonjour@freev.app" className="block hover:text-ink">
            bonjour@freev.app
          </a>
        </div>
      </footer>
    </div>
  );
}

function Price({ name, price, note }: { name: string; price: string; note: string }) {
  return (
    <div className="border-t border-copper pt-4">
      <p className="text-xs uppercase tracking-widest text-mist">{name}</p>
      <p className="mt-2 font-serif text-4xl">{price}</p>
      <p className="mt-2 text-sm text-mist">{note}</p>
    </div>
  );
}

function Faq() {
  const items = [
    ["Faut-il relier une banque ?", "Non. Vous pouvez tenir le livre à la main, scanner un reçu, ou ajouter un compte avec son solde."],
    ["Personnel et pro ensemble ?", "Oui. Le sélecteur en haut filtre le journal. Les factures restent dans Business."],
    ["Où sont les données ?", "Dans cette démo, sur cet appareil. Rien n’est envoyé à une banque."],
    ["Puis-je exporter ?", "Oui, depuis Paramètres ou depuis le rapport du mois."],
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="border-t border-rule px-5 py-16 lg:px-10">
      <h2 className="font-serif text-3xl">Questions</h2>
      <ul className="mt-6 max-w-3xl divide-y divide-rule border-y border-rule">
        {items.map(([q, a], i) => (
          <li key={q}>
            <button type="button" className="flex w-full items-center justify-between py-4 text-left" onClick={() => setOpen(i)}>
              <span>{q}</span>
              <span className="text-copper">{open === i ? "–" : "+"}</span>
            </button>
            {open === i ? <p className="pb-4 text-sm text-mist">{a}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PublicBudget() {
  return (
    <Site
      kicker="Budget personnel"
      title="Votre mois, tenu comme un livre de comptes."
      lede="Un solde, des échéances, un reste à vivre. Pas un tableau qui crie."
      points={[
        { t: "Le mois d’un regard", d: "Entrées, sorties, reste. La santé du mois en un chiffre." },
        { t: "Échéancier", d: "Loyer, énergie, salaire : passé ou encore devant." },
        { t: "Contrôle", d: "Avant de tourner la page, anomalies et budget." },
      ]}
    />
  );
}

export function PublicSpend() {
  return (
    <Site
      kicker="Suivi des dépenses"
      title="Chaque euro a une ligne."
      lede="Catégories, comptes, recherche. Le journal se filtre sans se déguiser."
      points={[
        { t: "Journal", d: "Date, libellé, catégorie, compte, montant." },
        { t: "Filtres", d: "Par type, par compte, par mot." },
        { t: "Reçu", d: "Une photo devient une ligne à confirmer." },
      ]}
    />
  );
}

export function PublicSubs() {
  return (
    <Site
      kicker="Abonnements"
      title="Ce qui se renouvelle, sans surprise."
      lede="Prix, date, pause, résiliation, essai. Le total du mois est écrit en clair."
      points={[
        { t: "Liste", d: "Netflix, salle, cloud, outils." },
        { t: "Essais", d: "Une date de fin avant le prélèvement." },
        { t: "Règles", d: "Un gros abonnement peut demander confirmation." },
      ]}
    />
  );
}

export function PublicCash() {
  return (
    <Site
      kicker="Trésorerie"
      title="La trésorerie, lisible."
      lede="Factures, clients, charges. Ce qui est payé et ce qui attend."
      points={[
        { t: "Factures", d: "Créer, relancer, marquer payée." },
        { t: "Clients", d: "Le dernier mouvement de chacun." },
        { t: "Résultat", d: "CA, charges, ce qu’il reste." },
      ]}
    />
  );
}

export function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="flex items-center gap-4 border-b border-rule px-5 py-4">
        <Link to="/budget-personnel" className="font-serif text-2xl">
          FREEV
        </Link>
        <Link to="/" className="ml-auto text-xs uppercase tracking-widest text-copper">
          Ouvrir l’app
        </Link>
      </header>
      <article className="max-w-2xl px-5 py-12">
        <h1 className="font-serif text-5xl">{title}</h1>
        <div className="mt-8 space-y-4 text-sm text-mist">{children}</div>
      </article>
    </div>
  );
}

export function Privacy() {
  return (
    <Legal title="Confidentialité">
      <p>FREEV tient un livre de comptes. Dans cette maquette, les opérations, objectifs et réglages restent dans le navigateur, sur cet appareil.</p>
      <p>Aucun relevé bancaire n’est demandé. Les reçus que vous déposez ne quittent pas la page : seule une lecture locale propose un montant.</p>
      <p>L’export JSON vous appartient. Effacer les données vide le journal local sans conserver de copie.</p>
      <p>Contact : bonjour@freev.app.</p>
    </Legal>
  );
}

export function Terms() {
  return (
    <Legal title="Conditions">
      <p>FREEV est un outil de suivi. Il ne fournit pas de conseil en investissement, ni un service de paiement.</p>
      <p>L’essai dure 14 jours. Le tarif Personnel est de 6 € par mois, le tarif Professionnel de 14 € par mois. Vous pouvez arrêter avant le renouvellement.</p>
      <p>Les chiffres affichés dépendent de ce que vous saisissez. Un solde projeté n’est pas une garantie bancaire.</p>
      <p>Le droit applicable est le droit français.</p>
    </Legal>
  );
}
