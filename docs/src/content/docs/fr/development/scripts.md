---
title: Scripts de build et d'outils
description: 'Responsabilités des 13 scripts mjs de scripts/ : build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/` est la couche moteur du build et de la vérification. La plupart des commandes du `package.json` sont de fines encapsulations de ces scripts, qu'on peut aussi lancer directement avec des arguments pour déboguer.

## Vue d'ensemble des scripts

| Script | Commande | Rôle |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | Compile le scss de share vers `dist/theme/` + `dist/styles/` |
| `sync-exports.mjs` | `pnpm sync:exports` (inclus dans `pnpm build`) | Génère les exports du `package.json` d'après la structure des répertoires sources |
| `verify-dts.mjs` | `pnpm verify:dts` | Cohérence des dts des artefacts avec les types du code source |
| `verify-styles.mjs` | `pnpm verify:styles` | Six vérifications scss (voir [Système de vérification](/fr/development/verification)) |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | Gate de contraste AA 4.5:1 des thèmes |
| `check-version-sync.mjs` | `pnpm verify:versions` | Les plages de dépendance des bibliothèques UI couvrent la version actuelle de share |
| `gen-docs-data.mjs` | `pnpm docs:data` | Analyse les jetons / icônes / classes → `docs/src/data/*.json` |
| `push-release.mjs` | `pnpm release:push` | Pousse master + le tag vers GitHub, déclenche l'archivage |
| `release-notes.mjs` | — | Génère les notes de version |
| `extract-from-plus.mjs` | `pnpm extract` | **Script à usage unique** : extrait la couche partagée du dépôt plus (historique) |
| `normalize-styles.mjs` | — | Normalisation des styles (usage unique historique) |
| `patch-var-fallbacks.mjs` | — | Complète en lot les valeurs de repli des `var()` (usage unique historique) |

## sync-exports.mjs —— le générateur des clés exports

**C'est le script qui pose le plus de problèmes**.

Le `package.json` de `@lh-ui/share` compte 77 clés exports (des sous-chemins comme `./core/button/*`), toutes **générées par ce script** en scannant la structure des répertoires `src/` et `styles/`.

**Déroulement** : les artefacts de `vite build` sont écrits → `sync:exports` scanne la structure du répertoire `es/` → réécrit les champs `exports` / `files` du `package.json`.

**Pourquoi c'est important** :

- Ajouter un `src/core/foo/bar.ts` est immédiatement disponible en dev (via l'alias sur les sources), mais **côté npm il n'y a pas de clé exports correspondante** — après un `pnpm up`, l'aval obtient un MODULE_NOT_FOUND.
- **Avant toute release, il faut lancer le `pnpm build` complet** (qui inclut sync:exports), pas seulement `build:dts`.

**Notez qu'il modifie le `package.json`** : après exécution, le `git diff` montre des changements dans exports — c'est normal, et il faut les committer.

## build-styles.mjs —— les artefacts de styles

Compile les sources SCSS de `styles/` en css :

```
dist/
├── theme/
│   ├── index.css          # Jetons de thème (clair)
│   └── index-dark.css     # Surcharge sombre
└── styles/
    └── index.css          # Agrégat complet (jetons + tous les composants)
```

**Il génère aussi le fichier d'agrégat `styles/index.scss`** (scan de `styles/*/index.scss`), dont la cohérence est vérifiée par la 4e vérification de `verify:styles` — **ne pas modifier ce fichier à la main**.

Chaque bibliothèque UI a son propre `build-styles.mjs` (celui de plus scanne `packages/components`, celui de vue2 scanne `src/components`) ; les composants sans source de styles dans share sont **silencieusement ignorés** — share doit donc fournir le scss correspondant, faute de quoi ce composant n'aura pas de styles sur une plateforme.

## gen-docs-data.mjs —— la génération des données de la documentation

```bash
pnpm docs:data
```

Analyse quatre sources → `docs/src/data/*.json` :

| Sortie | Source | Contenu |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 185 clairs + 118 sombres + 183 variables SCSS, regroupées par domaine sémantique |
| `icons.json` | `src/.../icon/svgs.ts` | 37 icônes intégrées |
| `classes.json` | `styles/*/index.scss` | La liste des classes BEM des 58 composants |

**Avec assertions de quantité** : en cas d'écart entre les nombres analysés et attendus (185 / 118 / 183 / 37 / 58), le script lève une erreur. C'est la première ligne de défense contre les « jeton supprimé par erreur / composant supprimé par erreur ».

**Idempotent** : on peut le lancer à volonté ; il ne modifie les json que quand le contenu change. Après avoir modifié un jeton ou un nom de classe, le lancer une fois pour rafraîchir les données de la documentation.

## push-release.mjs —— la poussée de release

```bash
pnpm release:push
```

À lancer après `pnpm release` (publication npm + création du tag local) :

1. Pousse master vers `github-lhgb`
2. Pousse le tag de cette version vers `github-lhgb`
3. Déclenche `.github/workflows/release.yml` : récupère le tarball déjà publié sur npm → crée la GitHub Release (avec `lh-ui-share-<version>.tgz`) → pousse le tag vers Gitee et appelle l'API Gitee pour créer la release

**On ne pousse que GitHub, ne jamais pousser manuellement de tag vers Gitee** — les tags / releases Gitee sont gérés exclusivement par release.yml ; un double écrit crée des conflits.

## verify-theme-contrast.mjs —— la gate de contraste

Lit les artefacts `es/` (il faut donc **lancer `pnpm build` avant**), puis utilise `getRelativeLuminance` / `getContrastRatio` exportés par `src/theme/themes/index.ts` pour calculer le contraste WCAG de chaque couple « texte / fond » : en dessous de 4.5:1, c'est un échec.

Pour déboguer une seule combinaison de couleurs, on peut appeler directement ces deux fonctions dans node, sans lancer la gate complète.

## Les scripts historiques à usage unique

| Script | Description |
| --- | --- |
| `extract-from-plus.mjs` | À la création du dépôt share, a extrait la couche partagée de lh-ui-plus. **Conservé pour mémoire, plus jamais exécuté** — share est désormais la source unique (ligne rouge 2). |
| `normalize-styles.mjs` | Normalisation précoce des styles (unification de la façon de référencer les jetons). Mission accomplie. |
| `patch-var-fallbacks.mjs` | Complétait en lot les valeurs de repli des `var(--lh-*)`. C'était l'outil de migration qui a précédé la mise en place de la vérification 2 de verify:styles (var fallback) — **le nouveau code doit écrire ses fallback à la main, ne pas compter sur ce script pour rattraper**. |

## Le site de documentation n'est pas un artefact npm

Le `files: ["es", "lib", "dist", "styles"]` du `package.json` **n'inclut pas `docs/`**. Le site de documentation est construit par `pnpm docs:build` dans `docs/dist/`, puis déployé manuellement sur le nginx de la famille (le contrat est dans `lh-ui/docs/部署/nginx-lhui.conf.md`, un autre dépôt). Voir [Processus de release](/fr/development/release).

## Documentation connexe

- [Liste des commandes](/fr/development/commands) — la commande pnpm de chaque script
- [Système de vérification](/fr/development/verification) — la logique de contrôle de chaque script verify
- [Processus de release](/fr/development/release) — push-release et l'archivage par CI
- [Entrées du package et sous-chemins](/fr/guide/exports) — les 77 clés générées par sync-exports
