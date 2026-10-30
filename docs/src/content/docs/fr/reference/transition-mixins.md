---
title: "transition-mixins —— les classes de transition entre plateformes"
description: "Les trois mixins lh-enter-both / lh-leave-both / lh-transition-ends fédèrent les différences de classes de transition entre Vue2 et Vue3/React"
---

`styles/theme/common/transition.scss` est l'**unique source** des classes de transition entre plateformes. Elle résout une vraie douleur :

Les classes de transition de Vue2 sont `<name>-enter` / `<name>-leave` (l'**état de départ** de l'entrée / de la sortie) ; Vue3 et React les ont changées en `<name>-enter-from` / `<name>-leave-from`. Les deux côtés ont la même sémantique (« état de départ de l'entrée » / « état de départ de la sortie »), seul le nom diffère. Auparavant, 16 composants écrivaient à la main leurs double sélecteurs, fichier par fichier, et une modification d'un côté oubliait l'autre.

## Les trois mixins

| Mixin | Paramètres | Classes générées | Usage |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector` (obligatoire), `$child` (optionnel) | `#{$selector}-enter`, `#{$selector}-enter-from` | Double écriture de l'état de départ d'entrée |
| `lh-leave-both` | `$selector`, `$child`? | `#{$selector}-leave`, `#{$selector}-leave-from` | Double écriture de l'état de départ de sortie |
| `lh-transition-ends` | `$selector`, `$child`? | `#{$selector}-enter`, `#{$selector}-enter-from`, `#{$selector}-leave-to` | Les états de début et de fin de transition (double écriture du départ d'entrée + l'état final de sortie, identique des deux côtés) |

Les trois reçoivent le bloc de styles via `@content`.

### Le paramètre `$child`

Quand l'état de transition doit être porté par un **nœud descendant**, on passe un deuxième paramètre : le sélecteur généré porte le suffixe ` #{$child}` :

```scss
// Sans $child : l'état est porté par le sélecteur lui-même
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// Avec $child : l'état est porté par le panneau intérieur
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## Pourquoi exactement ces trois-là

- `-enter-to` / `-leave-to` sont **identiques des deux côtés**, pas besoin de double écriture.
- Seules les **paires d'états de départ** ont besoin de la double écriture : `-enter` / `-enter-from` et `-leave` / `-leave-from`.
- `lh-transition-ends` correspond au cas fréquent « le départ de l'entrée et la fin de la sortie se confondent » (fondu enchaîné : opacité 0 → 1 → 0) : un seul mixin couvre à la fois la double écriture du départ d'entrée et l'état final de sortie.

## Exemples d'utilisation

### La transition ordinaire (le fondu du backtop)

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

Résultat de la compilation :

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### Seulement l'état de départ d'entrée (le fondu du dialog, l'état final n'est pas nécessaire)

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### L'état porté par le panneau intérieur (le coulissement du drawer)

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

Avec `<transition name="lh-drawer-fade">` de Vue3, la classe `lh-drawer-fade-enter-from` est ajoutée à l'**élément racine** durant la phase enter ; le sélecteur descendant atteint le panneau, qui se déplace — l'élément racine ne bouge pas lui-même, ce qui évite que le transform du nœud racine téléporté n'affecte le positionnement.

## Comment l'utiliser dans un composant

```scss
// styles/drawer/index.scss
@use 'theme/common/transition' as *;

.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
  @include lh-leave-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

La couche UI (Vue3) :

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

La couche UI (Vue2) :

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**Les deux côtés utilisent le même `name`** ; les doubles sélecteurs générés par les mixins du côté des styles atteignent chacun les noms de classes de sa propre plateforme. C'est l'incarnation, pour les classes de transition, du principe « l'injection est dispersée, le contenu a une source unique ».

## Points d'attention

- **Les styles des composants n'ont plus le droit de réécrire à la main les classes de transition en double** : toujours `@include` ([ligne rouge 2](/fr/development/contribution#les-six-lignes-rouges)). La vérification 5 de `verify:styles` (la source unique des classes de transition) scanne les littéraux `-enter-from` / `-leave-from` écrits en clair.
- **Le chemin `@use`** : `@use 'theme/common/transition' as *;` (le chemin relatif de chaque scss de composant, ou le bare specifier à la compilation, est décidé par la [stratégie d'injection](/fr/guide/injection)).
- **Le cas React** : la version React utilise une transition headless (les classNames pilotés par l'état) ; les classes `-enter-from` générées par les mixins s'appliquent de la même façon.
- **Le suffixe `$child` est un sélecteur descendant** : ce n'est pas une concaténation avec `&` ; le sélecteur généré est `.parent-enter .child` et il dépend de la classe de transition portée par l'élément racine.

## Documentation connexe

- [Stratégies d'injection](/fr/guide/injection) — les différences d'artefacts de styles entre les deux plateformes
- [Mode sombre](/fr/theme/dark-mode) — les jetons à l'exécution vs à la compilation
- [La source des styles](/fr/reference/styles) — le répertoire `styles/` et les conventions BEM
