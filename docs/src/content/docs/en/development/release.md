---
title: Release process
description: 'The six release steps: changeset → merge into master → changeset:version → commit → release → release:push, plus CI archival'
---

Releasing share is a **six-step pipeline guarded by hand**: npm publishing happens locally (the verification steps are run manually), while GitHub / Gitee tags and releases are archived automatically by CI.

## The six steps

### 1. Write a changeset

```bash
pnpm changeset
```

Interactively pick the change scope (major / minor / patch) and write a change description; this generates `.changeset/<random-name>.md`. **Accumulate changesets before merging into master** — one changeset per topic.

Level conventions:

| Level | When to use it |
| --- | --- |
| `major` | Breaking changes (renames, removed APIs, changed behavior). Take this seriously even during 0.x — downstream decides whether to change their code based on it |
| `minor` | New functionality (a new component, a new preset, a new export) |
| `patch` | Bug fixes, style tweaks |

### 2. Commit and merge into master

```bash
git add -A
git commit -m "feat: ..."      # write the commit message in detailed markdown
# then a PR / direct merge into master
```

### 3. Consume the changeset

```bash
pnpm changeset:version
```

It does three things: merges all pending changesets into the version's change notes → bumps the version in `package.json` → writes CHANGELOG.md, and **deletes the consumed changeset files**.

The version number is decided by the highest level among all pending changesets (for example, if the highest of 9 changesets is minor → `0.3.0` → `0.4.0`).

### 4. Commit the version number

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**Why the commit is manual**: `.changeset/config.json` has `commit: false`, so changeset does not git commit on its own. By convention this commit's message is `chore(release): x.y.z` plus a detailed markdown write-up of what this release contains.

### 5. Publish to npm and create the local tag

```bash
pnpm release
```

This is `changeset publish`, in order:

1. Run `prepublishOnly`: `pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. Publish to npm (`npm publish`)
3. **Locally** create the tag `@lh-ui/share@x.y.z` (create only; do not push)

**Prerequisite**: `npm login` has been done. This is a credential operation; the AI does not do it for you.

**Note that prepublishOnly only runs three verifications** — test / lint / typecheck / verify:theme must be run explicitly by hand before the release (see [the full verification checklist](/development/verification#running-the-whole-verification-suite)).

### 6. Push and archive

```bash
pnpm release:push
```

Pushes master + this version's tag to `github-lhgb`, automatically triggering `.github/workflows/release.yml`.

## CI archival (release.yml)

```
the tarball already published on npm
  → create the GitHub Release (attaching lh-ui-share-<version>.tgz, installable offline via npm i ./xxx.tgz)
  → push the tag to Gitee
  → call the Gitee API to create a release (the body includes the GitHub tgz download link)
```

**Key design**: release.yml **does not rebuild** — the published package is taken straight from the tarball already on npm, byte-identical to what users get from `npm i`. The build and the two verify passes each run once locally via `pnpm release` (prepublishOnly) and once in `ci.yml`.

This way, rebuilding an early historical version does not fail because an old commit lacks `pnpm-lock.yaml` or a script — **just push the missing tag to GitHub** and the same flow archives it automatically.

## Downstream follow-up (red line 5)

**Hard constraint on release order: share is released first, the UI libraries follow.**

After share 0.4.0 is published:

```bash
# in the lh-ui-plus repo
pnpm up @lh-ui/share@0.4.0
pnpm test          # regression

# in the lh-ui-vue2 repo
pnpm up @lh-ui/share@0.4.0
pnpm test          # regression
```

Only then does `pnpm verify:versions` pass again (before the release, both sibling repos' dependency ranges are still `^0.3.0`, which is expected).

## Caveats

- **Push to GitHub only (`github-lhgb`)**; **never push tags to Gitee manually** — Gitee's tags / releases are handled uniformly by release.yml, and double-writing conflicts.
- **`npm login` is a manual step**: if `npm whoami` returns 401 you are not logged in — log in first, then `pnpm release`.
- **Rebuilding a historical version**: `git push github-lhgb @lh-ui/share@0.2.0` is enough; release.yml is idempotent (if the Release already exists, it only re-uploads the tarball). If release creation fails, rerun it from the Actions page with `workflow_dispatch`, passing the tag.
- **Gitee releases depend on the Secret `GITEE_TOKEN`** (a Gitee personal access token with the releases scope), configured in the GitHub repo's Settings → Secrets.
- **Do not modify source mid-release**: `pnpm release`'s prepublishOnly rebuilds, so the working tree should be clean at that point.
- **A 0.3.0 historical leftover**: the version number back then was folded into a fix commit (`791ff32`), with no standalone `chore(release)` commit. From this release on the convention is restored; history is not rewritten.

## Deployment (another repo)

The docs site is deployed to the family nginx; the contract lives in `lh-ui/docs/部署/nginx-lhui.conf.md` (**another repository**): add `location ^~ /lhui/share/` and update the site list from eight to nine. This repo is only responsible for making the `pnpm docs:build` output deployable.

## Related documentation

- [Command reference](/development/commands)
- [Verification system](/development/verification)
- [Build and tooling scripts](/development/scripts)
- [Contribution guide](/development/contribution)
- [How each port consumes it](/guide/consumption) — how downstream follows a new version
