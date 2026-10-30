---
title: Motifs style chinois
description: "Les six motifs SVG en ligne 柳叶 / 云纹 / 水波 / 雪花 / 梅花 / 竹叶 et le mixin apply-pattern"
---

Le style chinois n'est pas une décoration accessoire de lh-ui, c'est l'un de ses partis pris de conception. `styles/theme/common/patterns.scss` fournit six motifs traditionnels, injectés en tant que couche de fond optionnelle.

## Les six motifs

| Motif | La variable CSS | Description |
| --- | --- | --- |
| 柳叶纹 (feuilles de saule) | `--lh-pattern-willow` | De longues et fines feuilles de saule, d'une densité maîtrisée, dansant légèrement au vent |
| 云纹 (nuages auspicients) | `--lh-pattern-cloud` | Les 祥云 (nuages auspicients) se déploient en volutes sinueuses |
| 水波纹 (ondulations) | `--lh-pattern-water` | De légères rides s'éveillent et se superposent en couches |
| 雪花纹 (flocons de neige) | `--lh-pattern-snow` | Des flocons hexagonaux aux fines branches ramifiées |
| 梅花纹 (fleurs de prunier) | `--lh-pattern-plum` | Cinq pétales déployés, les étamines du cœur bien marquées |
| 竹叶纹 (feuilles de bambou) | `--lh-pattern-bamboo` | Des feuilles de bambou lancéolées à la nervure centrale nette, réparties avec grâce |

Tous sont **en ligne** sous forme de `data:image/svg+xml` (aucune ressource externe n'est chargée, pas de dépendance réseau, pas de problème de CORS) ; ils sont marqués `!default` et donc surchargeables par l'utilisateur. S'y ajoute `--lh-pattern-none: none` (l'absence explicite de motif).

## Activer les motifs

Les motifs ne sont **pas activés par défaut** (`--lh-bg-pattern: none`). Trois façons de les activer :

### 1. L'écrire directement dans un composant / une page

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. Le themeVars du ConfigProvider

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

L'abréviation `'bg-pattern'` est automatiquement complétée en `--lh-bg-pattern`.

### 3. La prop pattern + la liste blanche

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

Les motifs affectent le fond, ce qui ne convient pas à tous les composants (imprimer des fleurs de prunier sur le fond d'un tableau serait désordonné). La liste blanche `patternComponents` contrôle les composants qui reçoivent les motifs. Voir [Personnalisation à l'exécution](/fr/theme/customization#3-patterncomponents--la-liste-blanche-des-motifs).

## Les jetons de contrôle

```scss
:root {
  --lh-bg-pattern: none;                                     // Désactivé par défaut
  --lh-bg-pattern-repeat: repeat;                            // Le mode de pavage
  --lh-bg-pattern-size: 40px;                                // La taille du motif (les 40px par défaut épousent la hauteur d'un bouton pour éviter que le dessin ne soit coupé)
  --lh-bg-pattern-opacity: 0.15;                             // L'opacité
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // La couleur
  --lh-bg-pattern-blend: soft-light;                         // Le mode de fusion
}
```

Tous sont surchargeables (`!default`). Les deux boutons de réglage les plus utilisés :

- **`--lh-bg-pattern-size`** : 40px est la taille qui « permet de loger un motif complet dans la hauteur d'un bouton » ; pour les fonds de grands blocs, on peut monter à 80px et au-delà afin que le motif respire.
- **`--lh-bg-pattern-opacity`** : 0.15 est la valeur par défaut « présent, mais discret » ; si l'atmosphère style chinois doit être plus affirmée, on peut monter jusqu'à 0.25.

## Le mixin apply-pattern

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // avec fallback
  @content;
}
```

Dans un composant, un simple `@include` donne accès au fond à motif :

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**Pourquoi les trois premiers n'écrivent pas de fallback** : les motifs sont désactivés par défaut et ces trois jetons sont passés par l'utilisateur / le ConfigProvider ; en l'absence de valeur, il n'y a simplement pas de motif (la retombée vers `background-image: none` est assurée par la valeur par défaut du jeton lui-même) ; figer un fallback rendrait indiscernables « motif non configuré » et « motif explicitement coupé ».

## Les motifs et le mode sombre

La couleur `--lh-bg-pattern-color` des motifs référence par défaut `--lh-decoration-color` (la couleur d'ornement), laquelle possède une surcharge sombre dans `var-dark.scss` — la couleur des motifs suit donc automatiquement le mode sombre.

Si vous personnalisez la couleur des motifs, n'oubliez pas d'ajuster également la variante sombre :

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## Points d'attention

- **La désactivation par défaut est délibérée** : un motif est une ambiance, pas une information ; l'activer par défaut polluerait l'interface de tous les utilisateurs. Le côté métier qui souhaite un motif global l'active lui-même dans le ConfigProvider.
- **La taille du SVG en ligne** : les six motifs sont des tracés épurés, quelques centaines d'octets chacun ; leur mise en ligne dans le CSS ne génère aucune requête supplémentaire.
- **La surcharge `!default`** : pour substituer vos propres motifs, surchargez dans le projet `--lh-pattern-plum: url('data:image/svg+xml,...')`, ou réglez directement `--lh-bg-pattern`.
- **Le cas de l'impression** : les motifs peuvent ne pas s'imprimer (selon le traitement de `background-image` par les navigateurs lors de l'impression) ; la couche de contenu ne doit pas dépendre des motifs pour transmettre de l'information.

## Documentation connexe

- [Vue d'ensemble du système de thèmes](/fr/theme/overview)
- [Personnalisation à l'exécution](/fr/theme/customization)
- [Jetons de conception](/fr/theme/tokens)
- [La source des styles](/fr/reference/styles)
