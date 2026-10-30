---
title: Système de vérification
description: 'verify:dts / verify:styles (six vérifications) / la gate AA verify:theme / verify:versions : ce que chacun vérifie et comment lire ses résultats'
---

La « vérification » chez lh-ui n'est pas une simple formalité — chaque contrôle intercepte une classe de régression **déjà rencontrée en vrai**. Cette page explique, contrôle par contrôle, ce qui est vérifié et comment lire les sorties en échec.

## verify:dts —— cohérence des types des artefacts

```bash
pnpm verify:dts
```

**Ce qui est vérifié** : les `.d.ts` compilés dans `es/` / `lib/` correspondent aux déclarations de type du code source, et chaque clé d'exports pointe vers un fichier qui existe réellement.

**Échecs typiques** :

- les types source ont changé sans relancer `pnpm build` (les artefacts sont périmés)
- `sync:exports` a généré une clé exports, mais le fichier correspondant n'a pas été produit (chemin mal assemblé)
- un `import type` écrit en `import`, ce qui ajoute du code d'exécution dans les artefacts

**Correctif** : relancer `pnpm build` en entier, puis `pnpm verify:dts`.

## verify:styles —— six vérifications

```bash
pnpm verify:styles
```

Script : `scripts/verify-styles.mjs`. Les six vérifications s'exécutent en séquence ; la première qui échoue interrompt tout.

### 1. Palette EP

Liste noire : les 9 couleurs héritées d'EP (Element Plus) (`#409eff`, `#e6a23c`, `#f56c6c`, `#67c23a`, `#909399`, `#606266`, `#303133`, `#ebeef5`, `#c0c4cc`) font échouer dès qu'elles apparaissent dans un fichier scss de `styles/`. C'est le garde-fou post-lavage D2, pour empêcher le retour de l'ancien système de couleurs — chez lh-ui, toute couleur vient d'une définition de jeton de `styles/theme/common/variables.scss`.

### 2. var fallback

Vérifie que chaque `var(--lh-*)` dans les scss des composants porte une valeur de repli :

```scss
// ✅ passe
color: var(--lh-text-primary, rgba(0, 0, 0, 0.88));

// ❌ échoue
color: var(--lh-text-primary);
```

**Pourquoi** : quand un jeton manque (utilisateur n'ayant importé qu'une partie des styles, jeton absent dans une ancienne version), un `var()` sans repli se résout en valeur invalide et la déclaration est abandonnée — le texte retombe au noir par défaut, les bordures disparaissent. Le repli garantit une « dégradation qui reste utilisable ».

### 3. Jetons @use

Vérifie que les scss des composants référencent la couche de jetons via `@use` plutôt que d'éparpiller des littéraux hex :

```scss
// ✅ passe
@use 'theme/common/var' as *;
.lh-card { background: var(--lh-bg-color, #fff); }

// ❌ échoue
.lh-card { background: #ffffff; }
```

**Exemption** : la valeur de repli d'un `var()` peut être un hex (c'est son rôle de dégradation). Les messages d'échec listent les fichiers et les numéros de ligne.

### 4. Cohérence de l'agrégat

