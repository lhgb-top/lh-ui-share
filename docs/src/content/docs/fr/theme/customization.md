---
title: Personnalisation à l'exécution
description: "Le préfixe automatique des abréviations themeVars, la surcharge par composant componentTheme, et la liste blanche des motifs patternComponents"
---

La personnalisation à l'exécution est la capacité clé du système de thèmes de lh-ui : **sans recompiler les styles**, modifier l'apparence des composants à l'exécution. Trois API, chacune responsable d'une couche.

## 1. themeVars —— la surcharge globale des jetons

Le ConfigProvider reçoit `themeVars`, dont les clés sont **abrégées** :

```vue
<lh-config-provider
  :theme-vars="{
    'primary-color': '#1677ff',
    'border-radius-base': '8px',
  }"
>
  <App />
</lh-config-provider>
```

### Le préfixe automatique des abréviations

`'primary-color'` est automatiquement complété en `--lh-primary-color`. Ce complément est assuré par [toCssVarName](/fr/reference/utils#le-trio-cssvars) et il est **idempotent** (les clés déjà préfixées sont renvoyées telles quelles, jamais transformées en `--lh---lh-...`).

On peut aussi écrire directement le nom complet :

```ts
{ '--lh-primary-color': '#1677ff' }   // équivalent
```

L'implémentation sous-jacente est `cssVars(themeVars)`, qui transforme les paires clé-valeur en un objet de variables CSS directement liable au `:style`.

### La portée est un sous-arbre DOM

Les variables CSS cascadent naturellement : le ConfigProvider les injecte dans l'élément qui l'enveloppe ; **ce sont uniquement les composants descendants qui consomment les nouvelles valeurs**. Cela permet de changer de peau localement :

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### Ce qu'exporte le site de documentation est la même chose

Le texte `:root { --lh-*: ... }` exporté par la page de personnalisation de thème de la documentation est **exactement la même chose** que `themeVars`, couchée dans un fichier — il peut être collé tel quel à l'entrée du projet :

```css
/* L'entrée du projet */
:root {
  --lh-primary-color: #2B4C7C;
  --lh-primary-color-hover: #3D649E;
  /* ... */
}
```

## 2. componentTheme —— la surcharge par composant

`themeVars` est global ; parfois on ne veut modifier les jetons que d'un seul composant (par exemple les angles arrondis de tous les boutons, mais en gardant ceux des autres composants).

```vue
<lh-config-provider
  :component-theme="{
    button: { 'border-radius': '20px' },
    input: { 'control-height-medium': '40px' },
  }"
>
  <App />
</lh-config-provider>
```

La clé est le nom du composant (le nom du répertoire sous `styles/`), et la valeur est le `themeVars` de la portée de ce composant. À l'injection, les variables sont préfixées par le composant et ne touchent donc que le composant indiqué. Les noms de clés doivent correspondre aux noms de jetons (`control-height-medium` → `--lh-control-height-medium`) — le palier par défaut de `input` est medium ; un `control-height` sans suffixe de palier n'est consommé par aucun composant.

**À noter** : un jeton au niveau du composant dépend de ce que le SCSS de ce composant ait bien consommé le jeton correspondant via `var(--lh-<name>-*)` — tous les composants n'ont pas tokenisé tous les points de styles ; la référence pour savoir ce qui est modifiable est le comportement du composant dans la table [Jetons de conception](/fr/theme/tokens).

## 3. patternComponents —— la liste blanche des motifs

Les motifs style chinois (voir [Motifs style chinois](/fr/theme/patterns)) ne sont **pas activés par défaut**. Quand ils le sont, ils affectent le fond, ce qui ne convient pas à tous les composants (imprimer des fleurs de prunier sur le fond d'un tableau serait désordonné).

`patternComponents` contrôle les composants auxquels les motifs sont appliqués :

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

Seuls les composants de la liste blanche portent des motifs. Les noms exacts des props sont à prendre dans la documentation du ConfigProvider de chaque bibliothèque UI.

## 4. Préréglage + personnalisation en cumul

Les trois peuvent se cumuler ; la priorité est « le descendant surcharge l'ancêtre, le spécifique surcharge le global » :

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- On applique d'abord le préréglage cerblue (porcelaine bleue et blanche), puis on ajuste les angles arrondis avec themeVars -->
  <App />
</lh-config-provider>
```

## 5. Le mode sombre et la personnalisation

Les `themeVars` personnalisés n'affectent le clair / le sombre que du sous-arbre sur lequel ils sont injectés :

```vue
<!-- Ce bloc force le mode sombre -->
<div data-theme="dark">
  <lh-button>Bouton sombre</lh-button>
</div>
```

- L'interrupteur du mode sombre est l'attribut `[data-theme='dark']` ou la classe `.dark` (les sélecteurs de `var-dark.scss`).
- **Ne placez pas de `themeVars` dans le style inline du `documentElement`** — la spécificité d'un style inline est supérieure à tout le bloc de variables sombres de `var-dark.scss`, ce qui fausse la palette du mode sombre (voir [la contrainte d'injection du survol du thème](/fr/theme/overview#contrainte-dinjection--uniquement-des-style-jamais-de-style-inline)).

## 6. Ce qui ne peut pas être changé à l'exécution

| Ce qu'on veut changer | Possible ? | Alternative |
| --- | --- | --- |
| Les jetons de couleur primaire, de couleur de texte, les angles arrondis, les espacements, etc. | ✅ `themeVars` | — |
| Les jetons d'un seul composant | ✅ `componentTheme` | — |
| Les motifs | ✅ `pattern` + `patternComponents` | — |
| La hauteur des composants (input 37px, etc.) | ⚠️ Limité | Les jetons de hauteur ne sont pas encore unifiés, voir [les lacunes connues](/fr/theme/tokens#les-lacunes-connues-des-jetons) |
| La structure DOM / les classes d'un composant | ❌ | Utiliser le [passthrough pt](/fr/core/pt) ou les slots |
| La composition des niveaux d'ombre | ❌ À la compilation | Surcharger les variables SCSS `$lh-*` et recompiler |
| Les courbes d'animation | ✅ `--lh-animation-timing-function` | — |

## Exemple : la configuration de thème complète

```vue
<template>
  <lh-config-provider
    theme="songhua"
    :theme-vars="{
      'border-radius-base': '8px',
      'font-size-base': '15px',
    }"
    :component-theme="{
      button: { 'border-radius': '999px' },
    }"
    :pattern-components="['card', 'dialog']"
  >
    <App />
  </lh-config-provider>
</template>
```

## Points d'attention

- **Ne pas doubler le préfixe sur les clés abrégées** : `'primary-color'` et non `'--lh-primary-color'` (bien que ce soit idempotent, l'usage uniforme de l'abrégé est plus lisible).
- **La fuite de portée** : `themeVars` n'affecte que les composants descendants ; à l'inverse, les variables d'un ConfigProvider **ancêtre** sont surchargées par celles de son **descendant** (la règle de cascade CSS).
- **Le lieu d'injection** : le ConfigProvider injecte dans l'élément qu'il enveloppe (pas le `documentElement`), ce qui garantit un retrait possible et une portée localisée.
- **SSR** : ce qui est injecté est une variable CSS ordinaire ; le rendu côté serveur produit un style inline, cohérent après hydratation côté client.

## Documentation connexe

- [Vue d'ensemble du système de thèmes](/fr/theme/overview)
- [Préréglages de thème](/fr/theme/presets)
- [Jetons de conception](/fr/theme/tokens)
- [Motifs style chinois](/fr/theme/patterns)
- [La fonction utilitaire cssVars](/fr/reference/utils#le-trio-cssvars)
