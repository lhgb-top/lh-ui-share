---
title: Liste des commandes
description: 'Tableau complet : pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release'
---

Toutes les tâches de développement sont exposées via les scripts du `package.json` racine ; le gestionnaire de paquets est fixé à `pnpm`.

## Construction

| Tâche | Commande | Produit / rôle |
| --- | --- | --- |
| Construction | `pnpm build` | `es/` + `lib/` (structure en miroir preserveModules) + styles + dts + `sync:exports` |
| Produit des styles | `pnpm build:styles` | `dist/theme/` (thèmes clair et sombre en css) + `dist/styles/` (agrégat complet) |
| dts | `pnpm build:dts` | déclarations de types produites directement par `tsc` en miroir |

`pnpm build` est la chaîne complète et inclut déjà `build:styles` et `build:dts`. **Attention** : `sync:exports` **réécrit le champ `exports` du `package.json`** — après avoir modifié l'arborescence des répertoires sources, il faut lancer une fois la construction complète, sans quoi les bibliothèques en aval obtiennent une erreur MODULE_NOT_FOUND après `pnpm up`.

## Tests et qualité

| Tâche | Commande | Rôle |
| --- | --- | --- |
| Tests unitaires | `pnpm test` | vitest, `tests/unit/` (**unique exemplaire des tests de core**, résultat partagé par les trois bibliothèques) |
| Lint | `pnpm lint` | eslint, ne scanne que `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| Types | `pnpm typecheck` | tsc, `include` limité à `src/**/*` |

## Vérifications

| Tâche | Commande | Rôle |
| --- | --- | --- |
| Vérification dts | `pnpm verify:dts` | vérifie la cohérence entre les dts du produit et les types du code source |
| Vérification scss | `pnpm verify:styles` | six contrôles (voir ci-dessous) |
| Contraste des thèmes | `pnpm verify:theme` | garde AA 4.5:1, lit le produit `es/` (**nécessite au préalable `pnpm build`**) |
| Cohérence des versions | `pnpm verify:versions` | les plages de dépendances des bibliothèques UI couvrent la version actuelle de share |

### Les six contrôles de verify:styles

1. **Palette EP** — conformité des nuances de couleur et de la sémantique des valeurs
2. **var fallback** — dans les composants, `var(--lh-*)` doit obligatoirement comporter une valeur de repli
3. **@use des jetons** — les scss des composants doivent importer les jetons via `@use`, sans référencer de littérales hexadécimales
4. **Cohérence de l'agrégat** — `styles/index.scss` coïncide avec le résultat du scan des répertoires de composants (pour ne pas oublier d'agrégation)
5. **Source unique des noms de classes de transition** — interdiction d'écrire à la main `-enter-from` / `-leave-from` ; passer obligatoirement par un [mixin de transition](/fr/reference/transition-mixins)
6. **Accessibilité du sombre** — tout jeton figé en clair possède une surcharge dans `var-dark.scss` (voir [Mode sombre](/fr/theme/dark-mode))

## Publication

| Tâche | Commande | Rôle |
| --- | --- | --- |
| Rédiger les changements | `pnpm changeset` | génère interactivement un `.changeset/*.md` |
| Consommer les changesets | `pnpm changeset:version` | modifie le numéro de version, écrit le CHANGELOG, supprime les changesets en attente de publication |
| Publier | `pnpm release` | `changeset publish` : lance d'abord `prepublishOnly` (build + verify:dts + verify:styles), publie sur npm, puis crée le tag en local |
| Pousser et archiver | `pnpm release:push` | pousse master + le tag courant vers GitHub, déclenche l'archivage automatique |

Le déroulé complet de la publication est décrit dans [Processus de publication](/fr/development/release).

## Le site de documentation

| Tâche | Commande | Rôle |
| --- | --- | --- |
| Génération des données | `pnpm docs:data` | `scripts/gen-docs-data.mjs` analyse les jetons / icônes / noms de classes → `docs/src/data/*.json` |
| Développement local | `pnpm docs:dev` | serveur de dev Astro (`http://localhost:5180/lhui/share/`) |
| Construction | `pnpm docs:build` | construction de production vers `docs/dist/` |
| Aperçu | `pnpm docs:preview` | prévisualisation du produit de la construction |

**Note** : `pnpm docs:data` est idempotent et comporte des assertions sur les quantités (clair 185 / sombre 118 / SCSS 183 / icônes 37 / noms de classes 58 entrées) ; si les nombres analysés ne correspondent pas, la commande échoue directement.

## Flux de travail types

### Modifier un composant de core

```bash
pnpm test                                    # lance les tests unitaires (écrire les tests d'abord)
pnpm lint && pnpm typecheck                  # qualité
pnpm build                                   # construction complète (inclut sync:exports)
pnpm verify:dts && pnpm verify:styles        # vérifications du produit et des styles
pnpm changeset                               # rédiger les changements
git add -A && git commit                     # commettre (fusion dans master ensuite)
```

### Modifier des styles

```bash
# Ne modifier que styles/, pas besoin de la partie js de build
pnpm verify:styles                           # les six contrôles
pnpm build:styles                            # génère les produits dans dist
pnpm docs:data                               # rafraîchir les données des tables de jetons (uniquement si les jetons ont changé)
```

### Ajouter un nouveau composant

```bash
# 1. Le triplet
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. Ajouter l'export dans src/core/index.ts
# 3. Vérifier
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports génère la nouvelle clé exports
pnpm verify:dts && pnpm verify:styles
# 4. changeset (minor : nouveau composant)
pnpm changeset
```

**Point clé** : tant que `sync:exports` n'a pas tourné, il n'y a pas de clé exports correspondante côté npm — avant toute publication, effectuer impérativement un `pnpm build` complet. Après l'ajout d'un `styles/<name>/index.scss`, les scripts de construction des deux autres extrémités le couvrent automatiquement (chacun scanne son propre répertoire de composants), mais share **doit** posséder le scss correspondant, sans quoi ce composant n'aura pas de produit de style à une extrémité (silencieusement ignoré).

## Ce que le CI exécute

`.github/workflows/ci.yml` s'exécute à chaque PR / push sur master : install → lint → typecheck → test → build → verify:dts → verify:styles (+ `docs:build` à partir du lot E).

**Ce qu'il n'exécute pas** : `verify:theme` (garde de contraste, veillée manuellement en local) et `verify:versions` (cohérence des versions, traitée en aval après la publication).

## Dépendances et chaîne d'outils

- Gestionnaire de paquets : `pnpm` (le lockfile doit être commis)
- Construction : `vite` + `rollup` (preserveModules)
- Types : `tsc` (`tsconfig.build.json` produit les dts en miroir direct)
- Tests : `vitest`
- Styles : `sass` (`api: 'modern'`)
- changeset : `@changesets/cli`
- Site de documentation : `astro` + `@astrojs/starlight`

## Documentation connexe

- [Système de vérification](/fr/development/verification) — ce que vérifient au juste les différents contrôles
- [Scripts de construction](/fr/development/scripts) — `build-styles.mjs` / `gen-docs-data.mjs` et autres
- [Processus de publication](/fr/development/release) — la publication en six étapes
- [Guide de contribution](/fr/development/contribution) — les lignes rouges et la check-list avant de soumettre une PR