Vérifie que `styles/index.scss` (l'agrégat complet) est cohérent avec « la liste des composants obtenue en scannant `styles/*/index.scss` ». **`styles/index.scss` est généré par `scripts/build-styles.mjs`, ne pas le modifier à la main** — ajouter un répertoire de composant sans relancer la génération crée une incohérence.

### 5. Source unique des noms de classes de transition

Vérifie que les scss des composants n'écrivent **en clair** les littéraux `-enter-from` / `-leave-from` :

```scss
// ❌ échoue : classes de transition écrites en double à la main
.lh-dialog-fade-enter-from { opacity: 0; }

// ✅ passe : via le mixin
@include lh-enter-both('.lh-dialog-fade') { opacity: 0; }
```

**Pourquoi** : Vue2 utilise `-enter`, Vue3/React utilisent `-enter-from` ; écrire les deux à la main fait immanquablement oublier un côté (voir [transition-mixins](/fr/reference/transition-mixins)). 16 composants ont chacun eu leur double écriture, une modification d'un côté oubliait l'autre.

### 6. Accessibilité du mode sombre

Vérifie que les jetons de `var.scss` dont la valeur est de la forme `#{$lh-foo}` (figée en couleur claire à la compilation) **possèdent bien une surcharge correspondante** dans `var-dark.scss`.

**C'est la vérification la plus critique**. Une telle lacune a déjà fait que, en mode sombre, les textes des menus / tableaux / timelines conservaient la valeur claire et devenaient **invisibles** (texte noir sur fond noir). Voir [Le piège de la cuisson à la compilation](/fr/theme/dark-mode#le-piège-de-la-cuisson-à-la-compilation).

**À noter** : il y a eu une correction de faux positif — un décalage d'index dans verify:styles signalait à tort des lignes exemptées du contrôle `no-fallback` (commit `791ff32`). Si un message d'échec vous paraît absurde (une ligne exemptée est encore signalée), vérifiez d'abord qu'il ne s'agit pas de ce problème connu.

## verify:theme —— la gate de contraste AA

```bash
pnpm build          # ← doit être lancé avant, le script lit les artefacts es/
pnpm verify:theme
```

Script : `scripts/verify-theme-contrast.mjs`.

**Ce qui est vérifié** : parmi les cinq thèmes intégrés (et leurs variantes sombres), tous les couples « texte / fond » ont un contraste WCAG ≥ **4.5:1** (niveau AA).

**Pourquoi les artefacts es/ sont nécessaires** : les vars des préréglages n'atteignent leur forme définitive qu'après la compilation (le résultat de la dérivation de `buildPresetDarkVars` se trouve aussi dans les artefacts).

**Échecs typiques** :

- un nouveau préréglage à primaire clair n'a pas défini `--lh-color-on-primary` (texte blanc sur primaire clair : seulement 3.x:1)
- la couleur du texte sélectionné (`--lh-selected-color`) manque de contraste sur le fond de survol

**Correctif** : assombrir / éclaircir les couleurs concernées jusqu'à atteindre le contraste requis. `getContrastRatio()` et `getRelativeLuminance()` (exportés par `src/theme/themes/index.ts`) peuvent être calculés en local, sans relancer la gate complète à chaque fois.

**La CI ne lance pas cette vérification** — elle exige un build préalable et coûte du calcul. À manualiser avant chaque release locale.

## verify:versions —— cohérence des versions

```bash
pnpm verify:versions
```

Script : `scripts/check-version-sync.mjs`.

**Ce qui est vérifié** : les plages de dépendance de `@lh-ui/share` dans les `package.json` de lh-ui-plus / lh-ui-vue2 **couvrent la version actuelle de share**.

**État actuel** : passe tant que share est en `0.3.0`. **Échouera après la publication de 0.4.0** — car les plages des deux bibliothèques UI resteront `^0.3.0`. C'est le **comportement attendu** : conformément à la [ligne rouge 5](/fr/development/contribution#les-six-lignes-rouges) (share est publié en premier, les bibliothèques UI suivent), après chaque release il faut aller dans chaque dépôt frère faire `pnpm up @lh-ui/share@0.4.0` et passer la régression.

## lint et typecheck

| Commande | Périmètre analysé |
| --- | --- | --- |
| `pnpm lint` | `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| `pnpm typecheck` | `src/**/*` (l'include de `tsconfig.json`) |

**`docs/` n'est pas dans le périmètre** — le site de documentation est un projet Astro indépendant, dont la qualité est gardée par `pnpm docs:build`. De même, `styles/` n'est pas couvert par typecheck (le SCSS est géré par verify:styles).

**La gate anti-dépendance-de-framework du lint** : la CI vérifie par grep que `src/` ne contient aucun `import 'vue'` / `import 'react'` / `@dcloudio/*` — c'est la [ligne rouge 1](/fr/development/contribution#les-six-lignes-rouges) : core doit rester indépendant des frameworks.

## Tests

```bash
pnpm test
```

`tests/unit/` est **l'unique exemplaire des tests unitaires de core** (ligne rouge 3) : le résultat est partagé par les trois bibliothèques, qui n'ont pas le droit de le copier. Tester des fonctions pures ne nécessite pas de rendu de composant — on construit des littéraux de rect, on compare les sorties aux attentes, et les quatre plateformes partagent les mêmes assertions.

Fichiers de test clés :

| Fichier | Couverture |
| --- | --- |
| `theme.spec.ts` | Cohérence des préréglages (synchro double-source des vars JS et des variables SCSS) |
| `core/*.spec.ts` | La logique de chaque composant core |
| `shared/*.spec.ts` | Les algorithmes du noyau partagé (popper / keyboard / virtual, etc.) |

## Passer toute la vérification

La check-list complète avant une release :

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build                    # attention : sync:exports modifie package.json
pnpm verify:dts
pnpm verify:styles            # les six vérifications
pnpm verify:theme             # nécessite un build préalable
pnpm verify:versions          # après la release, bascule en traitement aval
pnpm docs:build               # le site de documentation
```

`prepublishOnly` (déclenché par `pnpm release`) ne contient que build + verify:dts + verify:styles. **test / lint / typecheck / verify:theme doivent donc être lancés explicitement à la main**.

## Documentation connexe

- [Liste des commandes](/fr/development/commands)
- [Scripts de build](/fr/development/scripts)
- [Processus de release](/fr/development/release)
- [Mode sombre](/fr/theme/dark-mode)
- [La source des styles](/fr/reference/styles)
