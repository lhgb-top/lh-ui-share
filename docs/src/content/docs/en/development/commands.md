---
title: Command reference
description: 'The full table of pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release'
---

All development tasks are exposed through the root `package.json` scripts; the package manager is fixed to `pnpm`.

## Build

| Task | Command | Output / purpose |
| --- | --- | --- |
| Build | `pnpm build` | `es/` + `lib/` (preserveModules mirrored structure) + styles + dts + `sync:exports` |
| Style artifacts | `pnpm build:styles` | `dist/theme/` (light and dark theme css) + `dist/styles/` (full aggregation) |
| dts | `pnpm build:dts` | Type declarations emitted directly by `tsc` mirroring the source |

`pnpm build` is the complete pipeline and already includes `build:styles` and `build:dts`. **Note**: `sync:exports` **rewrites the `exports` field of `package.json`** — after changing the source directory structure you must run a full build once, otherwise downstream `pnpm up` hits MODULE_NOT_FOUND.

## Test and quality

| Task | Command | Purpose |
| --- | --- | --- |
| Unit tests | `pnpm test` | vitest, `tests/unit/` (**the single copy of core unit tests**, shared by all three libraries) |
| Lint | `pnpm lint` | eslint; scans only `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| Types | `pnpm typecheck` | tsc; include covers only `src/**/*` |

## Verification

| Task | Command | Purpose |
| --- | --- | --- |
| dts verification | `pnpm verify:dts` | Verifies the output dts matches the source types |
| scss verification | `pnpm verify:styles` | Six checks (below) |
| Theme contrast | `pnpm verify:theme` | AA 4.5:1 gate; reads the `es/` output (**requires `pnpm build` first**) |
| Version consistency | `pnpm verify:versions` | Each UI library's dependency range covers share's current version |

### The six verify:styles checks

1. **EP palette** — color-value shade / semantic compliance
2. **var fallback** — every `var(--lh-*)` in a component must carry a fallback value
3. **@use tokens** — component scss must import tokens through `@use`, not reference hex literals
4. **Aggregation consistency** — `styles/index.scss` matches the component-directory scan result (guards against missed aggregation)
5. **Transition class names single-sourced** — bare `-enter-from` / `-leave-from` is forbidden; always use the [transition mixins](/reference/transition-mixins)
6. **Dark accessibility** — tokens baked with light values at compile time have an override in `var-dark.scss` (see [Dark mode](/theme/dark-mode))

## Release

| Task | Command | Purpose |
| --- | --- | --- |
| Write changes | `pnpm changeset` | Interactively generates `.changeset/*.md` |
| Consume changeset | `pnpm changeset:version` | Bumps the version, writes CHANGELOG, deletes the pending changesets |
| Publish | `pnpm release` | `changeset publish`: runs `prepublishOnly` (build + verify:dts + verify:styles), publishes to npm, then creates the local tag |
| Push for archival | `pnpm release:push` | Pushes master + this tag to GitHub, triggering automatic archival |

The full release process is in [Release process](/development/release).

## Docs site

| Task | Command | Purpose |
| --- | --- | --- |
| Data generation | `pnpm docs:data` | `scripts/gen-docs-data.mjs` parses tokens / icons / class names → `docs/src/data/*.json` |
| Local development | `pnpm docs:dev` | Astro dev server (`http://localhost:4321/lhui/share/`) |
| Build | `pnpm docs:build` | Production build into `docs/dist/` |
| Preview | `pnpm docs:preview` | Preview the built output |

**Note**: `pnpm docs:data` is idempotent and carries count assertions (light 185 / dark 118 / SCSS 183 / icons 37 / class lists 58); a mismatch in the parsed counts throws directly.

## Typical workflows

### Changing a core component

```bash
pnpm test                                    # run the unit tests (write them first)
pnpm lint && pnpm typecheck                  # quality
pnpm build                                   # full build (including sync:exports)
pnpm verify:dts && pnpm verify:styles        # output and style verification
pnpm changeset                               # write the changeset
git add -A && git commit                     # commit (merge into master afterwards)
```

### Changing styles

```bash
# only styles/ changed; no need to run the js part of the build
pnpm verify:styles                           # the six checks
pnpm build:styles                            # generate the dist output
pnpm docs:data                               # refresh the token-table data (only needed when tokens changed)
```

### Adding a new component

```bash
# 1. the triplet
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. add the export to src/core/index.ts
# 3. verify
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports generates the new exports keys
pnpm verify:dts && pnpm verify:styles
# 4. changeset (minor: new component)
pnpm changeset
```

**Key point**: without running `sync:exports`, the npm side has no matching exports key — before a release you must run the full `pnpm build`. After adding `styles/<name>/index.scss`, both ports' build scripts pick it up automatically (each scans its own component directory), but share **must** contain the matching scss, otherwise that component gets no style artifact on one of the ports (a silent skip).

## What CI runs

`.github/workflows/ci.yml` runs on every PR / push to master: install → lint → typecheck → test → build → verify:dts → verify:styles (+ `docs:build` after the E-batch).

**Not run**: `verify:theme` (the contrast gate, guarded manually on release) and `verify:versions` (version consistency, handled downstream after a release).

## Dependencies and toolchain

- Package manager: `pnpm` (the lockfile must be committed)
- Build: `vite` + `rollup` (preserveModules)
- Types: `tsc` (`tsconfig.build.json` emits dts mirroring the source)
- Tests: `vitest`
- Styles: `sass` (`api: 'modern'`)
- Changesets: `@changesets/cli`
- Docs site: `astro` + `@astrojs/starlight`

## Related documentation

- [Verification system](/development/verification) — what each of the six checks looks for
- [Build scripts](/development/scripts) — `build-styles.mjs` / `gen-docs-data.mjs` and friends
- [Release process](/development/release) — the six release steps
- [Contribution guide](/development/contribution) — the red lines and the pre-PR checklist
