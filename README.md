# FREEV — studio financier

Maquette d'application de finances **personnelles et professionnelles**, en français.
Un seul livre de comptes, trois regards : `Individuel`, `Groupé` (pro) et `Global`.

## Lancer

```sh
npm install
npm run dev        # http://localhost:8080
```

`sh startup.sh` est le point de reprise utilisé après une mise en veille de l'espace
de travail : il démarre le serveur de développement uniquement s'il ne répond pas.

## Ce qui tient le projet

| Chemin | Rôle |
| --- | --- |
| `src/routes/` | 31 routes (tableau de bord, transactions, planner, business, pages publiques…) |
| `src/components/shell.tsx` | rail de navigation, barre du mois, bascule de périmètre |
| `src/components/overlays.tsx` | tous les dialogues métier (opération, budget, objectif, dette, facture…) |
| `src/components/pages/` | les six familles d'écrans |
| `src/lib/freev/data.ts` | données de démonstration, ancrées sur novembre 2026 |
| `src/lib/freev/store.ts` | état zustand persisté (`localStorage`), avec historique d'annulation |
| `src/lib/freev/history.ts` | instantanés et libellés d'annulation |

## Conventions

- **Aucun serveur de données.** Tout vit dans le navigateur (`localStorage`), c'est
  une démonstration : rien n'est envoyé nulle part.
- **Toute mutation passe par `commit()`** dans le store. Elle enregistre un
  instantané, ce qui donne un vrai « Annuler » dans le toast de confirmation.
  Les actions de navigation (`setMonth`, `setMode`, `open`…) n'y passent pas.
- **Les boutons** viennent de `src/components/ui.tsx` : `primary`, `ghost`,
  `quiet`. Dans un dialogue, les actions se groupent dans `DialogActions`
  (annuler à gauche, action à droite, empilées sur téléphone).
- **Thème** clair/sombre par `data-theme` sur `<html>`, jetons de couleur dans
  `src/styles.css` (`--copper` est l'accent).

## Vérifier

```sh
npm run typecheck
npm run lint
npm test
```
