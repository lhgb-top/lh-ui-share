---
title: Processus de publication
description: 'Publication en six étapes : changeset → fusion dans master → changeset:version → commit → release → release:push, et archivage automatique par CI'
---

La publication de share est **une chaîne en six étapes veillée manuellement** : la publication npm s'effectue en local (l'étape de vérification est lancée à la main), tandis que les tags et les releases GitHub / Gitee sont archivés automatiquement par le CI.

## Les six étapes

### 1. Rédiger un changeset

```bash
pnpm changeset
```

Choix interactif de la portée de la modification (major / minor / patch) et rédaction d'une description des changements, ce qui génère `.changeset/<nom-aléatoire>.md`. **On les accumule avant la fusion dans master**, un changeset par sujet.

Conventions de niveau :

| Niveau | Quand l'utiliser |
| --- | --- |
| `major` | modification avec rupture (renommage, suppression d'API, changement de comportement). À marquer sérieusement même en phase 0.x — les utilisateurs en aval décident en fonction de cela s'ils doivent adapter leur code |
| `minor` | ajout de fonctionnalités (nouveau composant, nouvelle présélection, nouvel export) |
| `patch` | correction de bug, ajustement de style |

### 2. Commetre et fusionner dans master

```bash
git add -A
git commit -m "feat: ..."      # le message de commit est rédigé en markdown détaillé
# puis PR / fusion directe dans master
```

### 3. Consommer les changesets

```bash
pnpm changeset:version
```

Trois choses : fusionner tous les changesets en attente de publication en une note de version → modifier le numéro de version du `package.json` → écrire le CHANGELOG.md, et **supprimer les fichiers changesets consommés**.

Le numéro de version est déterminé par le niveau le plus élevé parmi tous les changesets en attente de publication (par exemple, sur 9 changesets, si le plus élevé est minor → `0.3.0` → `0.4.0`).

### 4. Commettre le numéro de version

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**Pourquoi un commit manuel** : `.changeset/config.json` a `commit: false`, changeset ne fait pas de git commit automatique. Le message de commit de cette étape s'écrit conventionnellement `chore(release): x.y.z` + un développement en markdown sur le contenu de cette publication.

### 5. Publier sur npm et créer le tag en local

```bash
pnpm release
```

C'est-à-dire `changeset publish`, dans l'ordre :

1. Lance `prepublishOnly` : `pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. Publie sur npm (`npm publish`)
3. **Crée en local** le tag `@lh-ui/share@x.y.z` (création uniquement, sans pousser)

**Condition préalable** : `npm login` doit avoir été effectué. C'est une opération d'identification, l'AI ne s'en charge pas à votre place.

**Notez que prepublishOnly ne lance que trois vérifications** — test / lint / typecheck / verify:theme doivent être lancées explicitement et manuellement avant la publication (voir la [liste complète des vérifications](/fr/development/verification#passer-toute-la-vérification)).

### 6. Pousser et archiver

```bash
pnpm release:push
```

Pousse master + le tag courant vers `github-lhgb`, ce qui déclenche automatiquement `.github/workflows/release.yml`.

## L'archivage automatique du CI (release.yml)

```
Le tarball déjà publié sur npm
  → crée une GitHub Release (joint : lh-ui-share-<version>.tgz, installable hors ligne via npm i ./xxx.tgz)
  → pousse le tag vers Gitee
  → appelle l'API Gitee pour créer une release (le corps contient le lien de téléchargement du tgz GitHub)
```

**Choix de conception essentiel** : release.yml **ne reconstruit pas** ; il installe le paquet et prend directement le tarball déjà publié sur npm — identique octet par octet à ce qu'un utilisateur obtient avec `npm i`. La construction et les doubles verify sont exécutés une fois chacun par le `pnpm release` local (prepublishOnly) et par `ci.yml`.

Ainsi, reconstruire une version historique ancienne n'échoue pas non plus à cause d'un commit d'époque dépourvu de `pnpm-lock.yaml` ou des scripts — **il suffit de pousser le tag manquant sur GitHub**, et le même flux l'archive automatiquement.

## Le suivi en aval (ligne rouge 5)

**Contrainte stricte d'ordre de publication : share d'abord, les bibliothèques UI ensuite.**

Après la publication de share 0.4.0 :

```bash
# Dépôt lh-ui-plus
pnpm up @lh-ui/share@0.4.0
pnpm test          # regression

# Dépôt lh-ui-vue2
pnpm up @lh-ui/share@0.4.0
pnpm test          # regression
```

Ce n'est qu'alors que `pnpm verify:versions` repassera (avant la publication, les plages de dépendances des deux dépôts frères sont toujours en `^0.3.0`, ce qui est attendu).

## Points d'attention

- **En local, on ne pousse que vers GitHub (`github-lhgb`)**, **ne pas pousser manuellement de tag vers Gitee** — les tags / releases de Gitee sont gérés exclusivement par release.yml ; une double écriture entrerait en conflit.
- **`npm login` est une étape manuelle** : si `npm whoami` renvoie 401, c'est que vous n'êtes pas connecté ; connectez-vous avant `pnpm release`.
- **Reconstruire des versions historiques** : `git push github-lhgb @lh-ui/share@0.2.0` suffit ; release.yml est idempotent (si la Release existe déjà, il ne fait que compléter le tarball). En cas d'échec de la création de la release, on peut relancer le workflow depuis la page Actions en passant le tag via `workflow_dispatch`.
- **La release Gitee dépend du secret `GITEE_TOKEN`** (jeton d'accès personnel Gitee, avec la permission releases cochée), configuré dans Settings → Secrets du dépôt GitHub.
- **Ne pas modifier le code source en plein milieu d'une publication** : le prepublishOnly de `pnpm release` va relancer un build ; à ce moment-là, l'espace de travail doit être propre.
- **Un héritage historique de la 0.3.0** : le numéro de version avait alors été inclus dans un commit de fix (`791ff32`), sans commit `chore(release)` distinct. À partir de maintenant on rétablit la convention, sans réécrire l'historique.

## Déploiement (l'autre dépôt)

Le site de documentation est déployé sur le nginx de la famille ; le contrat se trouve dans `lh-ui/docs/部署/nginx-lhui.conf.md` (**un autre dépôt**) : ajouter une `location ^~ /lhui/share/` et porter la liste des huit sites à neuf. Côté dépôt share, la seule responsabilité est que le produit de `pnpm docs:build` soit utilisable.

## Documentation connexe

- [Liste des commandes](/fr/development/commands)
- [Système de vérification](/fr/development/verification)
- [Scripts de construction et d'outillage](/fr/development/scripts)
- [Guide de contribution](/fr/development/contribution)
- [Comment chaque extrémité consomme](/fr/guide/consumption) —— comment les utilisateurs en aval suivent les nouvelles versions
