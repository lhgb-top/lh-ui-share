---
title: Conventions de nommage
description: "La racine de domaine inverse top.lhgb, les quatre paliers de préfixes LH / Lh / lh / lh- et le registre des trois exemptions"
---

# Conventions de nommage

Les conventions de nommage sont uniformisées pour toute la famille, en alignement avec `docs/project/development-guide.md` du dépôt plus.

## La racine de domaine inverse

**`top.lhgb`** (écriture inverse de `www.lhgb.top`) est la racine de nommage de tous les dépôts de la famille lh-ui.

- **Côté JS / npm** : le nom du package conserve le scope `@lh-ui/*` — les noms de paquets npm n'acceptent pas les points, `top.lhgb` ne peut pas
  être utilisé directement comme nom de paquet. Le domaine inverse tombe dans la **couche métadonnées** : `homepage` / `repository` /
  `author` du `package.json` utilisent uniformément `lhgb.top`.
- **Côté natif** : ce sont les applicationId / bundleId / package de `lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` / `lh-ui-c`
  qui prennent la forme `top.lhgb.*` (hors de ce dépôt).

## Les quatre paliers du préfixe LH

**Tout symbole non tiers doit porter le préfixe `LH`** ; à créer pour toute nouvelle constante / tout nouveau type / interface, sans attendre un renommage uniforme a posteriori :

| Palier | Forme | Exemples |
| --- | --- | --- |
| Constante | `LH_XXX` (majuscules et tiret bas) | `LH_SIZE_DEFAULT`, `LH_LANGUAGE_DEFAULT`, `LH_THEME_PRESETS` |
| Type / interface | `LhXxx` (camel case avec majuscule) | `LhThemePreset`, `LhSxProps`, `LhVirtualRange` |
| Singleton de module / objet minuscule | `lhXxx` (camel case) | `lhlocale` |
| Classes BEM / name de composant | `lh-xxx` / `LhXxx` | `.lh-button--primary`, `name: 'LhButton'` |

La structure de nommage des constantes est **`LH_<module>_<concept>`**, avec `DEFAULT` en suffixe pour les constantes de valeur par défaut :

- `LH_DRAWER_DIRECTION_DEFAULT` (et non `LH_DEFAULT_DRAWER_DIRECTION`)
- `LH_DROPDOWN_PLACEMENT_DEFAULT`, `LH_POPCONFIRM_TYPE_DEFAULT`

En cohérence avec les `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT` existants.

## Registre des exemptions

Noms consacrés par l'usage, sans préfixe obligatoire. **Avant de modifier, enregistrez d'abord la raison ici** :

| Symbole | Raison |
| --- | --- |
| Exports des paquets de langues `zhCN` / `enUS` | Nommage locale standard, et réexporté comme API publique par `@lh-ui/vue3` / `@lh-ui/vue2` / uniapp ; un renommage aurait une portée de cassure trop grande |
| La **valeur chaîne** des noms de préréglages de thème (`name: 'cerblue'`, etc.) | C'est la valeur de configuration que l'utilisateur écrit dans le `theme` du ConfigProvider ; la changer casserait toutes les configurations utilisateurs aval ; l'**identifiant TS** correspondant porte toujours le préfixe (`LhCerblue`) |
| Les symboles exportés par des dépendances tierces (par exemple les utilitaires importés en dehors de `deepMerge`) | Pas d'obligation |

## Le renommage de 0.4.0

Avant 0.4.0, ce dépôt n'avait pas suivi la norme de préfixe de la famille ; cette version rattrape son propre retard. Tout est un remplacement mécanique au niveau des identifiants,
la table de correspondance est dans [le guide de migration 0.4.0](/fr/guide/migration-04).
