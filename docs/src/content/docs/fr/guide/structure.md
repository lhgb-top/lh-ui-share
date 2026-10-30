---
title: Structure du package
description: "Les responsabilités des répertoires src / styles / tests / scripts, et la méthode de comptage derrière les deux nombres 56 et 58"
---

# Structure du package

## Côté sources

```
lh-ui-share/
├── src/
│   ├── core/                  Couche des fonctions pures des composants (zéro import de framework, gate grep en CI)
│   │   ├── <composant>/       Le trio logic.ts / types.ts / index.ts
│   │   └── shared/            Noyau partagé entre composants (12 modules, normalisés en <name>/index.ts)
│   ├── theme/                 Côté TS du thème : types + 5 préréglages + primitives d'exécution
│   ├── constants/             Constantes LH_* (LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …)
│   ├── locales/               LhLocale (pure emitter) + lang/ : six squelettes de langues
│   ├── types/                 Types publics (locale / components)
│   ├── utils/                 Utilitaires purs (createNamespace / deepMerge …)
│   └── index.ts               Entrée de l'agrégat complet
├── styles/                    Source unique des styles BEM des composants
│   ├── <composant>/index.scss 58 ensembles de styles de composants
│   └── theme/
│       ├── common/
│       │   ├── var.scss       Jetons clairs (:root, 185 --lh-*)
│       │   ├── var-dark.scss  Surcharge sombre ([data-theme='dark'], .dark, 118 entrées)
│       │   ├── variables.scss 183 variables SCSS $lh-* (!default)
│       │   ├── patterns.scss  6 mixins de motifs style chinois
│       │   ├── transition.scss Trois mixins de classes de transition (fédèrent les différences entre plateformes)
│       │   └── a11y.scss      Styles d'assistance à l'accessibilité
│       └── index.scss         Agrégat du thème
│   └── index.scss             Agrégat complet (jetons + tous les composants, généré par script, à ne pas modifier à la main)
├── tests/unit/                L'unique exemplaire des tests unitaires de core (partagé par les trois bibliothèques, sans recopie)
├── scripts/                   Les scripts de build et de vérification
├── docs/                      Ce site de documentation (Astro Starlight)
└── .changeset/                Les changesets en attente de publication
```

## Les responsabilités de chaque répertoire

| Répertoire | Responsabilité | Ligne rouge |
| --- | --- | --- |
| `src/core/<name>/` | Fonctions pures des composants : calculs de classes / machines à états / paquets d'attributs aria | Interdiction `import 'vue' \| 'react' \| '@dcloudio/*'` |
| `src/core/shared/` | Noyau partagé entre composants, directement réutilisé par chaque plateforme | Idem ; déjà normalisé en `<name>/index.ts` |
| `styles/` | **Source unique** des styles BEM des composants | Interdiction de copier les styles dans une bibliothèque UI pour les modifier ; classes en `lh-*` ; les couleurs toujours en `var(--lh-*, fallback)` |
| `tests/unit/` | **L'unique exemplaire** des tests unitaires de core | Les bibliothèques UI n'ont pas le droit de les copier |
| `scripts/` | extract-from-plus (usage unique) / build-styles / verify-* / release | — |

## La méthode de comptage des composants : 56 ou 58

Les deux nombres sont justes, ils ne mesurent pas la même chose :

| Méthode | Nombre | Origine |
| --- | --- | --- |
| Composants de fonctions pures core | **56** | Les répertoires de composants sous `src/core/` (`shared/` exclu) |
| Ensembles de styles de composants | **58** | Les répertoires de composants sous `styles/` (`theme/` exclue) |

La différence vient de ces trois entrées :

| Nom | core | styles | Raison |
| --- | --- | --- | --- |
| `layout` | — | ✅ | Conteneur de mise en page, toute la logique est dans la couche UI (câblage des points de rupture réactifs de row/col) |
| `tree-select` | — | ✅ | La colle du sélecteur est côté framework, la logique des données arborescentes réutilise `core/tree` |
| `config` ↔ `config-provider` | `config` | `config-provider` | Une seule chose, deux noms de répertoire |

## Les artefacts de build

`pnpm build` produit quatre répertoires, et `files` ne publie que ceux-là :

| Artefact | Structure | Description |
| --- | --- | --- |
| `es/` | preserveModules reflétant `src/` | ESM, sous-chemins fichier par fichier à la demande |
| `lib/` | idem | CJS (la condition `require`) |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | Artefacts de styles agrégés |
| `styles/` | Publié tel quel | **Source SCSS**, à compiler par le projet |

Les artefacts restent **sans aucune dépendance de framework** : `verify:dts` analyse `es/**/*.d.ts`, toute importation de framework fait échouer.

## À quoi ressemble l'artefact d'un seul composant (button en exemple)

```
es/button/
├── index.d.ts        Les types
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     Le style du composant, déjà compilé (forme plateforme plus)
    └── index.scss    La source (@use réécrits en bare specifier, diffusée avec l'artefact)
```

`lib/button/` est isomorphe. Les bibliothèques UI des deux plateformes rajoutent ensuite chacune une couche `es/components/<name>/style/index.css`
(côté vue2, seul le css est publié, pas le scss).
