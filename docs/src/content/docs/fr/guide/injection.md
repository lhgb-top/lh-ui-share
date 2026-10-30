---
title: Stratégies d'injection des styles par plateforme
description: share ne fournit que le contenu des styles, le mode d'injection est choisi par chaque bibliothèque UI — les raisons de conception derrière des stratégies différentes entre les deux plateformes
---

# Stratégies d'injection des styles par plateforme

**share ne fournit que le contenu des styles** (source SCSS + jetons) ; **le mode d'injection est choisi par chaque bibliothèque UI**.
Les deux plateformes ont des stratégies différentes : c'est une décision de conception, pas un défaut. Aucune des deux n'a le droit, pour cette raison, de conserver localement une copie des scss des composants (ligne rouge 2).

## Comparaison des deux plateformes

| | lh-ui-plus (Vue3) | lh-ui-vue2 |
| --- | --- | --- |
| Injection à l'entrée de la bibliothèque | Side-effect complet : `src/index.ts` importe composant par composant `@lh-ui/share/styles/<name>` ; importer la bibliothèque donne tous les styles | Pas d'injection ; l'utilisateur importe à la demande `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>` |
| Artefacts de styles | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss` (la source scss est diffusée avec l'artefact, les `@use` réécrits en bare specifier) | `es\|lib/components/<name>/style/index.css` (css uniquement) |
| Artefacts de thème | `theme/index.css` + `dist/index.css` (thème + tout) | `dist/theme/index.css` (clair) + `dist/theme/index-dark.css` (sombre) |
| Sous-chemins à la demande | `./style/*` → `es/*/style/index.scss` ; `./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css` ; `./theme.css`, `./theme-dark.css` |
| Script de build | `lh-ui-plus/scripts/build-styles.mjs` (liste des composants scannée dans `packages/components`) | `lh-ui-vue2/scripts/build-styles.mjs` (scan dans `src/components` ; les composants sans source de styles dans share sont automatiquement ignorés) |

## Pourquoi les deux plateformes diffèrent

- **La plateforme Vue3** vise la majorité « bibliothèque clé en main » : l'écosystème vite est favorable à l'injection de styles en side-effect, et l'injection complète évite à l'utilisateur de configurer l'à-la-demande ; le tree-shaking est de toute façon inefficace sur les styles, le tout-est-injecté est donc plus simple.
- **La plateforme Vue2** vise les vieux projets et les contextes sensibles à la taille : à l'ère webpack 4, l'injection en side-effect est facile à mal configurer ; l'import à la demande (deux imports) est plus maîtrisable et permet aussi de n'importer que le clair ou que le sombre.

## La couverture lors de l'ajout d'un composant

Lors de l'ajout d'un composant, **les scripts de build des deux plateformes le couvrent automatiquement** (chacun scanne son propre répertoire de composants), mais `styles/`
de share doit contenir le `<name>/index.scss` correspondant — sans quoi ce composant n'aura pas d'artefact de styles sur une plateforme (**ignoré silencieusement**, sans erreur). C'est la contrainte directe qu'impose la ligne rouge « source unique des styles » : d'abord créer les styles dans share, puis créer le composant sur chaque plateforme.

## Classes de transition entre plateformes : fédérées par trois mixins

Les noms de classes de transition de Vue2 sont `-enter` / `-leave`, ceux de Vue3 / React sont `-enter-from` / `-leave-from`
(`-leave-to` est identique des deux côtés). Écrire les deux à la main dérive immanquablement : on passe donc toujours par `@include` :

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from (Vue3)
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to (identique des deux côtés)
}
```

Quand l'état doit être porté par un **nœud descendant**, on passe un deuxième paramètre :

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

Il est **interdit aux styles des composants de réécrire à la main les classes de transition en double**.

## La contrainte d'injection des artefacts de personnalisation de thème

`buildPresetStyleText(vars)` produit le texte `<style>` injectable (bloc `:root` + bloc sombre).
Lors de l'adoption par la couche UI, **on ne peut écrire qu'un élément `<style>`, pas un style inline sur `documentElement`** :

> La spécificité d'un style inline est supérieure à tout le bloc de variables sombres de `var-dark.scss`, ce qui fausserait la palette du mode sombre.

Voir [Personnalisation à l'exécution](/fr/theme/customization).
