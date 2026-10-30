---
title: Présentation du projet
description: "Ce qu'est @lh-ui/share, le problème qu'il résout et sa place dans la famille lh-ui"
---

# Présentation du projet

**`@lh-ui/share` est l'unique couche partagée indépendante des frameworks de la famille de composants lh-ui.**

Il extrait du reste des bibliothèques de composants « la moitié qui ne dépend pas d'un framework » pour en faire un dépôt à part : calculs de classes, machines à états, paquets d'attributs d'accessibilité, moteur de positionnement, défilement virtuel, jetons de thème, libellés d'internationalisation, source des styles des composants. Les bibliothèques UI de chaque plateforme (lh-ui-plus / lh-ui-vue2 / lh-ui-react / lh-ui-uniapp) consomment ce package en version publiée via une dépendance npm ; en développement en interne à la famille, modifier le code source de ce dépôt prend effet immédiatement dans chaque bibliothèque UI, sans construction ni release.

## Pourquoi cette couche est nécessaire

Une petite partie seulement de la logique d'une bibliothèque de composants dépend réellement de la réactivité du framework :

- savoir si une classe doit être ajoutée est un pur calcul `(size, disabled) => string` ;
- savoir de quel côté un panneau déroulant doit se retourner est un calcul géométrique ;
- savoir quelles lignes une liste doit rendre est un calcul d'intervalles d'indices ;
- le libellé du bouton « Confirmer » est une recherche dans un paquet de langues.

En sédimentant tout cela en fonctions pures, les quatre plateformes n'ont **pas besoin de chacune l'écrire, de chacune se tromper, de chacune corriger**. Il ne reste qu'une seule chose à la couche framework : lier la sortie des fonctions pures au template et renvoyer les entrées de l'utilisateur aux fonctions pures.

## Ce que contient le dépôt

| Couche | Contenu | Dénombrement |
| --- | --- | --- |
| `src/core/<composant>/` | Fonctions pures des composants (logic.ts / types.ts), zéro import de framework | 56 composants |
| `src/core/shared/` | Noyau partagé entre composants (popper / virtual / sx / keyboard / focus-trap …) | 12 modules |
| `src/theme/` | Côté TS du thème : types + 5 préréglages + primitives d'exécution | — |
| `styles/` | **Source unique** des styles BEM des composants + jetons `theme/common/*.scss` | 58 ensembles de styles |
| `src/locales/` | Internationalisation (LhLocale est un pur émetteur d'événements) + dix paquets de langues complets | — |
| `src/constants/` `src/types/` `src/utils/` | Constantes / types / utilitaires purs (dont createNamespace) | — |

> **Méthode de comptage** : core compte 56 répertoires de composants, styles en compte 58 — `layout` / `tree-select` ont une source de styles mais toute leur logique est dans la couche UI (conteneur de mise en page, colle côté framework du sélecteur arborescent), et `config` s'appelle `config-provider` dans le répertoire des styles. Voir [Structure du package](/fr/guide/structure).

## Principes de conception

1. **Zéro dépendance de framework** : aucun `import 'vue' | 'react' | '@dcloudio/*'` dans `src/`, gardé par une gate grep en CI. Ce package est bundlé avec `external: []`, totalement sans dépendance.
2. **Source unique des styles** : `styles/` est l'unique source des styles BEM des composants de toute la famille ; aucune bibliothèque UI n'a le droit de conserver localement une copie des scss des composants. Les différences de classes de transition entre plateformes sont fédérées par les trois mixins de `transition.scss`.
3. **Un seul exemplaire des tests unitaires** : les tests de core ne vivent que dans `tests/unit/` de ce dépôt ; les trois bibliothèques partagent ce résultat, sans le recopier.
4. **La réactivité appartient à la couche UI** : core ne produit que des données ; l'abonnement et le câblage réactif relèvent de chaque bibliothèque UI. C'est pourquoi LhLocale est un simple emitter : l'incrément de `version` permet à chaque plateforme de redéclencher son propre rendu avec son propre mécanisme.
5. **Clair et sombre à égalité** : tous les composants prennent en charge le mode clair et le mode sombre par défaut ; les composants ne peuvent consommer les jetons que via `var(--lh-*, fallback)`, et l'exhaustivité du mode sombre est gardée par la vérification 7 de `verify:styles`.

## Ce que ce n'est pas

- **Ce n'est pas une bibliothèque UI** : ce package ne rend rien, il n'y a aucun runtime de composants. Pour des composants directement utilisables, installez la bibliothèque de chaque plateforme, `@lh-ui/vue3` / `@lh-ui/vue2`, etc.
- **Il ne dépend d'aucune bibliothèque UI, d'aucun framework** : c'est la couche la plus basse, on dépend de lui, il ne dépend de personne.
- **Il ne gère pas le déploiement** : ce que produit la personnalisation de thème est du texte `<style>` et des variables CSS ; la façon de l'injecter dans le DOM est laissée au ConfigProvider de chaque plateforme.

## La disposition familiale

```
lh-ui/
├── lh-ui-share/      ← ce dépôt : couche partagée sans framework (core / theme / styles / locales)
├── lh-ui-plus/       plateforme Vue3 (injection complète des styles en side-effect)
├── lh-ui-vue2/       plateforme Vue2 (import à la demande theme.css + style/<name>)
├── lh-ui-react/      plateforme React
├── lh-ui-uniapp/     plateforme uniapp
├── docs/             site de documentation de la famille (autre dépôt)
└── native/           plateformes natives (android / ios / harmony, applicationId en top.lhgb.*)
```

L'ordre des releases est une contrainte dure : **share est publié en premier, les bibliothèques UI suivent**. Dès que share change → écrire un changeset → release → chaque bibliothèque fait `pnpm up @lh-ui/share` et passe la régression.

## Prochaines étapes

- [Démarrage](/fr/guide/getting-started) — installer le package, importer les styles, lancer la première fonction pure
- [Entrées du package et sous-chemins](/fr/guide/exports) — comment piocher à la demande parmi les 77 clés exports
- [Consommation par chaque plateforme](/fr/guide/consumption) — exemples de câblage pour Vue3 / Vue2 / React / uniapp
