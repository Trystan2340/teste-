import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-12">
      <aside className="flex flex-col justify-between bg-card px-6 py-8 text-ink lg:col-span-5 lg:px-10">
        <Link to="/" className="font-serif text-3xl">
          FREEV
        </Link>
        <div>
          <p className="font-serif text-4xl leading-tight md:text-5xl">Le mois, tenu comme un livre.</p>
          <ol className="mt-8 space-y-3 text-sm text-mist">
            <li>01 — Personnel, pro, ou les deux</li>
            <li>02 — Journal, échéances, factures</li>
            <li>03 — Contrôle avant de tourner la page</li>
          </ol>
        </div>
        <p className="text-xs uppercase tracking-widest text-mist">Paris · novembre 2026</p>
      </aside>
      <main className="flex items-center bg-canvas px-6 py-10 lg:col-span-7 lg:px-16">{children}</main>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("camille@freev.app");
  const [password, setPassword] = useState("livre-de-comptes");
  const [error, setError] = useState("");
  return (
    <Frame>
      <form
        className="w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes("@") || password.length < 4) {
            setError("E-mail et mot de passe requis.");
            return;
          }
          void navigate({ to: "/" });
        }}
      >
        <h1 className="font-serif text-4xl">Connexion</h1>
        <p className="mt-2 text-sm text-mist">Reprendre le livre là où vous l’avez laissé.</p>
        <label className="mt-8 block">
          <span className="text-xs uppercase tracking-widest text-mist">E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="text-xs uppercase tracking-widest text-mist">Mot de passe</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" />
        </label>
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
        <Button type="submit" variant="primary" className="mt-6">
          Entrer
        </Button>
        <p className="mt-6 text-sm text-mist">
          Pas encore de livre ?{" "}
          <Link to="/inscription" className="text-copper">
            Créer un compte
          </Link>
        </p>
      </form>
    </Frame>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <Frame>
      <form
        className="w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2 || !email.includes("@") || password.length < 8) {
            setError("Nom, e-mail, et huit caractères minimum.");
            return;
          }
          void navigate({ to: "/configuration" });
        }}
      >
        <h1 className="font-serif text-4xl">Inscription</h1>
        <p className="mt-2 text-sm text-mist">Un compte, deux vies d’argent si vous le souhaitez.</p>
        <label className="mt-8 block">
          <span className="text-xs uppercase tracking-widest text-mist">Nom</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="text-xs uppercase tracking-widest text-mist">E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="text-xs uppercase tracking-widest text-mist">Mot de passe</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" />
        </label>
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
        <Button type="submit" variant="primary" className="mt-6">
          Continuer
        </Button>
        <p className="mt-6 text-sm text-mist">
          Déjà inscrit ?{" "}
          <Link to="/connexion" className="text-copper">
            Connexion
          </Link>
        </p>
      </form>
    </Frame>
  );
}

export function Configure() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<"perso" | "pro" | null>(null);
  const [done, setDone] = useState("");
  return (
    <Frame>
      <div className="w-full max-w-lg">
        <h1 className="font-serif text-4xl">Configuration</h1>
        <p className="mt-2 text-sm text-mist">Particulier ou professionnel. Vous pourrez tenir les deux ensuite.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setKind("perso")} className={kind === "perso" ? "border border-copper p-4 text-left" : "border border-rule p-4 text-left"}>
            <span className="block font-serif text-2xl">Particulier</span>
            <span className="mt-1 block text-sm text-mist">Budget, échéances, épargne.</span>
          </button>
          <button type="button" onClick={() => setKind("pro")} className={kind === "pro" ? "border border-copper p-4 text-left" : "border border-rule p-4 text-left"}>
            <span className="block font-serif text-2xl">Professionnel</span>
            <span className="mt-1 block text-sm text-mist">Factures, clients, trésorerie.</span>
          </button>
        </div>
        {kind === "perso" ? (
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setDone("Livre personnel ouvert.");
              void navigate({ to: "/" });
            }}
          >
            <label className="block text-sm">
              Revenu mensuel estimé
              <input className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" defaultValue="3200" />
            </label>
            <label className="block text-sm">
              Loyer
              <input className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" defaultValue="890" />
            </label>
            <Button type="submit" variant="primary">
              Ouvrir le livre
            </Button>
          </form>
        ) : null}
        {kind === "pro" ? (
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setDone("Livre professionnel ouvert.");
              void navigate({ to: "/business" });
            }}
          >
            <label className="block text-sm">
              Nom commercial
              <input className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" defaultValue="Camille Morel Studio" />
            </label>
            <label className="block text-sm">
              SIRET
              <input className="mt-1 w-full border-b border-rule bg-transparent py-2 outline-none" defaultValue="849 302 118 00024" />
            </label>
            <Button type="submit" variant="primary">
              Ouvrir le livre
            </Button>
          </form>
        ) : null}
        {done ? <p className="mt-3 text-sm text-sage">{done}</p> : null}
      </div>
    </Frame>
  );
}
